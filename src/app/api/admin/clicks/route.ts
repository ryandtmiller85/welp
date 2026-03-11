import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthorized, unauthorized, getAdminSupabase } from '@/lib/admin-api'

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorized()

  const supabase = getAdminSupabase()
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [allClicks, weekClicks, recentClicks] = await Promise.all([
    supabase.from('click_events').select('retailer, source, created_at'),
    supabase.from('click_events').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
    supabase.from('click_events').select('url, retailer, source, profile_id, created_at').order('created_at', { ascending: false }).limit(100),
  ])

  const clicks = allClicks.data || []

  // Clicks by retailer
  const byRetailer: Record<string, number> = {}
  for (const c of clicks) {
    const r = (c as any).retailer || 'unknown'
    byRetailer[r] = (byRetailer[r] || 0) + 1
  }

  // Clicks by day (last 30 days)
  const byDay: Record<string, number> = {}
  for (const c of clicks) {
    const day = (c as any).created_at?.slice(0, 10)
    if (day && new Date(day) >= monthAgo) {
      byDay[day] = (byDay[day] || 0) + 1
    }
  }

  const chartDays: string[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    chartDays.push(d.toISOString().slice(0, 10))
  }

  return NextResponse.json({
    totalClicks: clicks.length,
    clicksThisWeek: weekClicks.count || 0,
    byRetailer,
    clicksByDay: chartDays.map((day) => ({ date: day, count: byDay[day] || 0 })),
    recentClicks: recentClicks.data || [],
  })
}
