import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { EVENT_LABELS, EVENT_EMOJI, CATEGORY_LABELS } from '@/lib/constants'
import { formatDate, daysSince, getInitials } from '@/lib/utils'
import type { Profile, RegistryItem, CashFund, Encouragement, EventType } from '@/lib/types/database'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ItemCard } from '@/components/registry/item-card'
import { FundCard } from '@/components/registry/fund-card'
import { RegistrySection } from './registry-section'
import { EncouragementWall } from '@/components/registry/encouragement-wall'
import Link from 'next/link'

// Dynamic metadata for social sharing
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', slug)
    .single() as any

  if (!profile) {
    return { title: 'Not Found' }
  }

  const eventLabel = EVENT_LABELS[profile.event_type as EventType]
  const displayName = profile.display_name || profile.alias || 'A Friend'
  const description = profile.story_text?.slice(0, 160) || `${displayName}'s fresh start registry on Welp.`

  return {
    title: `${displayName} - Welp`,
    description,
    openGraph: {
      title: `${displayName} - ${eventLabel}`,
      description,
      type: 'website',
      images: profile.cover_photo_url ? [{ url: profile.cover_photo_url }] : [],
    },
  }
}

export default async function RegistryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', slug)
    .single() as any

  const profile: Profile | null = profileData

  if (profileError || !profile) {
    notFound()
  }

  // Fetch registry items
  const { data: itemsData } = await supabase
    .from('registry_items')
    .select('*')
    .eq('user_id', profile.id)
    .order('sort_order', { ascending: true }) as any

  const items = (itemsData as RegistryItem[]) || []

  // Fetch cash funds
  const { data: fundsData } = await supabase
    .from('cash_funds')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false }) as any

  const funds = (fundsData as CashFund[]) || []

  // Fetch encouragements
  const { data: encouragementsData } = await supabase
    .from('encouragements')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(20) as any

  const encouragements = (encouragementsData as Encouragement[]) || []

  const displayName = profile.display_name || profile.alias || 'A Friend'
  const daysAgo = profile.event_date ? daysSince(profile.event_date) : 0
  const showCounter = profile.show_days_counter && profile.event_date
  const eventLabel = EVENT_LABELS[profile.event_type]
  const eventEmoji = EVENT_EMOJI[profile.event_type]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Cover Photo */}
      <div className="relative w-full h-80 bg-gradient-to-br from-slate-900 via-rose-800 to-pink-700 overflow-hidden">
        {profile.cover_photo_url ? (
          <img
            src={profile.cover_photo_url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) :(
          <div className="absolute inset-0 opacity-40" />
        )}
        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
      </div>
      #{/* Main Content */}
  <nax gap_inset-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header Card */}
        <Card className="mb-12 shadow-lg">
          <CardContent className="pt-8">
            <div className="flex flex-col sm:flex-row gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-5xl font-bold text-white shadow-xl ring-4 ring-white overflow-hidden">
                  {profile.profile_photo_url ? (
                    <img
                      src={profile.profile_photo_url}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(displayName)
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 flex flex-col justify-center">
                <div>
                  <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
                    {displayName}
                  </h1>

                  {profile.alias && profile.display_name && (
                    <p className="text-lg text-slate-600 mt-2 italic">{profile.alias}</p>
                  )}

                  {/* Badges */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Badge variant="info" className="text-base px-4 py-2 flex items-center gap-2">
                      <span>{eventEmoji}</span>
                      <span>{eventLabel}</span>
                    </Badge>

                    {showCounter && (
                      <Badge variant="warning" className="text-base px-4 py-2">
                        <span className="mr-2">📅</span>
                        Day {daysAgo} of the rest of your life
                      </Badge>
                    )}

                    {profile.city && profile.state && (
                      <Badge variant="default" className="text-base px-4 py-2">
                        📍 {profile.city}, {profile.state}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Share Button */}
              <ShareButton displayName={displayName} />
            </div>
          </CardContent>
        </Card>

        {/* The Story Section */}
        {profile.story_text && (
          <Card className="mb-12">
            <CardHeader>
              <h2 className="text-3xl font-bold text-slate-900">The Story</h2>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap font-light">
                {profile.story_text}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Registry Items Section */}
        {items.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">The List</h2>
            <RegistrySection items={items} profile={profile} />
          </div>
        )}

        {/* Cash Funds Section */}
        {funds.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Help Fund My Recovery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {funds.map((fund) => (
                <FundCard key={fund.id} fund={fund} isOwner={false} />
              ))}
            </div>
          </div>
        )}

        {/* Encouragement Wall */}
        <div className="mb-16">
          <EncouragementWall profileId={profile.id} encouragements={encouragements} />
        </div>

        {/* Empty State */}
        {items.length === 0 && funds.length === 0 && (
          <Card className="mb-12 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
            <CardContent className="py-16 text-center">
              <div className="text-6xl mb-4">🏗️</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Registry coming soon
              </h3>
              <p className="text-slate-600 text-lg max-w-md mx-auto">
                {displayName} is building their registry. Check back later!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer Spacing */}
      <div className="h-12" />
    </div>
  )
}

// Share Button Component
function ShareButton({ displayName }: { displayName: string }) {
  return (
    <div className="flex-shrink-0">
      <button
        onClick={() => {
          const url = typeof window !== 'undefined' ? window.location.href : ''
          if (typeof navigator !== 'undefined' && navigator.share) {
            navigator.share({
              title: `${displayName}'s Registry`,
              url,
            })
          } else {
            if (typeof navigator !== 'undefined') {
              navigator.clipboard.writeText(url)
            }
            alert('Link copied to clipboard!')
          }
        }}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-200 whitespace-nowrap"
      >
        <span>Share</span>
        <span class="font-bold">🔗</span>
      </button>
    </div>
  )
}
