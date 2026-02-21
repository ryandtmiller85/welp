import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { RegistryItem } from '@/lib/types/database'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (!body.category || typeof body.category !== 'string') {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    if (!body.priority || typeof body.priority !== 'string') {
      return NextResponse.json({ error: 'Priority is required' }, { status: 400 })
    }

    // Get the next sort_order
    const { data: items } = await supabase
      .from('registry_items')
      .select('sort_order')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: false })
      .limit(1)

    const nextSortOrder = (items?.[0]?.sort_order ?? -1) + 1

    // Create the item
    const itemData = {
      user_id: user.id,
      title: body.title,
      description: body.description || null,
      image_url: body.imageUrl || null,
      source_url: body.sourceUrl || null,
      affiliate_url: body.affiliateUrl || null,
      retailer: body.retailer || null,
      price_cents: body.priceCents || null,
      category: body.category,
      priority: body.priority,
      custom_note: body.customNote || null,
      is_group_gift: body.isGroupGift || false,
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
