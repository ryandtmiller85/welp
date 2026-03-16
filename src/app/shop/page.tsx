import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { CATEGORY_LABELS, CATEGORY_DESCRIPTIONS } from '@/lib/constants'
import { CURATED_ITEMS } from '@/lib/curated-items'
import type { ItemCategory } from '@/lib/types/database'
import type { Metadata } from 'next'
import {
  Package,
  UtensilsCrossed,
  Bed,
  Sofa,
  Coffee,
  Flame,
  Sparkles,
  PawPrint,
  Baby,
} from 'lucide-react'

const CATEGORY_ICONS: Partial<Record<ItemCategory, React.ReactNode>> = {
  the_basics: <Package className="w-6 h-6" />,
  kitchen_reset: <UtensilsCrossed className="w-6 h-6" />,
  bedroom_glowup: <Bed className="w-6 h-6" />,
  living_solo: <Sofa className="w-6 h-6" />,
  self_care: <Coffee className="w-6 h-6" />,
  petty_fund: <Flame className="w-6 h-6" />,
  treat_yoself: <Sparkles className="w-6 h-6" />,
  pets: <PawPrint className="w-6 h-6" />,
  for_the_kids: <Baby className="w-6 h-6" />,
}

// Only show categories that have curated items
const SHOP_CATEGORIES = (Object.keys(CURATED_ITEMS) as ItemCategory[]).filter(
  (cat) => (CURATED_ITEMS[cat] ?? []).length > 0
)

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'Browse curated product picks for your fresh start. Real products, real links, zero judgment.',
}

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Shop the Fresh Start
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Curated picks for every part of starting over. Browse a category to
            find what you need.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SHOP_CATEGORIES.map((category) => {
            const count = (CURATED_ITEMS[category] ?? []).length
            return (
              <Link key={category} href={`/shop/${category}`}>
                <Card hover className="h-full cursor-pointer">
                  <CardContent className="py-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 text-rose-600 mb-3">
                      {CATEGORY_ICONS[category]}
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm">
                      {CATEGORY_LABELS[category]}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {CATEGORY_DESCRIPTIONS[category]}
                    </p>
                    <p className="text-xs font-medium text-rose-600 mt-2">
                      {count} {count === 1 ? 'item' : 'items'}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Affiliate disclosure */}
        <p className="text-xs text-slate-400 text-center mt-10 max-w-xl mx-auto leading-relaxed">
          Some links on this site are affiliate links. Welp may earn a small
          commission at no extra cost to you. As an Amazon Associate, Welp earns
          from qualifying purchases.
        </p>
      </div>
    </div>
  )
}
