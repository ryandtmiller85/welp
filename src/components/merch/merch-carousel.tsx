'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { MERCH_ITEMS, type MerchItem } from '@/lib/merch-items'
import { MerchProductCard } from './merch-product-card'

// Show a curated mix for the carousel — best sellers + new items
const CAROUSEL_ITEMS = MERCH_ITEMS.filter(
  (item) => item.badge === 'Best Seller' || item.badge === 'New' || item.id === 'sticker-pack' || item.id === 'mug-still-here' || item.id === 'hat-dad-black'
).slice(0, 8)

export function MerchCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.querySelector('div')?.offsetWidth || 280
    const scrollAmount = cardWidth + 16 // card width + gap
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount * 2 : scrollAmount * 2,
      behavior: 'smooth',
    })
  }

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Official Merch
            </h2>
            <p className="mt-1 text-slate-500 text-sm sm:text-base">
              Wear the energy. Rep the fresh start.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Arrow buttons */}
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
            <Link
              href="/merch"
              className="ml-2 inline-flex items-center gap-1 text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 sm:-mx-0 sm:px-0 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {CAROUSEL_ITEMS.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-[240px] sm:w-[260px] snap-start"
            >
              <MerchProductCard item={item} size="sm" />
            </div>
          ))}
          {/* "See All" end card */}
          <div className="flex-shrink-0 w-[240px] sm:w-[260px] snap-start">
            <Link href="/merch">
              <div className="h-full bg-gradient-to-br from-rose-50 to-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center min-h-[340px] hover:shadow-md transition-all cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mb-4 group-hover:bg-rose-200 transition-colors">
                  <ArrowRight className="w-7 h-7 text-rose-600" />
                </div>
                <span className="font-semibold text-slate-900">See All Merch</span>
                <span className="text-sm text-slate-500 mt-1">{MERCH_ITEMS.length} items</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
