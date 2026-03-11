import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthorized, unauthorized, getAdminSupabase } from '@/lib/admin-api'

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorized()

  const supabase = getAdminSupabase()
  const { searchParams } = new URL(req.url)
  const tab = searchParams.get('tab') || 'contributions'
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = (page - 1) * limit

  if (tab === 'merch') {
    let query = supabase
      .from('merch_orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(`customer_email.ilike.%${search}%,stripe_session_id.ilike.%${search}%,item_title.ilike.%${search}%`)
    }

    const { data, count, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Summary stats
    const allOrders = await supabase.from('merch_orders').select('amount_total, status')
    const totalRevenue = (allOrders.data || []).reduce((s: number, o: any) => s + (o.amount_total || 0), 0)

    return NextResponse.json({
      orders: data || [],
      total: count || 0,
      page,
      limit,
      summary: { totalRevenue, totalOrders: allOrders.data?.length || 0 },
    })
  }

  // Contributions tab
  let query = supabase
    .from('contributions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.or(`contributor_name.ilike.%${search}%,stripe_payment_id.ilike.%${search}%`)
  }

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Summary
  const allContribs = await supabase.from('contributions').select('amount_cents, status')
  const totalAmount = (allContribs.data || [])
    .filter((c: any) => c.status === 'completed')
    .reduce((s: number, c: any) => s + (c.amount_cents || 0), 0)

  return NextResponse.json({
    contributions: data || [],
    total: count || 0,
    page,
    limit,
    summary: { totalAmount, totalContributions: allContribs.data?.length || 0 },
  })
}
