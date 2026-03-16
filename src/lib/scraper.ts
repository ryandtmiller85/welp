import * as cheerio from 'cheerio'
import { detectRetailer } from '@/lib/utils'
import { isUrlSafeToFetch } from '@/lib/ssrf-guard'

export interface ScrapedProduct {
  title: string | null
  description: string | null
  imageUrl: string | null
  priceCents: number | null
  retailer: string | null
  sourceUrl: string
}

interface SchemaOrgProduct {
  name?: string
  description?: string
  image?: string | string[]
  offers?: {
    price?: string | number
    priceCurrency?: string
  } | {
    price?: string | number
    priceCurrency?: string
  }[]
  offers_array?: {
    price?: string | number
    priceCurrency?: string
  }[]
}

function parsePriceString(priceStr: string | undefined | null): number | null {
  if (!priceStr) return null

  const cleanPrice = String(priceStr).replace(/[^\d.]/g, '')
  const parsed = parseFloat(cleanPrice)

  if (isNaN(parsed)) return null

  // Convert to cents (assume input is in dollars)
  return Math.round(parsed * 100)
}

function normalizeImageUrl(imageUrl: string | undefined | null, sourceUrl: string): string | null {
  if (!imageUrl) return null

  try {
    // If it's a relative URL, resolve it
    if (imageUrl.startsWith('/')) {
      const sourceUrlObj = new URL(sourceUrl)
      return new URL(imageUrl, sourceUrlObj.origin).toString()
    }

    // If it's already absolute, validate it
    new URL(imageUrl)
    return imageUrl
  } catch {
    return null
  }
}

function extractSchemaOrgData(html: string, sourceUrl: string): Partial<ScrapedProduct> {
  try {
    const jsonLdScripts = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([^<]*)<\/script>/gi)

    if (!jsonLdScripts) return {}

    for (const script of jsonLdScripts) {
      try {
        const jsonStr = script.replace(/<[^>]*>/g, '')
        const data = JSON.parse(jsonStr) as SchemaOrgProduct

        if (!data.name) continue

        // Get offers (could be object or array)
        let offers = data.offers
        if (!Array.isArray(offers)) {
          offers = offers ? [offers] : []
        }

        const firstOffer = offers?.[0]

        return {
          title: data.name || null,
          description: data.description || null,
          imageUrl: normalizeImageUrl(
            Array.isArray(data.image) ? data.image[0] : data.image,
            sourceUrl
          ),
          priceCents: parsePriceString(
            typeof firstOffer?.price === 'number'
              ? String(firstOffer.price)
              : firstOffer?.price
          ),
        }
      } catch {
        // Continue to next JSON-LD block
        continue
      }
    }
  } catch {
    // Continue to Open Graph
  }

  return {}
}

function extractOpenGraphData(html: string, sourceUrl: string): Partial<ScrapedProduct> {
  const $ = cheerio.load(html)

  const result: Partial<ScrapedProduct> = {}

  // og:title
  const ogTitle = $('meta[property="og:title"]').attr('content')
  if (ogTitle) result.title = ogTitle

  // og:description
  const ogDescription = $('meta[property="og:description"]').attr('content')
  if (ogDescription) result.description = ogDescription

  // og:image
  const ogImage = $('meta[property="og:image"]').attr('content')
  if (ogImage) result.imageUrl = normalizeImageUrl(ogImage, sourceUrl)

  // og:price:amount
  const ogPrice = $('meta[property="og:price:amount"]').attr('content')
  if (ogPrice) result.priceCents = parsePriceString(ogPrice)

  return result
}

function extractFallbackData(html: string, sourceUrl: string): Partial<ScrapedProduct> {
  const $ = cheerio.load(html)

  const result: Partial<ScrapedProduct> = {}

  // Title: meta description or page title
  if (!result.title) {
    const metaDesc = $('meta[name="description"]').attr('content')
    result.title = metaDesc || $('title').text() || null
  }

  // Image: first og:image or first img tag
  if (!result.imageUrl) {
    const firstImg = $('img').first().attr('src')
    if (firstImg) {
      result.imageUrl = normalizeImageUrl(firstImg, sourceUrl)
    }
  }

  return result
}

