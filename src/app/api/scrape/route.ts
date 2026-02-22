import { NextRequest, NextResponse } from 'next/server'
import { scrapeProductMetadata } from '@/lib/scraper'
import { createClient } from '@/lib/supabase/server'
import { validateBody, scrapeUrlSchema } from '@/lib/validation'
import { checkRateLimit, getRateLimitId, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit (sensitive — external HTTP calls)
    const rl = checkRateLimit(getRateLimitId(request, session.user.id), RATE_LIMITS.sensitive)
    if (!rl.allowed) return rateLimitResponse(rl.resetMs)

    const body = await request.json()

    // Validate with Zod
    const validation = validateBody(scrapeUrlSchema, body)
    if (!validation.success) return validation.response

    // SSRF protection is handled inside scrapeProductMetadata via ssrf-guard.ts
    const metadata = await scrapeProductMetadata(validation.data.url)

    return NextResponse.json(metadata)
  } catch (error) {
    console.error('Scrape error:', error)
    return NextResponse.json({ error: 'Failed to scrape URL' }, { status: 500 })
  }
}
