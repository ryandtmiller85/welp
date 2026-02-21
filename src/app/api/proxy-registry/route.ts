import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET — return all proxy registries the current user is managing
export async function GET() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get proxy profiles created by this user
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('created_by_user_id', session.user.id)
    .eq('is_proxy', true)
    .order('created_at', { ascending: false }) as any

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // For each proxy profile, get item counts
  const profilesWithCounts = await Promise.all(
    (profiles || []).map(async (profile: any) => {
      const { count: itemCount } = await supabase
        .from('registry_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id) as any

      const { count: fundCount } = await supabase
        .from('cash_funds')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('is_active', true) as any

      return {
        ...profile,
        item_count: itemCount || 0,
        fund_count: fundCount || 0,
      }
    })
  )

  return NextResponse.json(profilesWithCounts)
}

// POST — create a new proxy registry
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    recipientName,
    relationship,
    recipientEmail,
    eventType,
    storyText,
    city,
    state,
  } = body

  if (!recipientName || !relationship) {
    return NextResponse.json(
      { error: 'Recipient name and relationship are required' },
      { status: 400 }
    )
  }

  // Generate a unique ID for the proxy profile
  // Since profiles.id references auth.users(id), proxy profiles need a different approach:
  // We'll use a UUID that's NOT in auth.users. But wait — the FK constraint means
  // profiles.id MUST exist in auth.users. So we need to create the profile differently.
  //
  // Solution: Create a "phantom" profile that's NOT linked to auth.users by using
  // a separate table approach. BUT — to keep things simple and reuse all existing
  // infrastructure (items, funds, slug page), we'll insert directly and handle
  // the FK constraint by using the Supabase service role or a DB function.
  //
  // ACTUALLY — the cleanest approach: use the Supabase admin client to bypass RLS
  // and the FK constraint. But we don't have the service key in the browser.
  //
  // SIMPLEST MVP: The proxy profile uses the ADVOCATE's user ID as the profile ID.
  // This means the advocate can have their own registry AND manage proxy ones.
  // BUT profiles.id is a PK — one per user.
  //
  // REVISED APPROACH: Create a new UUID and use a DB function that bypasses the FK.
  // OR — just generate a UUID and insert with the advocate's existing profile as parent.
  //
  // BEST APPROACH: Create a separate proxy_registries table that mirrors profile fields
  // but doesn't have the auth.users FK constraint. Then the [slug] page checks both tables.
  //
  // ACTUALLY SIMPLEST: We'll use Supabase's RPC to insert the profile, bypassing the FK
  // check with a SECURITY DEFINER function.

  // For now, let's use a Supabase RPC function approach.
  // First, try creating via RPC:
  const proxyId = crypto.randomUUID()
  const slug = recipientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + proxyId.slice(0, 6)

  const { data, error } = await supabase.rpc('create_proxy_profile', {
    p_id: proxyId,
    p_created_by: session.user.id,
    p_recipient_name: recipientName,
    p_recipient_email: recipientEmail || null,
    p_relationship: relationship,
    p_event_type: eventType || 'other',
    p_story_text: storyText || null,
    p_city: city || null,
    p_state: state || null,
    p_slug: slug,
  }) as any

  if (error) {
    console.error('Proxy profile creation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    id: proxyId,
    slug,
    message: 'Proxy registry created successfully',
  })
}
