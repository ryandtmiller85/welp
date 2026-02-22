import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getRateLimitId, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'
import { z } from 'zod'
import { validateBody } from '@/lib/validation'

const clickEventSchema = z.object({
  url: z.string().url().max(2048),
  retailer: z.string().max(100).optional().nullable(),
  isAffiliate: z.boolean().optional().default(false),
  registryItemId: z.string().uuid().optional().nullable(),
  profileId: z.string().uuid().optional().nullable(),
  source: z.enum(['registry', 'catalog', 'marketplace_search']).default('registry'),
})

/**
 * POST /api/track — Log an outbound click event.
 * Fire-and-forget from the client — response is not critical.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP (public endpoint)
    const rl = checkRateLimit(getRateLimitId(request), RATE_LIMITS.public)
    if (!rl.allowed) return rateLimitResponse(rl.resetMs)

    const body = await request.json()
    const validation = validateBody(clickEventSchema, body)
    if (!validation.success) return validation.response

    const v = validation.data

    // Hash the IP for dedup without storing PII
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
    const ipHash = await hashString(ip)

    const userAgent = request.headers.get('user-agent')?.slice(0, 500) || null

    const supabase = await createClient()

    await supabase.from('click_events').insert({
      url: v.url,
      retailer: v.retailer || null,
      is_affiliate: v.isAffiliate,
      registry_item_id: v.registryItemId || null,
      profile_id: v.profileId || null,
      source: v.source,
      ip_hash: ipHash,
      user_agent: userAgent,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    // Don't fail loudly — tracking is non-critical
    console.error('Click tracking error:', error)
    return NextResponse.json({ ok: true })
  }
}

async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
