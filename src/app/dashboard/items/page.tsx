import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { RegistryItem } from '@/lib/types/database'
import { ArrowLeft, Plus, Package, ShoppingBag } from 'lucide-react'
import { ReorderableItems } from './reorderable-items'

export const dynamic = 'force-dynamic'

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
          <ReorderableItems initialItems={allItems} />
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
