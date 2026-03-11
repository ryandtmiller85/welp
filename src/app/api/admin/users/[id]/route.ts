import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthorized, unauthorized, getAdminSupabase } from '@/lib/admin-api'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminAuthorized(req)) return unauthorized()

  const { id } = await params
  const supabase = getAdminSupabase()

  const [profile, items, funds, contributions, encouragements, proxyCreated] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('registry_items').select('*').eq('user_id', id).order('created_at', { ascending: false }),
    supabase.from('cash_funds').select('*').eq('user_id', id).order('created_at', { ascending: false }),
    supabase.from('contributions').select('*').eq('profile_id', id).order('created_at', { ascending: false }),
    supabase.from('encouragements').select('*').eq('profile_id', id).order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, display_name, slug, is_proxy, claimed_by_user_id, created_at').eq('created_by_user_id', id).eq('is_proxy', true),
  ])

  if (profile.error) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({
    profile: profile.data,
    items: items.data || [],
    funds: funds.data || [],
    contributions: contributions.data || [],
    encouragements: encouragements.data || [],
    proxyRegistries: proxyCreated.data || [],
  })
}
