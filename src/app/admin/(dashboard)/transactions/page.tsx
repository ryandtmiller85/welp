'use client'

import { useState } from 'react'
import { useAdminFetch } from '@/components/admin/use-admin-fetch'
import { AdminTable, SearchBar, Pagination, Badge } from '@/components/admin/admin-table'
import { DollarSign, ShoppingBag } from 'lucide-react'

export default function AdminTransactionsPage() {
  const [tab, setTab] = useState<'contributions' | 'merch'>('contributions')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const handleSearch = (val: string) => {
    setSearch(val)
    setPage(1)
    clearTimeout((window as any).__adminTxSearchTimeout)
    ;(window as any).__adminTxSearchTimeout = setTimeout(() => setDebouncedSearch(val), 300)
  }

  const { data, loading } = useAdminFetch<any>(
    `/api/admin/transactions?tab=${tab}&search=${encodeURIComponent(debouncedSearch)}&page=${page}`,
    [tab, debouncedSearch, page]
  )

  const contribColumns = [
    {
      key: 'contributor_name',
      label: 'Contributor',
      render: (c: any) => <span className="text-white">{c.contributor_name || 'Anonymous'}</span>,
    },
    {
      key: 'amount_cents',
      label: 'Amount',
      render: (c: any) => <span className="font-medium text-green-400">${((c.amount_cents || 0) / 100).toFixed(2)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (c: any) => <Badge color={c.status === 'completed' ? 'green' : c.status === 'failed' ? 'red' : 'amber'}>{c.status}</Badge>,
    },
    {
      key: 'stripe_payment_id',
      label: 'Stripe ID',
      render: (c: any) => c.stripe_payment_id
        ? <span className="font-mono text-xs text-slate-500">{c.stripe_payment_id.slice(0, 16)}...</span>
        : <span className="text-slate-600">—</span>,
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (c: any) => <span className="text-xs text-slate-500">{new Date(c.created_at).toLocaleDateString()}</span>,
    },
  ]

  const merchColumns = [
    {
      key: 'item_title',
      label: 'Item',
      render: (o: any) => <span className="text-white">{o.item_title || o.merch_item_id || 'Unknown'}</span>,
    },
    {
      key: 'customer_email',
      label: 'Customer',
      render: (o: any) => <span className="text-slate-400">{o.customer_email || '—'}</span>,
    },
    {
      key: 'amount_total',
      label: 'Amount',
      render: (o: any) => <span className="font-medium text-green-400">${((o.amount_total || 0) / 100).toFixed(2)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (o: any) => (
        <Badge color={o.status === 'fulfilled' || o.status === 'shipped' ? 'green' : o.status === 'fulfilling' ? 'blue' : 'amber'}>
          {o.status}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (o: any) => <span className="text-xs text-slate-500">{new Date(o.created_at).toLocaleDateString()}</span>,
    },
  ]

  const summary = data?.summary || {}

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Transactions</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase">Total Contributions</div>
            <div className="text-xl font-bold text-white">
              {tab === 'contributions'
                ? `$${((summary.totalAmount || 0) / 100).toFixed(0)}`
                : `$${((summary.totalRevenue || 0) / 100).toFixed(0)}`}
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase">
              {tab === 'contributions' ? 'Total Contributions' : 'Total Orders'}
            </div>
            <div className="text-xl font-bold text-white">
              {tab === 'contributions' ? summary.totalContributions || 0 : summary.totalOrders || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => { setTab('contributions'); setPage(1); setSearch(''); setDebouncedSearch('') }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'contributions' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Contributions
        </button>
        <button
          onClick={() => { setTab('merch'); setPage(1); setSearch(''); setDebouncedSearch('') }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'merch' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Merch Orders
        </button>
      </div>

      <SearchBar
        value={search}
        onChange={handleSearch}
        placeholder={tab === 'contributions' ? 'Search by name or Stripe ID...' : 'Search by email or order ID...'}
      />

      <AdminTable
        columns={tab === 'contributions' ? contribColumns : merchColumns}
        data={tab === 'contributions' ? (data?.contributions || []) : (data?.orders || [])}
        loading={loading}
        emptyMessage={`No ${tab === 'contributions' ? 'contributions' : 'orders'} found.`}
      />

      {data && (
        <Pagination page={page} total={data.total} limit={50} onPageChange={setPage} />
      )}
    </div>
  )
}
