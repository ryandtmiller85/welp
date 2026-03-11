'use client'

import { useAdminFetch } from '@/components/admin/use-admin-fetch'
import { Badge } from '@/components/admin/admin-table'
import { RefreshCw, ExternalLink } from 'lucide-react'

interface HealthData {
  checks: Record<string, { status: string; detail?: string }>
  envStatus: Record<string, boolean>
  runtime: { nodeVersion: string; env: string }
}

function StatusDot({ status }: { status: string }) {
  const color = status === 'healthy' ? 'bg-green-400' : status === 'warning' ? 'bg-amber-400' : 'bg-red-400'
  return <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
}

export default function AdminSystemPage() {
  const { data, loading, refetch } = useAdminFetch<HealthData>('/api/admin/health')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">System Health</h1>
        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-300 text-sm rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading && !data && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      )}

      {data && (
        <>
          {/* Service checks */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white">Service Checks</h3>
            </div>
            <div className="divide-y divide-slate-800/50">
              {Object.entries(data.checks).map(([name, check]) => (
                <div key={name} className="px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusDot status={check.status} />
                    <span className="text-sm text-white capitalize">{name.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={check.status === 'healthy' ? 'green' : check.status === 'warning' ? 'amber' : 'red'}>
                      {check.status}
                    </Badge>
                    {check.detail && <span className="text-xs text-slate-500">{check.detail}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Environment variables */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white">Environment Variables</h3>
            </div>
            <div className="divide-y divide-slate-800/50">
              {Object.entries(data.envStatus).map(([name, present]) => (
                <div key={name} className="px-5 py-2.5 flex items-center justify-between">
                  <span className="text-sm text-slate-300 font-mono text-xs">{name}</span>
                  <Badge color={present ? 'green' : 'red'}>{present ? 'Set' : 'Missing'}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics */}
          <a
            href="https://vercel.com/ryans-projects-1cff6bce/welp/analytics"
            target="_blank"
            rel="noopener"
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between hover:bg-slate-800/50 transition-colors block"
          >
            <div>
              <h3 className="text-sm font-semibold text-white">Vercel Analytics</h3>
              <p className="text-xs text-slate-500 mt-0.5">Page views, visitors, and web vitals</p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500" />
          </a>

          {/* Runtime */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Runtime</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-slate-500 uppercase">Node.js</span>
                <div className="text-sm text-white">{data.runtime.nodeVersion}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 uppercase">Environment</span>
                <div className="text-sm text-white">{data.runtime.env}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
