import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateBody, createFundSchema } from '@/lib/validation'
import { checkRateLimit, getRateLimitId, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user

    const rl = checkRateLimit(getRateLimitId(request, user.id), RATE_LIMITS.authenticated)
    if (!rl.allowed) return rateLimitResponse(rl.resetMs)

    const { data, error } = await supabase
      .from('cash_funds')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Funds GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch funds' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user

    const rl = checkRateLimit(getRateLimitId(request, user.id), RATE_LIMITS.authenticated)
    if (!rl.allowed) return rateLimitResponse(rl.resetMs)

    const body = await request.json()
    const validation = validateBody(createFundSchema, body)
    if (!validation.success) return validation.response

    const v = validation.data

    let targetUserId = user.id

    if (v.proxyProfileId) {
      const { data: proxyProfile, error: proxyError } = await supabase
        .from('profiles')
        .select('id, created_by_user_id, is_proxy, claimed_by_user_id')
        .eq('id', v.proxyProfileId)
        .eq('is_proxy', true)
        .eq('created_by_user_id', user.id)
        .single() as any

      if (proxyError || !proxyProfile) {
        return NextResponse.json({ error: 'Proxy profile not found or not authorized' }, { status: 403 })
      }

      if (proxyProfile.claimed_by_user_id) {
        return NextResponse.json({ error: 'This registry has been claimed and can no longer be edited' }, { status: 403 })
      }

      targetUserId = proxyProfile.id
    }

    const fundData = {
      user_id: targetUserId,
      title: v.title,
      description: v.description || null,
      goal_cents: v.goal_cents,
      fund_type: v.fund_type,
      is_active: true,
    }

    const { data, error } = await supabase.from('cash_funds').insert(fundData as any).select()

    if (error) throw error

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Funds POST error:', error)
    return NextResponse.json({ error: 'Failed to create fund' }, { status: 500 })
  }
}
