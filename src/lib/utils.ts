import { type ClassValue, clsx } from 'clsx'

// Simple clsx-like utility (no need for tailwind-merge for MVP)
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString))
}

export function daysSince(dateString: string): number {
  const eventDate = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - eventDate.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

export function progressPercent(raised: number, goal: number): number {
  if (goal <= 0) return 0
  return Math.min(Math.round((raised / goal) * 100), 100)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function detectRetailer(url: string): string | null {
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    const retailers: Record<string, string> = {
      'amazon.com': 'Amazon',
      'target.com': 'Target',
      'walmart.com': 'Walmart',
      'bestbuy.com': 'Best Buy',
      'ikea.com': 'IKEA',
      'wayfair.com': 'Wayfair',
      'etsy.com': 'Etsy',
      'chewy.com': 'Chewy',
    }
    for (const [domain, name] of Object.entries(retailers)) {
      if (hostname.includes(domain)) return name
    }
    return hostname
  } catch {
    return null
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
