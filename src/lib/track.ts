/**
 * Client-side click tracking for affiliate and outbound product links.
 * Fire-and-forget — uses navigator.sendBeacon for reliability
 * (survives page navigation when user clicks an external link).
 */

interface ClickEvent {
  url: string
  retailer?: string | null
  isAffiliate?: boolean
  registryItemId?: string | null
  profileId?: string | null
  source?: 'registry' | 'catalog' | 'marketplace_search'
}

export function trackClick(event: ClickEvent): void {
  try {
    const payload = JSON.stringify({
      url: event.url,
      retailer: event.retailer || null,
      isAffiliate: event.isAffiliate || false,
      registryItemId: event.registryItemId || null,
      profileId: event.profileId || null,
      source: event.source || 'registry',
    })

    // sendBeacon is fire-and-forget and survives the page unloading
    // (which happens when the user clicks an external link)
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' })
      navigator.sendBeacon('/api/track', blob)
    } else {
      // Fallback for environments without sendBeacon
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Silently ignore — tracking is non-critical
      })
    }
  } catch {
    // Never let tracking break the user experience
  }
}
