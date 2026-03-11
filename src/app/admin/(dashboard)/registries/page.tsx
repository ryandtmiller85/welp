'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminFetch } from '@/components/admin/use-admin-fetch'
import { AdminTable, SearchBar, Pagination, Badge } from '@/components/admin/admin-table'

interface Registry {
  id: string
  display_name: string | null
  alias: string | null
  email: string | null
  event_type: string | null
  privacy_level: string | null
  slug: string | null
  is_proxy: boolean
  created_by_user_id: string | null
  claimed_by_user_id: string | null
  recipient_name: string | null
  relationship: string | null
  created_at: string
}

export default function AdminRegistriesPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterProxy, setFilterProxy] = useState('')

  const handleSearch = (val: string) => {
    setSearch(val)
    setPage(1)
    clearTimeout((window as any).__adminRegSearchTimeout)
    ;(window as any).__adminRegSearchTimeout = setTimeout(() => setDebouncedSearch(val), 300)
  }

  const { data, loading } = useAdminFetch<{ registries: Registry[]; total: number }>(
    `/api/admin/registries?search=${encodeURIComponent(debouncedSearch)}&page=${page}&proxy=${filterProxy}`,
    [debouncedSearch, page, filterProxy]
  )

  const columns = [
    {
      key: 'display_name',
      label: 'Registry',
      render: (r: Registry) => (
        <div>
          <div className="font-medium text-white">{r.display_name || 'Unnamed'}</div>
          {r.slug && <div className="text-xs text-slate-500">/{r.slug}</div>}
        </div>
      ),
    },
    {
      key: 'event_type',
      label: 'Event',
      render: (r: Registry) => r.event_type
        ? <Badge>{r.event_type.replace('_', ' ')}</Badge>
        : <span className="text-slate-600">—</span>,
    },
    {
      key: 'is_proxy',
      label: 'Type',
      render: (r: Registry) => r.is_proxy
        ? (
          <div>
            <Badge color="blue">proxy</Badge>
            {r.claimed_by_user_id ? <Badge color="green">claimed</Badge> : null}
          </div>
        )
        : <Badge color="slate">self</Badge>,
    },
    {
      key: 'privacy_level',
      label: 'Privacy',
      render: (r: Registry) => (
        <Badge color={r.privacy_level === 'public' ? 'green' : r.privacy_level === 'private' ? 'red' : 'amber'}>
          {r.privacy_level}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (r: Registry) => (
        <span className="text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString()}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Registries</h1>
        <span className="text-sm text-slate-500">{data?.total ?? '...'} total</span>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <SearchBar value={search} onChange={handleSearch} placeholder="Search by name or slug..." />
        <select
          value={filterProxy}
          onChange={(e) => { setFilterProxy(e.target.value); setPage(1) }}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
        >
          <option value="">All types</option>
          <option value="false">Self-created</option>
          <option value="true">Proxy</option>
        </select>
      </div>

      <AdminTable
        columns={columns}
        data={data?.registries || []}
        loading={loading}
        onRowClick={(r) => router.push(`/admin/registries/${r.id}`)}
        emptyMessage="No registries found."
      />

      {data && (
        <Pagination page={page} total={data.total} limit={50} onPageChange={setPage} />
      )}
    </div>
  )
}
