import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CopyButton } from '@/components/ui/copy-button'
import { ShareRegistry } from '../../share-registry'
import { formatCents } from '@/lib/utils'
import type { RegistryItem, CashFund } from '@/lib/types/database'
import { ArrowLeft, Plus, DollarSign, Edit, ExternalLink, ShoppingBag, Heart, Package } from 'lucide-react'

export default async function ProxyManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/auth/login')

  // Fetch the proxy profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('is_proxy', true)
    .eq('created_by_user_id', session.user.id)
    .single() as any

  if (error || !profile) notFound()

  // Check if claimed
  if (profile.claimed_by_user_id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Registry Claimed!</h1>
          <p className="text-slate-600 mb-6">
            {profile.recipient_name} has taken over this registry. You can still view it but can no longer make changes.
          </p>
          <div className="flex justify-center gap-3">
            <Link href={`/${profile.slug}`}>
              <Button variant="outline">View Registry</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="primary">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Fetch items and funds
  const { data: items = [] } = await supabase
    .from('registry_items')
    .select('*')
    .eq('user_id', id)
    .order('sort_order') as any

  const { data: funds = [] } = await supabase
    .from('cash_funds')
    .select('*')
    .eq('user_id', id)
    .eq('is_active', true)
    .order('created_at', { ascending: false }) as any

  const registryUrl = `https://alliswelp.com/${profile.slug}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-2xl font-bold text-white">
                {(profile.recipient_name || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {profile.recipient_name}&apos;s Registry
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="info" size="sm">
                    <Heart className="w-3 h-3 mr-1" />
                    You&apos;re their {profile.relationship}
                  </Badge>
                  <Badge variant="default" size="sm">Proxy</Badge>
                </div>
              </div>
            </div>
            <Link href={`/${profile.slug}`} target="_blank">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-1" />
                View Public Page
              </Button>
            </Link>
          </div>
        </div>

        {/* Share Link */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-600 font-mono truncate">
                {registryUrl}
              </div>
              <CopyButton text={registryUrl} />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <Link href={`/dashboard/proxy/${id}/add`}>
            <Button variant="primary" className="w-full justify-center gap-2" size="lg">
              <Plus className="w-5 h-5" />
              Add Item
            </Button>
          </Link>
          <Link href={`/dashboard/proxy/${id}/fund`}>
            <Button variant="secondary" className="w-full justify-center gap-2" size="lg">
              <DollarSign className="w-5 h-5" />
              Create Fund
            </Button>
          </Link>
          <Link href={`/dashboard/proxy/${id}/edit`}>
            <Button variant="outline" className="w-full justify-center gap-2" size="lg">
              <Edit className="w-5 h-5" />
              Edit Profile
            </Button>
          </Link>
        </div>

        {/* Items */}
        {(items || []).length > 0 ? (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-rose-600" />
              Registry Items ({items.length})
            </h2>
            <div className="space-y-3">
              {items.map((item: RegistryItem) => {
                const statusConfig = {
                  available: { label: 'Available', variant: 'default' as const },
                  claimed: { label: 'Claimed', variant: 'success' as const },
                  partially_funded: { label: 'Partial', variant: 'warning' as const },
                  fulfilled: { label: 'Fulfilled', variant: 'success' as const },
                }
                const s = statusConfig[item.status] || statusConfig.available
                return (
                  <Card key={item.id} hover>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-slate-900 truncate">{item.title}</h3>
                          <p className="text-sm text-slate-600 mt-0.5">
                            {item.price_cents ? formatCents(item.price_cents) : 'Price TBD'}
                            {item.retailer && ` · ${item.retailer}`}
                          </p>
                        </div>
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ) : (
          <Card className="mb-8 border-2 border-dashed border-slate-300 bg-slate-50/50">
            <CardContent className="py-12 text-center">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 mb-1">No items yet</h3>
              <p className="text-slate-500 text-sm mb-4">
                Start adding items to {profile.recipient_name}&apos;s registry
              </p>
              <Link href={`/dashboard/proxy/${id}/add`}>
                <Button variant="primary">Add First Item</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Funds */}
        {(funds || []).length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-rose-600" />
              Cash Funds
            </h2>
            <div className="space-y-3">
              {funds.map((fund: CashFund) => (
                <Card key={fund.id} hover>
                  <CardContent className="py-4">
                    <h3 className="font-semibold text-slate-900">{fund.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {formatCents(fund.raised_cents)} of {formatCents(fund.goal_cents)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
