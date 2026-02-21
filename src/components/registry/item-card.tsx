'use client'

import type { RegistryItem } from '@/lib/types/database'
import { PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/constants'
import { formatCents, progressPercent, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { ExternalLink, ShoppingCart, Check } from 'lucide-react'

interface ItemCardProps {
  item: RegistryItem
  isOwner: boolean
  onClaim?: (itemId: string) => void
}

export function ItemCard({ item, isOwner, onClaim }: ItemCardProps) {
  const priorityColor = PRIORITY_COLORS[item.priority] || 'bg-gray-100 text-gray-800'
  const fundingPct =
    item.is_group_gift && item.group_gift_target_cents
      ? progressPercent(item.group_gift_funded_cents, item.group_gift_target_cents)
      : 0

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative w-full aspect-video bg-slate-100 overflow-hidden">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-slate-300" />
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Title and Price */}
        <div className="mb-3">
          <h3 className="font-bold text-lg line-clamp-2 mb-1">{item.title}</h3>
          {item.price_cents != null && (
            <p className="text-rose-600 font-semibold mb-1">
              {formatCents(item.price_cents)}
            </p>
          )}
          {item.retailer && (
            <p className="text-sm text-slate-500">{item.retailer}</p>
          )}
        </div>

        {/* Priority Badge */}
        <div className="mb-3">
          <Badge variant="custom" className={cn(priorityColor, 'text-xs')}>
            {PRIORITY_LABELS[item.priority]}
          </Badge>
        </div>

        {/* Custom Note */}
        {item.custom_note && (
          <p className="text-sm italic text-slate-600 mb-3">
            &ldquo;{item.custom_note}&rdquo;
          </p>
        )}

        {/* Status-based actions */}
        <div className="space-y-3">
          {item.status === 'available' && !isOwner && (
            <div className="flex gap-2">
              {item.source_url && (
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full">
                    Buy This
                    <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </a>
              )}
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onClaim?.(item.id)}
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                I Bought This
              </Button>
            </div>
          )}

          {item.status === 'claimed' && (
            <div className="flex items-center justify-between">
              <Badge variant="success">Claimed</Badge>
              {item.claimed_by_name && (
                <p className="text-sm text-slate-500">by {item.claimed_by_name}</p>
              )}
            </div>
          )}

          {item.is_group_gift && item.status === 'partially_funded' && (
            <div className="space-y-2">
              <ProgressBar value={fundingPct} color="amber" size="sm" />
              <p className="text-xs text-slate-500">
                {formatCents(item.group_gift_funded_cents)} of{' '}
                {item.group_gift_target_cents ? formatCents(item.group_gift_target_cents) : '?'} raised
              </p>
            </div>
          )}

          {isOwner && item.status === 'available' && (
            <p className="text-xs text-slate-400 italic text-center">
              Your item &mdash; visible to visitors
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
