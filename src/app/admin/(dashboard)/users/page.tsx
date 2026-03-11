'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminFetch } from '@/components/admin/use-admin-fetch'
import { AdminTable, SearchBar, Pagination, Badge } from '@/components/admin/admin-table'

interface User {
  id: string
  display_name: string | null
  alias: string | null
  email: string | null
  event_type: string | null
  privacy_level: string | null
  slug: string | null
  is_proxy: boolean
  created_by_user_id: string | null
  created_at: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search
  const handleSearch = (val: string) => {
    setSearch(val)
    setPage(1)
    clearTimeout((window as any).__adminSearchTimeout)
    ;(window as any).__adminSearchTimeout = setTimeout(() => setDebouncedSearch(val), 300)
  }

  const { data, loading } = useAdminFetch<{ users: User[]; total: number }>(
    `/api/admin/users?search=${encodeURIComponent(debouncedSearch)}&page=${page}`,
    [debouncedSearch, page]
  )

  const columns = [
    {
      key: 'display_name',
      label: 'Name',
      render: (u: User) => (
        <div>
          <div className="font-medium text-white">{u.display_name || u.email || 'Unnamed'}</div>
          {u.alias && <div className="text-xs text-slate-500">{u.alias}</div>}
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (u: User) => <span className="text-slate-400">{u.email || '—'}</span>,
    },
    {
      key: 'event_type',
      label: 'Type',
      render: (u: User) => u.is_proxy
        ? <Badge color="blue">proxy</Badge>
        : u.event_type
          ? <Badge>{u.event_type.replace('_', ' ')}</Badge>
          : <span className="text-slate-600">—</span>,
    },
    {
      key: 'privacy_level',
      label: 'Privacy',
      render: (u: User) => u.privacy_level
        ? <Badge color={u.privacy_level === 'public' ? 'green' : 'amber'}>{u.privacy_level}</Badge>
        : <span className="text-slate-600">—</span>,
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (u: User) => (
        <span className="text-slate-500 text-xs">
          {new Date(u.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Users</h1>
        <span className="text-sm text-slate-500">{data?.total ?? '...'} total</span>
      </div>

      <SearchBar value={search} onChange={handleSearch} placeholder="Search by name or email..." />

      <AdminTable
        columns={columns}
        data={data?.users || []}
        loading={loading}
        onRowClick={(u) => router.push(`/admin/users/${u.id}`)}
        emptyMessage="No users found."
      />

      {data && (
        <Pagination page={page} total={data.total} limit={50} onPageChange={setPage} />
      )}
    </div>
  )
}
