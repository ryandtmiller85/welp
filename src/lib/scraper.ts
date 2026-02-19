import * as cheerio from 'cheerio'
import { detectRetailer } from 'A/lib/utils'

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

async function fetchWithTimeout(url: string, timeoutMs: number = 10000): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.text()
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function scrapeProductMetadata(url: string): Promise<ScrapedProduct> {
  try {
    // Validate URL
    const urlObj = new URL(url)
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid URL protocol')
    }

    // Fetch HTML with timeout
    const html = await fetchWithTimeout(url, 10000)

    // Extract data in priority order
    const schemaData = extractSchemaOrgData(html, url)
    const ogData = extractOpenGraphData(html, url)
    const fallbackData = extractFallbackData(html, url)

    // Merge with priority: schema > og > fallback
    const merged = {
      title: schemaData.title || ogData.title || fallbackData.title || null,
      description: schemaData.description || ogData.description || fallbackData.description || null,
      imageUrl: schemaData.imageUrl || ogData.imageUrl || fallbackData.imageUrl || null,
      priceCents: schemaData.priceCents || ogData.priceCents || fallbackData.priceCents || null,
      retailer: detectRetailer(url),
      sourceUrl: url,
    }

    return merged
  } catch (error) {
    // Return partial data on error
    try {
      const urlObj = new URL(url)
      return {
        title: null,
        description: null,
        imageUrl: null,
        priceCents: null,
        retailer: detectRetailer(url),
        sourceUrl: url,
      }
    } catch {
      throw new Error('Invalid URL')
    }
  }
}
