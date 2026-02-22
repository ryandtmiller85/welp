import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateBody, createEncouragementSchema } from '@/lib/validation'
import { checkRateLimit, getRateLimitId, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profile_id')

    if (!profileId || typeof profileId !== 'string') {
      return NextResponse.json({ error: 'profile_id query parameter is required' }, { status: 400 })
    }

    // Rate limit (public endpoint)
    const rl = checkRateLimit(getRateLimitId(request), RATE_LIMITS.public)
    if (!rl.allowed) return rateLimitResponse(rl.resetMs)

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('encouragements')
      .select('*')
      .eq('profile_id', profileId)
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Encouragements GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch encouragements' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit (anonymous endpoint — tighter limits)
    const rl = checkRateLimit(getRateLimitId(request), RATE_LIMITS.anonymous)
    if (!rl.allowed) return rateLimitResponse(rl.resetMs)

    const body = await request.json()

    // Validate with Zod
    const validation = validateBody(createEncouragementSchema, body)
    if (!validation.success) return validation.response

    const v = validation.data

    const supabase = await createClient()

    const encouragementData = {
      profile_id: v.profile_id,
      author_name: v.author_name,
      message: v.message,
      is_public: v.is_public,
    }

    const { data, error } = await supabase
      .from('encouragements')
      .insert(encouragementData as any)
      .select()

    if (error) throw error

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Encouragements POST error:', error)
    return NextResponse.json({ error: 'Failed to create encouragement' }, { status: 500 })
  }
}
