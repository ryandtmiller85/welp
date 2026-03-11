'use client'

import { useAdminFetch } from '@/components/admin/use-admin-fetch'
import { AdminTable, Badge } from '@/components/admin/admin-table'
import { MousePointerClick, TrendingUp } from 'lucide-react'

interface ClicksData {
  totalClicks: number
  clicksThisWeek: number
  byRetailer: Record<string, number>
  clicksByDay: { date: string; count: number }[]
  recentClicks: any[]
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

export default function AdminShopPage() {
  const { data, loading } = useAdminFetch<ClicksData>('/api/admin/clicks')

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-white">Shop / Affiliate</h1>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-28 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return <div className="text-slate-400">Failed to load click data.</div>

  const recentColumns = [
    {
      key: 'retailer',
      label: 'Retailer',
      render: (c: any) => <Badge>{c.retailer || 'unknown'}</Badge>,
    },
    {
      key: 'url',
      label: 'URL',
      render: (c: any) => (
        <span className="text-xs text-slate-500 font-mono truncate max-w-xs block">
          {c.url?.replace(/https?:\/\//, '').slice(0, 50)}...
        </span>
      ),
    },
    {
      key: 'source',
      label: 'Source',
      render: (c: any) => <span className="text-xs text-slate-400">{c.source || '—'}</span>,
    },
    {
      key: 'created_at',
      label: 'When',
      render: (c: any) => (
        <span className="text-xs text-slate-500">
          {new Date(c.created_at).toLocaleString()}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Shop / Affiliate</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Total Clicks</span>
            <MousePointerClick className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-bold text-white">{data.totalClicks}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider">This Week</span>
            <TrendingUp className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-bold text-white">{data.clicksThisWeek}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 col-span-2 lg:col-span-1">
          <span className="text-xs text-slate-400 uppercase tracking-wider">By Retailer</span>
          <div className="mt-2 space-y-1.5">
            {Object.entries(data.byRetailer)
              .sort((a, b) => b[1] - a[1])
              .map(([retailer, count]) => (
                <div key={retailer} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{retailer}</span>
                  <span className="text-sm font-medium text-white">{count}</span>
                </div>
              ))}
            {Object.keys(data.byRetailer).length === 0 && (
              <span className="text-sm text-slate-500">No data yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-medium text-slate-400 mb-1">Clicks (30 days)</h3>
        <MiniChart data={data.clicksByDay.map((d) => d.count)} color="#f59e0b" />
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-slate-600">{data.clicksByDay[0]?.date}</span>
          <span className="text-[10px] text-slate-600">{data.clicksByDay[data.clicksByDay.length - 1]?.date}</span>
        </div>
      </div>

      {/* Recent clicks */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Recent Clicks</h3>
        <AdminTable
          columns={recentColumns}
          data={data.recentClicks}
          emptyMessage="No affiliate clicks tracked yet."
        />
      </div>
    </div>
  )
}
