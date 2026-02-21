import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCents } from '@/lib/utils'
import { CATEGORY_LABELS, PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/constants'
import type { RegistryItem, ItemCategory, ItemPriority } from '@/lib/types/database'
import { ArrowLeft, Plus, Package, ShoppingBag, ExternalLink } from 'lucide-react'

export default async function ItemsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) redirect('/auth/login')

  const { data: items = [] } = await supabase
    .from('registry_items')
    .select('*')
    .eq('user_id', session.user.id)
    .order('sort_order', { ascending: true })

  const allItems = (items || []) as RegistryItem[]

  const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' }> = {
    available: { label: 'Available', variant: 'default' },
    claimed: { label: 'Claimed', variant: 'success' },
    partially_funded: { label: 'Partial', variant: 'warning' },
    fulfilled: { label: 'Fulfilled', variant: 'success' },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <ShoppingBag className="w-8 h-8 text-rose-600" />
                All Items
              </h1>
              <p className="text-slate-600 mt-1">
                {allItems.length} {allItems.length === 1 ? 'item' : 'items'} in your registry
              </p>
            </div>
            <Link href="/dashboard/add">
              <Button variant="primary" size="lg">
                <Plus className="w-5 h-5 mr-1" />
                Add Item
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {allItems.length > 0 ? (
          <div className="space-y-3">
            {allItems.map((item) => {
              const status = statusConfig[item.status] || statusConfig.available
              const priorityColor = PRIORITY_COLORS[item.priority] || ''

              return (
                <Card key={item.id} hover>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      {/* Image Thumbnail */}
                      <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-slate-100 overflow-hidden">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-slate-300" />
                          </div>
                        )}
                      </div>

                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">{item.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-slate-600">
                            {item.price_cents ? formatCents(item.price_cents) : 'Price TBD'}
                          </span>
                          {item.retailer && (
                            <span className="text-sm text-slate-400">· {item.retailer}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="custom" className={`text-xs ${priorityColor}`}>
                            {PRIORITY_LABELS[item.priority]}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {CATEGORY_LABELS[item.category]}
                          </span>
                        </div>
                      </div>

                      {/* Status + Actions */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        {item.source_url && (
                          <a href={item.source_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        <Link href={`/dashboard/items/${item.id}`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Claimed info */}
                    {item.claimed_by_name && (
                      <p className="text-xs text-slate-400 mt-2 ml-20">
                        Claimed by {item.claimed_by_name}
                        {item.claimed_at && ` on ${new Date(item.claimed_at).toLocaleDateString()}`}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-slate-300 bg-slate-50/50">
            <CardContent className="py-16 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No items yet</h3>
              <p className="text-slate-600 mb-6">
                Start building your registry by adding items you need or want.
              </p>
              <Link href="/dashboard/add">
                <Button variant="primary" size="lg">
                  <Plus className="w-5 h-5 mr-1" />
                  Add Your First Item
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