/**
 * Amazon-specific: Amazon blocks most scraping. We detect Amazon URLs
 * and extract what we can from the URL structure itself (ASIN, title).
 */
function isAmazonUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname
    return hostname.includes('amazon.com') || hostname.includes('amzn.')
  } catch {
    return false
  }
}

/**
 * Extract Amazon ASIN from various URL formats:
 *  /dp/B0XXXXX, /gp/product/B0XXXXX, /gp/aw/d/B0XXXXX
 */
function extractAmazonAsin(url: string): string | null {
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /\/gp\/aw\/d\/([A-Z0-9]{10})/i,
    /\/product\/([A-Z0-9]{10})/i,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

/**
 * Extract a human-readable product title from Amazon URL slug.
 * e.g. /Chemex-Classic-Pour-Over-Coffeemaker/dp/B000I1WP7W
 *   → "Chemex Classic Pour Over Coffeemaker"
 */
function extractAmazonTitleFromUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname
    // Match the slug before /dp/ or /gp/
    const slugMatch = pathname.match(/^\/([A-Za-z0-9][A-Za-z0-9-]+)\/(?:dp|gp)/)
    if (slugMatch && slugMatch[1]) {
      const slug = slugMatch[1]
      // Skip if it's just an ASIN or too short
      if (/^[A-Z0-9]{10}$/i.test(slug) || slug.length < 4) return null
      // Convert hyphens to spaces and title-case
      return slug
        .split('-')
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    }
  } catch {
    // ignore
  }
  return null
}

/**
 * Construct Amazon product image URL from ASIN.
 * Uses the media CDN pattern that works for most products.
 */
function constructAmazonImageUrl(asin: string): string {
  return `https://m.media-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_SX300_.jpg`
}

async function fetchWithTimeout(url: string, timeoutMs: number = 10000): Promise<string> {
  // SSRF protection: block private IPs, cloud metadata, localhost
  const ssrfCheck = isUrlSafeToFetch(url)
  if (!ssrfCheck.safe) {
    throw new Error(`Blocked: ${ssrfCheck.reason}`)
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'manual', // Don't follow redirects automatically (prevents SSRF via redirect)
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })

    // Handle redirects safely — validate the redirect target
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location) throw new Error('Redirect with no location header')

      const redirectUrl = new URL(location, url).toString()
      const redirectCheck = isUrlSafeToFetch(redirectUrl)
      if (!redirectCheck.safe) {
        throw new Error(`Blocked redirect: ${redirectCheck.reason}`)
      }

      // Follow one redirect only
      const redirectResponse = await fetch(redirectUrl, {
        signal: controller.signal,
        redirect: 'manual',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      })

      if (!redirectResponse.ok && !(redirectResponse.status >= 300 && redirectResponse.status < 400)) {
        throw new Error(`HTTP ${redirectResponse.status}`)
      }

      return await redirectResponse.text()
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.text()
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Clean up SEO-stuffed product titles.
 * Strips common suffixes like " - Amazon.com", " | Walmart", etc.
 */
function cleanProductTitle(title: string | null): string | null {
  if (!title) return null

  let cleaned = title
    // Strip common retailer suffixes
    .replace(/\s*[-–—|:]\s*(Amazon\.com|Amazon|Walmart\.com|Walmart|Target|Best Buy|Wayfair|IKEA|Etsy|Chewy).*$/i, '')
    // Strip "Buy ... at ..." patterns
    .replace(/\s*-\s*Buy\s+.*$/i, '')
    // Strip trailing " - Shop ..." or " | Shop ..."
    .replace(/\s*[-|]\s*Shop\s+.*$/i, '')
    // Strip ".com" from end
    .replace(/\.com\s*$/i, '')
    // Trim excessive whitespace
    .replace(/\s+/g, ' ')
    .trim()

  // If we over-stripped and have nothing useful, fall back to original
  if (cleaned.length < 5) return title.trim()

  return cleaned
}

