import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profile_id')

    if (!profileId || typeof profileId !== 'string') {
      return NextResponse.json({ error: 'profile_id query parameter is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('encouragements')
      .select('*')
      .eq('profile_id', profileId)
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Encouragements GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch encouragements' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.profile_id || typeof body.profile_id !== 'string') {
      return NextResponse.json({ error: 'profile_id is required' }, { status: 400 })
    }

    if (!body.author_name || typeof body.author_name !== 'string') {
      return NextResponse.json({ error: 'author_name is required' }, { status: 400 })
    }

    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Create the encouragement
    const encouragementData = {
      profile_id: body.profile_id,
      author_name: body.author_name,
      message: body.message,
      is_public: body.is_public ?? true,
    }

    const { data, error } = await supabase
      .from('encouragements')
      .insert(encouragementData as any)
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Encouragements POST error:', error)
    return NextResponse.json({ error: 'Failed to create encouragement' }, { status: 500 })
  }
}
