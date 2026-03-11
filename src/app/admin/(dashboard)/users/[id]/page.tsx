'use client'

import { use } from 'react'
import Link from 'next/link'
import { useAdminFetch } from '@/components/admin/use-admin-fetch'
import { Badge } from '@/components/admin/admin-table'
import { ArrowLeft } from 'lucide-react'

interface UserDetail {
  profile: any
  items: any[]
  funds: any[]
  contributions: any[]
  encouragements: any[]
  proxyRegistries: any[]
}

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {count !== undefined && <span className="text-xs text-slate-500">{count}</span>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data, loading } = useAdminFetch<UserDetail>(`/api/admin/users/${id}`)

  if (loading) {
    return <div className="text-slate-400 animate-pulse">Loading user...</div>
  }

  if (!data?.profile) {
    return <div className="text-red-400">User not found.</div>
  }

  const p = data.profile

  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </Link>

      {/* Profile header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{p.display_name || 'Unnamed'}</h1>
            {p.alias && <p className="text-slate-400 text-sm mt-0.5">{p.alias}</p>}
            <p className="text-slate-500 text-sm mt-1">{p.email || 'No email'}</p>
          </div>
          <div className="flex gap-2">
            {p.is_proxy && <Badge color="blue">Proxy</Badge>}
            <Badge color={p.privacy_level === 'public' ? 'green' : 'amber'}>{p.privacy_level}</Badge>
            <Badge>{p.event_type?.replace('_', ' ') || 'other'}</Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-800">
          <div><span className="text-[11px] text-slate-500 uppercase">Slug</span><div className="text-sm text-white">{p.slug || '—'}</div></div>
          <div><span className="text-[11px] text-slate-500 uppercase">Location</span><div className="text-sm text-white">{p.city && p.state ? `${p.city}, ${p.state}` : '—'}</div></div>
          <div><span className="text-[11px] text-slate-500 uppercase">Joined</span><div className="text-sm text-white">{new Date(p.created_at).toLocaleDateString()}</div></div>
          <div><span className="text-[11px] text-slate-500 uppercase">ID</span><div className="text-sm text-slate-400 font-mono text-xs">{p.id.slice(0, 8)}</div></div>
        </div>
      </div>

      {/* Story */}
      {p.story_text && (
        <Section title="Story">
          <p className="text-sm text-slate-300 leading-relaxed">{p.story_text}</p>
        </Section>
      )}

      {/* Registry items */}
      <Section title="Registry Items" count={data.items.length}>
        {data.items.length === 0 ? (
          <p className="text-sm text-slate-500">No items yet.</p>
        ) : (
          <div className="space-y-2">
            {data.items.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-b-0">
                <div>
                  <span className="text-sm text-white">{item.title}</span>
                  <span className="text-xs text-slate-500 ml-2">{item.retailer}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={item.status === 'fulfilled' ? 'green' : item.status === 'claimed' ? 'blue' : 'slate'}>{item.status}</Badge>
                  {item.price_cents && <span className="text-xs text-slate-400">${(item.price_cents / 100).toFixed(2)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Cash funds */}
      <Section title="Cash Funds" count={data.funds.length}>
        {data.funds.length === 0 ? (
          <p className="text-sm text-slate-500">No funds yet.</p>
        ) : (
          <div className="space-y-2">
            {data.funds.map((fund: any) => (
              <div key={fund.id} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-b-0">
                <span className="text-sm text-white">{fund.title}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${Math.min(100, (fund.raised_cents / fund.goal_cents) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400">
                    ${(fund.raised_cents / 100).toFixed(0)} / ${(fund.goal_cents / 100).toFixed(0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Contributions */}
      <Section title="Contributions Received" count={data.contributions.length}>
        {data.contributions.length === 0 ? (
          <p className="text-sm text-slate-500">No contributions yet.</p>
        ) : (
          <div className="space-y-2">
            {data.contributions.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-b-0">
                <div>
                  <span className="text-sm text-white">{c.contributor_name || 'Anonymous'}</span>
                  <span className="text-xs text-slate-500 ml-2">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={c.status === 'completed' ? 'green' : 'amber'}>{c.status}</Badge>
                  <span className="text-sm font-medium text-white">${((c.amount_cents || 0) / 100).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Encouragements */}
      {data.encouragements.length > 0 && (
        <Section title="Encouragements" count={data.encouragements.length}>
          <div className="space-y-3">
            {data.encouragements.map((e: any) => (
              <div key={e.id} className="border-b border-slate-800/50 last:border-b-0 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{e.author_name}</span>
                  <span className="text-xs text-slate-500">{new Date(e.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-slate-300">{e.message}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Proxy registries created */}
      {data.proxyRegistries.length > 0 && (
        <Section title="Proxy Registries Created" count={data.proxyRegistries.length}>
          <div className="space-y-2">
            {data.proxyRegistries.map((pr: any) => (
              <div key={pr.id} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-b-0">
                <Link href={`/admin/registries/${pr.id}`} className="text-sm text-rose-400 hover:text-rose-300">
                  {pr.display_name}
                </Link>
                <Badge color={pr.claimed_by_user_id ? 'green' : 'amber'}>
                  {pr.claimed_by_user_id ? 'Claimed' : 'Unclaimed'}
                </Badge>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}
