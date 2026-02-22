/**
 * SSRF protection: blocks requests to private/internal IP ranges.
 * Used by the scraper to prevent server-side request forgery.
 */

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',    // GCP metadata
  'metadata.google',
])

/**
 * Check if a hostname resolves to a private/internal IP range.
 * Returns true if the URL is safe to fetch, false if it should be blocked.
 */
export function isUrlSafeToFetch(url: string): { safe: boolean; reason?: string } {
  try {
    const urlObj = new URL(url)

    // Only allow HTTP/HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { safe: false, reason: 'Only HTTP and HTTPS protocols are allowed' }
    }

    const hostname = urlObj.hostname.toLowerCase()

    // Block known dangerous hostnames
    if (BLOCKED_HOSTNAMES.has(hostname)) {
      return { safe: false, reason: 'Blocked hostname' }
    }

    // Block IP addresses in private ranges
    if (isPrivateIp(hostname)) {
      return { safe: false, reason: 'Private IP addresses are not allowed' }
    }

    // Block AWS/cloud metadata endpoints
    if (hostname === '169.254.169.254' || hostname.endsWith('.internal')) {
      return { safe: false, reason: 'Cloud metadata endpoints are not allowed' }
    }

    return { safe: true }
  } catch {
    return { safe: false, reason: 'Invalid URL' }
  }
}

/**
 * Check if a string is a private/reserved IP address.
 */
function isPrivateIp(hostname: string): boolean {
  // IPv6 loopback
  if (hostname === '::1' || hostname === '[::1]') return true

  // Check if it looks like an IP address
  const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (!ipv4Match) return false

  const [, a, b, c, d] = ipv4Match.map(Number)

  // 127.0.0.0/8 — loopback
  if (a === 127) return true

  // 10.0.0.0/8 — private
  if (a === 10) return true

  // 172.16.0.0/12 — private
  if (a === 172 && b >= 16 && b <= 31) return true

  // 192.168.0.0/16 — private
  if (a === 192 && b === 168) return true

  // 169.254.0.0/16 — link-local (AWS metadata lives here)
  if (a === 169 && b === 254) return true

  // 0.0.0.0/8 — current network
  if (a === 0) return true

  // 100.64.0.0/10 — shared address space (CGNAT)
  if (a === 100 && b >= 64 && b <= 127) return true

  // 198.18.0.0/15 — benchmark testing
  if (a === 198 && (b === 18 || b === 19)) return true

  return false
}
