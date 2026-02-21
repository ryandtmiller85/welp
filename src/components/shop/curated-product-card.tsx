'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Plus, Check, Loader2 } from 'lucide-react'
import type { CuratedItem } from '@/lib/curated-items'

const BADGE_COLORS: Record<string, string> = {
  Popular: 'bg-rose-100 text-rose-700',
  Essential: 'bg-blue-100 text-blue-700',
  'Staff Pick': 'bg-purple-100 text-purple-700',
  'Great Value': 'bg-emerald-100 text-emerald-700',
}

const RETAILER_COLORS: Record<string, string> = {
  Amazon: '#FF9900',
  Target: '#CC0000',
  Walmart: '#0071DC',
  'Best Buy': '#0046BE',
  IKEA: '#0058A3',
  Wayfair: '#7B2D8E',
  Etsy: '#F16521',
  Chewy: '#1C49C2',
}

interface CuratedProductCardProps {
  item: CuratedItem
  onAddToRegistry: (item: CuratedItem) => void
  isAdding?: boolean
  isAdded?: boolean
}

export function CuratedProductCard({
  item,
  onAddToRegistry,
  isAdding = false,
  isAdded = false,
}: CuratedProductCardProps) {
  const retailerColor = RETAILER_COLORS[item.retailer] || '#64748b'
  const buyUrl = item.affiliateUrl || item.sourceUrl

  return (
    <Card hover className="flex flex-col h-full overflow-hidden">
      {/* Image */}
      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-contain p-4"
          loading="lazy"
        />
        {item.badge && (
          <div className="absolute top-2 left-2">
            <Badge
              variant="custom"
              className={BADGE_COLORS[item.badge] || 'bg-slate-100 text-slate-700'}
            >
              {item.badge}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="flex flex-col flex-1 py-4">
        {/* Retailer tag */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="inline-block w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: retailerColor }}
          />
          <span className="text-xs font-medium text-slate-500">{item.retailer}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-1 line-clamp-2">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2 flex-1">
          {item.description}
        </p>

        {/* Price */}
        <p className="text-lg font-bold text-slate-900 mb-3">
          ${item.price.toFixed(2)}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant={isAdded ? 'outline' : 'primary'}
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => onAddToRegistry(item)}
            disabled={isAdding || isAdded}
          >
            {isAdding ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Adding...
              </>
            ) : isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Added
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Add to Registry
              </>
            )}
          </Button>
          <a
            href={buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button variant="outline" size="sm" className="gap-1.5 px-2.5">
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
