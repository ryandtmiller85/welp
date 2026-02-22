import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateBody, updateRegistryItemSchema, claimRegistryItemSchema } from '@/lib/validation'
import { checkRateLimit, getRateLimitId, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Check ownership
    const { data: item, error: fetchError } = await supabase
      .from('registry_items')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    if ((item as any).user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Validate and whitelist fields — .strict() rejects unknown fields like user_id, status, claimed_at
    const body = await request.json()
    const validation = validateBody(updateRegistryItemSchema, body)
    if (!validation.success) return validation.response

    const { data, error } = await supabase
      .from('registry_items')
      .update(validation.data)
      .eq('id', id)
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Registry PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update registry item' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Check ownership
    const { data: item, error: fetchError } = await supabase
      .from('registry_items')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    if ((item as any).user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase.from('registry_items').delete().eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Registry DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete registry item' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Rate limit (public endpoint — uses IP)
    const rl = checkRateLimit(getRateLimitId(request), RATE_LIMITS.public)
    if (!rl.allowed) return rateLimitResponse(rl.resetMs)

    if (body.action === 'claim') {
      // Validate claim body
      const validation = validateBody(claimRegistryItemSchema, body)
      if (!validation.success) return validation.response

      const supabase = await createClient()

      const { data: item, error: fetchError } = await supabase
        .from('registry_items')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !item) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 })
      }

      if ((item as any).status === 'claimed') {
        return NextResponse.json({ error: 'Item is already claimed' }, { status: 400 })
      }

      const { data, error } = await supabase
        .from('registry_items')
        .update({
          status: 'claimed',
          claimed_by_name: validation.data.claimed_by_name,
          claimed_at: new Date().toISOString(),
        } as any)
        .eq('id', id)
        .select()

      if (error) {
        throw error
      }

      return NextResponse.json(data[0])
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Registry POST error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
