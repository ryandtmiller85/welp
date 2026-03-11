import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthorized, unauthorized, getAdminSupabase } from '@/lib/admin-api'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminAuthorized(req)) return unauthorized()

  const { id } = await params
  const supabase = getAdminSupabase()

  const [profile, items, funds, contributions, encouragements, clicks] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('registry_items').select('*').eq('user_id', id).order('sort_order'),
    supabase.from('cash_funds').select('*').eq('user_id', id).order('created_at'),
    supabase.from('contributions').select('*').eq('profile_id', id).order('created_at', { ascending: false }),
    supabase.from('encouragements').select('*').eq('profile_id', id).order('created_at', { ascending: false }),
    supabase.from('click_events').select('*').eq('profile_id', id).order('created_at', { ascending: false }).limit(50),
  ])

  if (profile.error) {
    return NextResponse.json({ error: 'Registry not found' }, { status: 404 })
  }

  return NextResponse.json({
    profile: profile.data,
    items: items.data || [],
    funds: funds.data || [],
    contributions: contributions.data || [],
    encouragements: encouragements.data || [],
    clicks: clicks.data || [],
  })
}
