'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import {
  MERCH_ITEMS,
  MERCH_CATEGORIES,
  MERCH_COLLECTIONS,
  type MerchItem,
} from '@/lib/merch-items'
import { MerchProductCard } from '@/components/merch/merch-product-card'

export default function MerchPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeCollection, setActiveCollection] = useState('all')

  const filtered = MERCH_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory
    const matchesCollection = activeCollection === 'all' || item.collection === activeCollection
    return matchesCategory && matchesCollection
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-rose-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(244,63,94,0.15),transparent_60%)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-rose-200 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <ShoppingBag className="w-8 h-8 text-rose-400" />
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              welp. merch
            </h1>
          </div>
          <p className="text-lg text-slate-300 max-w-2xl">
            Wear the vibe. Every purchase supports the mission of helping people start over.
            Because if you&apos;re going to rebuild, you might as well look good doing it.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Collection tabs */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wider">Collections</h3>
          <div className="flex flex-wrap gap-2">
            {MERCH_COLLECTIONS.map((col) => (
              <button
                key={col.id}
                onClick={() => setActiveCollection(col.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCollection === col.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {col.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category filter pills */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wider">Category</h3>
          <div className="flex flex-wrap gap-2">
            {MERCH_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-rose-500 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-rose-200 hover:text-rose-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
            {activeCollection !== 'all' && (
              <span> in <span className="font-medium text-slate-700">{MERCH_COLLECTIONS.find(c => c.id === activeCollection)?.label}</span></span>
            )}
            {activeCategory !== 'all' && (
              <span> &middot; <span className="font-medium text-slate-700">{MERCH_CATEGORIES.find(c => c.id === activeCategory)?.label}</span></span>
            )}
          </p>
          {(activeCategory !== 'all' || activeCollection !== 'all') && (
            <button
              onClick={() => { setActiveCategory('all'); setActiveCollection('all') }}
              className="text-sm text-rose-600 hover:text-rose-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Product grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((item) => (
              <MerchProductCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No items found</h3>
            <p className="text-slate-500 mb-4">Try changing your filters to see more items.</p>
            <button
              onClick={() => { setActiveCategory('all'); setActiveCollection('all') }}
              className="text-sm text-rose-600 hover:text-rose-700 font-medium"
            >
              Show all items
            </button>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-white rounded-2xl border border-slate-200 p-10">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Want custom merch?</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Have an idea for a design? We&apos;re always looking for the next great tagline.
            Drop us a line and we might just make it.
          </p>
          <a
            href="mailto:hello@alliswelp.com"
            className="inline-flex items-center mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Pitch a Design
          </a>
        </div>
      </div>

      {/* Footer tagline */}
      <div className="py-8 text-center">
        <p className="text-sm text-slate-400">
          Built with spite and love. All proceeds support fresh starts.
        </p>
      </div>
    </div>
  )
}
