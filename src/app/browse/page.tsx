import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EVENT_LABELS, EVENT_EMOJI } from '@/lib/constants'
import { getInitials, daysSince } from '@/lib/utils'
import { Search } from 'lucide-react'
import type { Metadata } from 'next'
import type { Profile } from '@/lib/types/database'

export const metadata: Metadata = {
  title: 'Browse Registries',
  description: 'Browse public registries on Welp. Find someone to support.',
}

export default async function BrowsePage() {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('privacy_level', 'public')
    .not('story_text', 'is', null)
    .order('created_at', { ascending: false })
    .limit(24)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
          Browse Registries
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Real people starting over. See how you can help.
        </p>
      </div>

      {profiles && profiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(profiles as Profile[]).map((profile) => (
            <Link key={profile.id} href={`/${profile.slug}`}>
              <Card hover className="h-full">
                <CardContent className="py-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-rose-600">
                        {getInitials(profile.display_name || profile.alias || 'U')}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {profile.display_name || profile.alias || 'Anonymous'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="default">
                          {EVENT_EMOJI[profile.event_type]} {EVENT_LABELS[profile.event_type]}
                        </Badge>
                        {profile.city && (
                          <span className="text-xs text-slate-400">
                            {profile.city}{profile.state ? `, ${profile.state}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {profile.story_text && (
                    <p className="mt-4 text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {profile.story_text}
                    </p>
                  )}

                  {profile.event_date && (
                    <p className="mt-3 text-xs text-slate-400">
                      Day {daysSince(profile.event_date)} of their fresh start
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mb-6">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900">No public registries yet</h3>
          <p className="mt-2 text-slate-600">
            Be the first to create one and share your story.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block mt-6 px-6 py-2.5 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors"
          >
            Create Your Registry
          </Link>
        </div>
      )}
    </div>
  )
}
