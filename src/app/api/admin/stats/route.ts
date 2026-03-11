import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthorized, unauthorized, getAdminSupabase } from '@/lib/admin-api'

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorized()

  const supabase = getAdminSupabase()
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Run all queries in parallel
  const [
    usersTotal,
    usersThisWeek,
    registriesActive,
    contributionsTotal,
    merchOrders,
    clicksThisWeek,
    recentSignups,
    recentContributions,
  ] = await Promise.all([
    // Total users
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_proxy', false),
    // Users this week
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_proxy', false).gte('created_at', weekAgo.toISOString()),
    // Active registries (non-proxy with slugs)
    supabase.from('profiles').select('*', { count: 'exact', head: true }).not('slug', 'is', null).in('privacy_level', ['public', 'link_only']),
    // Total contributions
    supabase.from('contributions').select('amount_cents').eq('status', 'completed'),
    // Merch orders
    supabase.from('merch_orders').select('status'),
    // Clicks this week
    supabase.from('click_events').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
    // Signups over last 30 days (for chart)
    supabase.from('profiles').select('created_at').eq('is_proxy', false).gte('created_at', monthAgo.toISOString()).order('created_at'),
    // Contributions over last 30 days (for chart)
    supabase.from('contributions').select('amount_cents, created_at').eq('status', 'completed').gte('created_at', monthAgo.toISOString()).order('created_at'),
  ])

  const totalContributions = (contributionsTotal.data || []).reduce(
    (sum: number, c: any) => sum + (c.amount_cents || 0), 0
  )

  const orders = merchOrders.data || []
  const pendingOrders = orders.filter((o: any) => o.status === 'paid' || o.status === 'fulfilling').length
  const fulfilledOrders = orders.filter((o: any) => o.status === 'fulfilled' || o.status === 'shipped').length

  // Build daily signup chart data
  const signupsByDay: Record<string, number> = {}
  for (const p of recentSignups.data || []) {
    const day = (p as any).created_at?.slice(0, 10)
    if (day) signupsByDay[day] = (signupsByDay[day] || 0) + 1
  }

  // Build daily contributions chart data
  const contribByDay: Record<string, number> = {}
  for (const c of recentContributions.data || []) {
    const day = (c as any).created_at?.slice(0, 10)
    if (day) contribByDay[day] = (contribByDay[day] || 0) + ((c as any).amount_cents || 0)
  }

  // Generate last 30 days for consistent chart
  const chartDays: string[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    chartDays.push(d.toISOString().slice(0, 10))
  }

  return NextResponse.json({
    cards: {
      totalUsers: usersTotal.count || 0,
      newUsersThisWeek: usersThisWeek.count || 0,
      activeRegistries: registriesActive.count || 0,
      totalContributionsCents: totalContributions,
      merchPending: pendingOrders,
      merchFulfilled: fulfilledOrders,
      merchTotal: orders.length,
      clicksThisWeek: clicksThisWeek.count || 0,
    },
    charts: {
      signups: chartDays.map((day) => ({ date: day, count: signupsByDay[day] || 0 })),
      contributions: chartDays.map((day) => ({ date: day, cents: contribByDay[day] || 0 })),
    },
  })
}
