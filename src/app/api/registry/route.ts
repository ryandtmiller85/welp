import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateBody, createRegistryItemSchema } from '@/lib/validation'
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

    // Rate limit
    const rl = checkRateLimit(getRateLimitId(request, user.id), RATE_LIMITS.authenticated)
    if (!rl.allowed) return rateLimitResponse(rl.resetMs)

    const { data, error } = await supabase
      .from('registry_items')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Registry GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch registry items' }, { status: 500 })
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

    // Rate limit
    const rl = checkRateLimit(getRateLimitId(request, user.id), RATE_LIMITS.authenticated)
    if (!rl.allowed) return rateLimitResponse(rl.resetMs)

    const body = await request.json()

    // Validate with Zod
    const validation = validateBody(createRegistryItemSchema, body)
    if (!validation.success) return validation.response

    const v = validation.data

    // Determine target user_id (own profile or proxy profile)
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

    // Get the next sort_order
    const { data: items } = await supabase
      .from('registry_items')
      .select('sort_order')
      .eq('user_id', targetUserId)
      .order('sort_order', { ascending: false })
      .limit(1)

    const nextSortOrder = (items?.[0]?.sort_order ?? -1) + 1

    const itemData = {
      user_id: targetUserId,
      title: v.title,
      description: v.description || null,
      image_url: v.imageUrl || null,
      source_url: v.sourceUrl || null,
      affiliate_url: v.affiliateUrl || null,
      retailer: v.retailer || null,
      price_cents: v.priceCents || null,
      category: v.category,
      priority: v.priority,
      custom_note: v.customNote || null,
      is_group_gift: v.isGroupGift || false,
      sort_order: nextSortOrder,
    }

    const { data, error } = await supabase.from('registry_items').insert(itemData as any).select()

    if (error) {
      throw error
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Registry POST error:', error)
    return NextResponse.json({ error: 'Failed to create registry item' }, { status: 500 })
  }
}
