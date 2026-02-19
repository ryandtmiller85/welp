import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProgressBar } from '@/components/ui/progress-bar'
import { CopyButton } from '@/components/ui/copy-button'
import { formatCents, progressPercent } from '@/lib/utils'
import type { Profile, RegistryItem, CashFund } from '@/lib/types/database'
import { Plus, DollarSign, Edit, ExternalLink, Package, ShoppingBag, Heart } from 'lucide-react'

async function getDashboardData() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/auth/login')
  }

  // Get profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    // Create default profile if it doesn't exist
    const slug = user.email?.split('@')[0] || user.id.slice(0, 8)
    await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
      slug,
      privacy_level: 'link_only',
      event_type: 'other',
      show_days_counter: false,
    })
  }

  // Get all registry items (not just first 5)
  const { data: allItems = [] } = await supabase
    .from('registry_items')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order')

  // Get recent items (last 5)
  const recentItems = (allItems || []).slice(0, 5)

  // Get cash funds
  const { data: funds = [] } = await supabase
    .from('cash_funds')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return {
    user,
    profile: profile || {
      id: user.id,
      email: user.email,
      display_name: null,
      story_text: null,
      slug: user.email?.split('@')[0] || user.id.slice(0, 8),
      privacy_level: 'link_only',
    },
    allItems,
    recentItems,
    funds,
  }
}

function StatCard({
  label,
  value,
  icon: Icon,
  accentColor = 'slate',
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  accentColor?: 'slate' | 'rose' | 'emerald' | 'amber'
}) {
  const colorClasses = {
    slate: 'text-slate-600',
    rose: 'text-rose-600',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-600 text-sm font-medium mb-2">{label}</p>
            <p className={`text-3xl font-bold ${colorClasses[accentColor]}`}>{value}</p>
          </div>
          <div className={`p-2 rounded-lg ${accentColor === 'rose' ? 'bg-rose-100' : accentColor === 'emerald' ? 'bg-emerald-100' : accentColor === 'amber' ? 'bg-amber-100' : 'bg-slate-100'}`}>
            <div className={colorClasses[accentColor]}>{Icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function DashboardPage() {
  const { user, profile, allItems, recentItems, funds } = await getDashboardData()

  const items = allItems || []
  const safeFunds = funds || []
  const totalItems = items.length
  const claimedItems = items.filter(
    (i: any) => i.status === 'claimed' || i.status === 'fulfilled'
  ).length
  const totalFundsRaised = safeFunds.reduce((sum: number, f: any) => sum + (f.raised_cents || 0), 0)
  const isProfileComplete = profile.story_text && profile.display_name
  const registryUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${profile.slug}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Hey, {profile.display_name || user.email}
              </h1>
              <p className="text-slate-600 mt-1">Welcome to your registry dashboard</p>
            </div>
            <div className="flex gap-2">
              <Link href="/auth/logout">
                <Button variant="ghost" size="sm">
                  Sign Out
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Total Items"
            value={totalItems}
            icon={<Package className="w-6 h-6" />}
            accentColor="slate"
          />
          <StatCard
            label="Items Claimed"
            value={claimedItems}
            icon={<Heart className="w-6 h-6" />}
            accentColor="emerald"
          />
          <StatCard
            label="Funds Raised"
            value={formatCents(totalFundsRaised)}
            icon={<DollarSign className="w-6 h-6" />}
            accentColor="rose"
          />
        </div>

        {/* Share Registry Section */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-rose-600" />
              Share Your Registry
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              Share this link with friends and family to let them help you rebuild:
            </p>
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                value={registryUrl}
                readOnly
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 text-sm font-mono min-w-0"
              />
              <CopyButton text={registryUrl} />
            </div>
          </CardContent>
        </Card>

        {/* Profile Completeness Alerts */}
        <div className="space-y-3">
          {!profile.story_text && (
            <Card className="border-l-4 border-l-amber-500 bg-amber-50/50">
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">Your registry needs a story</h3>
                  <p className="text-sm text-amber-800">
                    Tell people about your journey to inspire more support.
                  </p>
                </div>
                <Link href="/dashboard/edit" className="ml-4 flex-shrink-0">
                  <Button variant="outline" size="sm">
                    Add Story
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {totalItems === 0 && (
            <Card className="border-l-4 border-l-rose-500 bg-rose-50/50">
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-rose-900 mb-1">Add your first item</h3>
                  <p className="text-sm text-rose-800">
                    Start building your registry with items you need or want.
                  </p>
                </div>
                <Link href="/dashboard/add" className="ml-4 flex-shrink-0">
                  <Button variant="outline" size="sm">
                    Add Item
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/add" className="block">
              <Button
                variant="primary"
                className="w-full justify-center gap-2"
                size="lg"
              >
                <Plus className="w-5 h-5" />
                Add Item
              </Button>
            </Link>
            <Link href="/dashboard/funds/new" className="block">
              <Button
                variant="secondary"
                className="w-full justify-center gap-2"
                size="lg"
              >
                <DollarSign className="w-5 h-5" />
                Create Fund
              </Button>
            </Link>
            <Link href="/dashboard/edit" className="block">
              <Button
                variant="outline"
                className="w-full justify-center gap-2"
                size="lg"
              >
                <Edit className="w-5 h-5" />
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Items Section */}
        {recentItems.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-rose-600" />
                Recent Items
              </h2>
              {totalItems > 5 && (
                <Link href="/dashboard/items">
                  <Button variant="ghost" size="sm">
                    View all
                  </Button>
                </Link>
              )}
            </div>
            <div className="space-y-3">
              {recentItems.map((item) => {
                const statusConfig = {
                  available: { label: 'Available', variant: 'default' as const },
                  claimed: { label: 'Claimed', variant: 'success' as const },
                  partially_funded: { label: 'Partial', variant: 'warning' as const },
                  fulfilled: { label: 'Fulfilled', variant: 'success' as const },
                }
                const statusInfo = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.available

                return (
                  <Card key={item.id} hover>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-slate-900 truncate">{item.title}</h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {item.price_cents ? formatCents(item.price_cents) : 'Price TBD'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                          <Link href={`/dashboard/items/${item.id}`}>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Active Funds Section */}
        {safeFunds.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-rose-600" />
              Active Funds
            </h2>
            <div className="space-y-4">
              {safeFunds.map((fund: any) => {
                const percent = progressPercent(fund.raised_cents, fund.goal_cents)
                return (
                  <Card key={fund.id} hover>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{fund.title}</h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {formatCents(fund.raised_cents)} of {formatCents(fund.goal_cents)}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                          {percent}%
                        </span>
                      </div>
                      <ProgressBar value={percent} className="h-2" />
                      {fund.description && (
                        <p className="text-sm text-slate-600 mt-3">{fund.description}</p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {totalItems === 0 && (
          <Card className="border-2 border-dashed border-slate-300 bg-slate-50/50">
            <CardContent className="py-12 text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 mb-4">
                <Package className="w-8 h-8 text-rose-600" />
               </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No items yet</h3>
              <p className="text-slate-600 mb-6">
                Start building your registry by adding items you need or want
              </p>
              <Link href="/dashboard/add">
                <Button variant="primary" size="lg">
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
