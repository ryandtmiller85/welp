'use client'

import { useAdminFetch } from '@/components/admin/use-admin-fetch'
import { Users, ClipboardList, DollarSign, ShoppingBag, MousePointerClick } from 'lucide-react'

interface StatsData {
  cards: {
    totalUsers: number
    newUsersThisWeek: number
    activeRegistries: number
    totalContributionsCents: number
    merchPending: number
    merchFulfilled: number
    merchTotal: number
    clicksThisWeek: number
  }
  charts: {
    signups: { date: string; count: number }[]
    contributions: { date: string; cents: number }[]
  }
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string
  value: string | number
  sub?: string
  icon: any
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        <Icon className="w-4 h-4 text-slate-600" />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  )
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null
  const max = Math.max(...data, 1)
  const height = 40
  const width = data.length * 4

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-10 mt-3" preserveAspectRatio="none">
      <polyline
        points={data.map((v, i) => `${i * 4},${height - (v / max) * height}`).join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function AdminDashboardPage() {
  const { data, loading } = useAdminFetch<StatsData>('/api/admin/stats')

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-28 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return <div className="text-slate-400">Failed to load dashboard data.</div>

  const { cards, charts } = data

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Users"
          value={cards.totalUsers}
          sub={cards.newUsersThisWeek > 0 ? `+${cards.newUsersThisWeek} this week` : undefined}
          icon={Users}
        />
        <StatCard
          label="Registries"
          value={cards.activeRegistries}
          icon={ClipboardList}
        />
        <StatCard
          label="Contributions"
          value={`$${(cards.totalContributionsCents / 100).toFixed(0)}`}
          icon={DollarSign}
        />
        <StatCard
          label="Merch Orders"
          value={cards.merchTotal}
          sub={cards.merchPending > 0 ? `${cards.merchPending} pending` : undefined}
          icon={ShoppingBag}
        />
        <StatCard
          label="Clicks"
          value={cards.clicksThisWeek}
          sub="this week"
          icon={MousePointerClick}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-400 mb-1">Signups (30 days)</h3>
          <MiniChart data={charts.signups.map((d) => d.count)} color="#f43f5e" />
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-slate-600">{charts.signups[0]?.date}</span>
            <span className="text-[10px] text-slate-600">{charts.signups[charts.signups.length - 1]?.date}</span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-400 mb-1">Contributions (30 days)</h3>
          <MiniChart data={charts.contributions.map((d) => d.cents)} color="#22c55e" />
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-slate-600">{charts.contributions[0]?.date}</span>
            <span className="text-[10px] text-slate-600">{charts.contributions[charts.contributions.length - 1]?.date}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
