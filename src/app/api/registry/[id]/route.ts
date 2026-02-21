import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // Update the item
    const body = await request.json()
    const { data, error } = await supabase
      .from('registry_items')
      .update(body as any)
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

    // Delete the item
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

    if (body.action === 'claim') {
      const supabase = await createClient()

      // Check if item exists
      const { data: item, error: fetchError } = await supabase
        .from('registry_items')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !item) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 })
      }

      // Check if already claimed
      if ((item as any).status === 'claimed') {
        return NextResponse.json({ error: 'Item is already claimed' }, { status: 400 })
      }

      // Validate claim data
      if (!body.claimed_by_name || typeof body.claimed_by_name !== 'string') {
        return NextResponse.json({ error: 'Claimed by name is required' }, { status: 400 })
      }

      // Update item with claim
      const { data, error } = await supabase
        .from('registry_items')
        .update({
          status: 'claimed',
          claimed_by_name: body.claimed_by_name,
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
