'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/ui/copy-button'
import { Users, ShoppingBag, ExternalLink, Check } from 'lucide-react'

interface ProxyRegistryCardProps {
  profile: {
    id: string
    recipient_name: string | null
    relationship: string | null
    slug: string
    event_type: string
    is_proxy: boolean
    claimed_by_user_id: string | null
    claimed_at: string | null
    item_count?: number
    fund_count?: number
    created_at: string
  }
}

export function ProxyRegistryCard({ profile }: ProxyRegistryCardProps) {
  const isClaimed = !!profile.claimed_by_user_id
  const registryUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${profile.slug}`

  return (
    <Card hover>
      <CardContent className="py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
              {(profile.recipient_name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">
                {profile.recipient_name || 'Unknown'}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant={isClaimed ? 'success' : 'info'} size="sm">
                  {isClaimed ? 'Claimed' : profile.relationship || 'Proxy'}
                </Badge>
                {(profile.item_count ?? 0) > 0 && (
                  <span className="text-xs text-slate-400">
                    {profile.item_count} {profile.item_count === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {!isClaimed && (
              <Link href={`/dashboard/proxy/${profile.id}`}>
                <Button variant="primary" size="sm">
                  Manage
                </Button>
              </Link>
            )}
            <Link href={`/${profile.slug}`} target="_blank">
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {isClaimed && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg text-sm text-emerald-700">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{profile.recipient_name} has claimed this registry</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
