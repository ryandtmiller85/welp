import { NextResponse } from 'next/server'

/**
 * Simple in-memory rate limiter using sliding window.
 * For production at scale, replace with Redis-backed solution.
 * Sufficient for Vercel serverless (per-instance limiting).
 */

interface RateLimitEntry {
  timestamps: number[]
}

const store = new Map<string, RateLimitEntry>()

// Clean up old entries periodically
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanup(windowMs: number) {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  const cutoff = now - windowMs
  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter(t => t > cutoff)
    if (entry.timestamps.length === 0) {
      store.delete(key)
    }
  }
}

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now()
  const cutoff = now - config.windowMs

  cleanup(config.windowMs)

  let entry = store.get(identifier)
  if (!entry) {
    entry = { timestamps: [] }
    store.set(identifier, entry)
  }

  entry.timestamps = entry.timestamps.filter(t => t > cutoff)

  if (entry.timestamps.length >= config.maxRequests) {
    const oldestInWindow = entry.timestamps[0]
    const resetMs = oldestInWindow + config.windowMs - now
    return { allowed: false, remaining: 0, resetMs }
  }

  entry.timestamps.push(now)
  return {
    allowed: true,
    remaining: config.maxRequests - entry.timestamps.length,
    resetMs: config.windowMs,
  }
}

/** Rate limit presets */
export const RATE_LIMITS = {
  authenticated: { maxRequests: 60, windowMs: 60_000 },
  public: { maxRequests: 10, windowMs: 60_000 },
  sensitive: { maxRequests: 10, windowMs: 60_000 },
  anonymous: { maxRequests: 5, windowMs: 60_000 },
} as const

/** Extract identifier from request (user ID or IP) */
export function getRateLimitId(request: Request, userId?: string): string {
  if (userId) return `user:${userId}`
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
  return `ip:${ip}`
}

/** Returns a 429 response */
export function rateLimitResponse(resetMs: number): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil(resetMs / 1000)) },
    }
  )
}