export async function scrapeProductMetadata(url: string): Promise<ScrapedProduct> {
  try {
    // Validate URL
    const urlObj = new URL(url)
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid URL protocol')
    }

    const retailer = detectRetailer(url)
    const amazon = isAmazonUrl(url)

    // For Amazon: extract what we can from the URL itself first
    // Amazon aggressively blocks server-side scraping, so URL-derived
    // data is our most reliable source
    const amazonAsin = amazon ? extractAmazonAsin(url) : null
    const amazonTitle = amazon ? extractAmazonTitleFromUrl(url) : null
    const amazonImageUrl = amazonAsin ? constructAmazonImageUrl(amazonAsin) : null

    // Fetch HTML with timeout
    let html = ''
    try {
      html = await fetchWithTimeout(url, 10000)
    } catch {
      // If fetch fails entirely (Amazon blocks, timeout, etc.)
      // return what we extracted from the URL
      if (amazon && (amazonTitle || amazonAsin)) {
        return {
          title: amazonTitle || (amazonAsin ? `Amazon Product ${amazonAsin}` : null),
          description: null,
          imageUrl: amazonImageUrl,
          priceCents: null,
          retailer: retailer || 'Amazon',
          sourceUrl: url,
        }
      }
      throw new Error('Failed to fetch URL')
    }

    // Extract data in priority order
    const schemaData = extractSchemaOrgData(html, url)
    const ogData = extractOpenGraphData(html, url)
    const fallbackData = extractFallbackData(html, url)

    // Merge with priority: schema > og > fallback
    const scrapedImage = schemaData.imageUrl || ogData.imageUrl || fallbackData.imageUrl || null
    const scrapedPrice = schemaData.priceCents || ogData.priceCents || fallbackData.priceCents || null

    // For Amazon: discard generic OG images and $0.00 prices (Amazon blocks real data)
    const isGenericAmazonImage = amazon && scrapedImage && (
      scrapedImage.includes('amazon_logo') ||
      scrapedImage.includes('og_image') ||
      scrapedImage.includes('share_image') ||
      !scrapedImage.includes('/images/I/')
    )

    // For Amazon: prefer URL-extracted title over generic scraped titles like "Amazon.com"
    const scrapedTitle = schemaData.title || ogData.title || fallbackData.title || null
    const isGenericAmazonTitle = amazon && scrapedTitle && (
      scrapedTitle === 'Amazon.com' ||
      scrapedTitle.startsWith('Amazon.com:') && scrapedTitle.length < 15 ||
      scrapedTitle === 'Page Not Found'
    )

    const rawTitle = (isGenericAmazonTitle && amazonTitle) ? amazonTitle : (scrapedTitle || amazonTitle || null)

    const merged = {
      title: cleanProductTitle(rawTitle),
      description: schemaData.description || ogData.description || fallbackData.description || null,
      imageUrl: isGenericAmazonImage ? amazonImageUrl : (scrapedImage || amazonImageUrl || null),
      priceCents: (amazon && (!scrapedPrice || scrapedPrice === 0)) ? null : scrapedPrice,
      retailer: retailer || (amazon ? 'Amazon' : null),
      sourceUrl: url,
    }

    return merged
  } catch (error) {
    // Return partial data on error — try URL extraction as fallback
    try {
      const urlObj = new URL(url)
      const amazon = isAmazonUrl(url)
      const asin = amazon ? extractAmazonAsin(url) : null
      const amazonTitle = amazon ? extractAmazonTitleFromUrl(url) : null

      return {
        title: amazonTitle || null,
        description: null,
        imageUrl: asin ? constructAmazonImageUrl(asin) : null,
        priceCents: null,
        retailer: detectRetailer(url) || (amazon ? 'Amazon' : null),
        sourceUrl: url,
      }
    } catch {
      throw new Error('Invalid URL')
    }
  }
}
