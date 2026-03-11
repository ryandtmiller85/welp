'use client'

import { useState } from 'react'
import { useAdminFetch } from '@/components/admin/use-admin-fetch'
import { AdminTable, Badge } from '@/components/admin/admin-table'
import { ExternalLink } from 'lucide-react'

export default function AdminMerchPage() {
  const [tab, setTab] = useState<'orders' | 'products'>('orders')

  const { data: ordersData, loading: ordersLoading } = useAdminFetch<any>(
    '/api/admin/transactions?tab=merch&limit=50'
  )

  const orderColumns = [
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
      label: 'Fulfillment',
      render: (o: any) => (
        <Badge color={o.status === 'fulfilled' || o.status === 'shipped' ? 'green' : o.status === 'fulfilling' ? 'blue' : 'amber'}>
          {o.status}
        </Badge>
      ),
    },
    {
      key: 'printify_order_id',
      label: 'Printify',
      render: (o: any) => o.printify_order_id
        ? <span className="font-mono text-xs text-slate-500">{o.printify_order_id.slice(0, 10)}...</span>
        : <span className="text-slate-600">—</span>,
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (o: any) => <span className="text-xs text-slate-500">{new Date(o.created_at).toLocaleDateString()}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Merch</h1>
        <a
          href="/admin/printify"
          className="text-sm text-rose-400 hover:text-rose-300 flex items-center gap-1"
        >
          Printify Setup Tool <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('orders')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'orders' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => setTab('products')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'products' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Product Catalog
        </button>
      </div>

      {tab === 'orders' && (
        <AdminTable
          columns={orderColumns}
          data={ordersData?.orders || []}
          loading={ordersLoading}
          emptyMessage="No merch orders yet."
        />
      )}

      {tab === 'products' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <p className="text-sm text-slate-400 mb-4">
            Product management is handled through the Printify dashboard and the setup tool.
          </p>
          <div className="flex gap-3">
            <a
              href="/admin/printify"
              className="px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors"
            >
              Open Printify Setup Tool
            </a>
            <a
              href="https://printify.com/app/store/products"
              target="_blank"
              rel="noopener"
              className="px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-1"
            >
              Printify Dashboard <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
