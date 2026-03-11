import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthorized, unauthorized, getAdminSupabase } from '@/lib/admin-api'

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorized()

  const supabase = getAdminSupabase()
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const eventType = searchParams.get('event_type') || ''
  const privacy = searchParams.get('privacy') || ''
  const proxy = searchParams.get('proxy') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = (page - 1) * limit

  let query = supabase
    .from('profiles')
    .select('id, display_name, alias, email, event_type, privacy_level, slug, is_proxy, created_by_user_id, claimed_by_user_id, recipient_name, relationship, created_at', { count: 'exact' })
    .not('slug', 'is', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.or(`display_name.ilike.%${search}%,slug.ilike.%${search}%,alias.ilike.%${search}%`)
  }
  if (eventType) query = query.eq('event_type', eventType)
  if (privacy) query = query.eq('privacy_level', privacy)
  if (proxy === 'true') query = query.eq('is_proxy', true)
  if (proxy === 'false') query = query.eq('is_proxy', false)

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    registries: data || [],
    total: count || 0,
    page,
    limit,
  })
}
