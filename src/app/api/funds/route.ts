import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    const { data, error } = await supabase
      .from('cash_funds')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

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

    const body = await request.json()

    // Validate required fields
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (!body.goal_cents || typeof body.goal_cents !== 'number') {
      return NextResponse.json({ error: 'Goal (in cents) is required' }, { status: 400 })
    }

    if (!body.fund_type || typeof body.fund_type !== 'string') {
      return NextResponse.json({ error: 'Fund type is required' }, { status: 400 })
    }

    // Create the fund
    const fundData = {
      user_id: user.id,
      title: body.title,
      description: body.description || null,
      goal_cents: body.goal_cents,
      fund_type: body.fund_type,
      is_active: true,
    }

    const { data, error } = await supabase.from('cash_funds').insert(fundData as any).select()

    if (error) {
      throw error
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Funds POST error:', error)
    return NextResponse.json({ error: 'Failed to create fund' }, { status: 500 })
  }
}
