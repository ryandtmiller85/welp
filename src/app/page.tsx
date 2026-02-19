import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CATEGORY_LABELS, CATEGORY_DESCRIPTIONS } from '@/lib/constants'
import type { ItemCategory } from '@/lib/types/database'
import {
  Heart,
  Package,
  DollarSign,
  Share2,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Coffee,
  Sofa,
  UtensilsCrossed,
  Bed,
  Car,
  Smartphone,
  PawPrint,
  Flame,
} from 'lucide-react'

const CATEGORY_ICONS: Partial<Record<ItemCategory, React.ReactNode>> = {
  the_basics: <Package className="w-6 h-6" />,
  kitchen_reset: <UtensilsCrossed className="w-6 h-6" />,
  bedroom_glowup: <Bed className="w-6 h-6" />,
  living_solo: <Sofa className="w-6 h-6" />,
  self_care: <Coffee className="w-6 h-6" />,
  wheels: <Car className="w-6 h-6" />,
  petty_fund: <Flame className="w-6 h-6" />,
  treat_yoself: <Sparkles className="w-6 h-6" />,
  pets: <PawPrint className="w-6 h-6" />,
  tech: <Smartphone className="w-6 h-6" />,
}

const FEATURED_CATEGORIES: ItemCategory[] = [
  'the_basics',
  'kitchen_reset',
  'bedroom_glowup',
  'living_solo',
  'self_care',
  'petty_fund',
  'treat_yoself',
  'pets',
]

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-rose-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(244,63,94,0.15),transparent_60%)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight">
              welp.
            </h1>
            <p className="mt-4 text-xl sm:text-2xl text-rose-200 font-medium">
              Time to start over.
            </p>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-2xl">