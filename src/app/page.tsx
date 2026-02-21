import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MerchCarousel } from '@/components/merch/merch-carousel'
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
              Because starting over shouldn&apos;t mean starting from scratch.
              A registry for breakups, fresh starts, and everything in between.
              Your friends want to help &mdash; let them.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/auth/signup">
                <Button size="lg" variant="primary">
                  Start Your Registry
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/browse">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Browse Registries
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              How it works
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Three steps to a fresh start. No awkward conversations required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 mb-6">
                <ShoppingBag className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Build Your Registry</h3>
              <p className="text-slate-600">
                Add items you need for your fresh start. Paste links from any store or add items manually.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 mb-6">
                <Share2 className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Share With Friends</h3>
              <p className="text-slate-600">
                Send your registry link to friends and family. They can see what you need and claim items.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 mb-6">
                <Heart className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Get Support</h3>
              <p className="text-slate-600">
                Friends claim items or contribute to cash funds. You get the support you need to start fresh.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Everything you need
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              From the basics to the luxuries, we&apos;ve got categories for every part of starting over.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURED_CATEGORIES.map((category) => (
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
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cash Funds */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                Cash funds for bigger goals
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Need help with a security deposit? First month&apos;s rent? A &ldquo;treat yourself&rdquo; fund?
                Create cash funds and let your community chip in.
              </p>
              <div className="mt-8">
                <Link href="/auth/signup">
                  <Button size="lg" variant="primary">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Create a Fund
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-slate-50 rounded-2xl p-8">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-slate-900">Security Deposit Fund</span>
                    <span className="text-sm text-rose-600 font-medium">72%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: '72%' }} />
                  </div>
                  <p className="text-sm text-slate-500 mt-2">$1,440 of $2,000</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-slate-900">New Apartment Essentials</span>
                    <span className="text-sm text-rose-600 font-medium">45%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: '45%' }} />
                  </div>
                  <p className="text-sm text-slate-500 mt-2">$225 of $500</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Merch Carousel */}
      <MerchCarousel />

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-rose-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to start fresh?
          </h2>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
            Your fresh start is just a few clicks away. Create your registry, share it with friends, and let the support roll in.
          </p>
          <div className="mt-10">
            <Link href="/auth/signup">
              <Button size="lg" variant="primary">
                Start Your Registry
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
