'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { CuratedProductCard } from './curated-product-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { CuratedItem } from '@/lib/curated-items'
import type { ItemCategory } from '@/lib/types/database'
import { CATEGORY_LABELS, CATEGORY_DESCRIPTIONS } from '@/lib/constants'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

interface CategoryShopClientProps {
  category: ItemCategory
  items: CuratedItem[]
  retailers: string[]
  isLoggedIn: boolean
}

export function CategoryShopClient({
  category,
  items,
  retailers,
  isLoggedIn,
}: CategoryShopClientProps) {
  const router = useRouter()
  const [activeRetailer, setActiveRetailer] = useState<string | null>(null)
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set())
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const filteredItems = useMemo(() => {
    if (!activeRetailer) return items
    return items.filter((item) => item.retailer === activeRetailer)
  }, [items, activeRetailer])

  async function handleAddToRegistry(item: CuratedItem) {
    if (!isLoggedIn) {
      router.push(`/auth/login?redirect=/shop/${category}`)
      return
    }

    setAddingIds((prev) => new Set(prev).add(item.id))

    try {
      const res = await fetch('/api/registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: item.title,
          description: item.description,
          imageUrl: item.imageUrl,
          sourceUrl: item.sourceUrl,
          affiliateUrl: item.affiliateUrl || null,
          retailer: item.retailer,
          priceCents: Math.round(item.price * 100),
          category,
          priority: 'want',
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to add item')
      }

      setAddedIds((prev) => new Set(prev).add(item.id))
      showToast(`"${item.title}" added to your registry!`, 'success')
    } catch (error: any) {
      showToast(error.message || 'Something went wrong', 'error')
    } finally {
      setAddingIds((prev) => {
        const next = new Set(prev)
        next.delete(item.id)
        return next
      })
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/#categories"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to categories
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                {CATEGORY_LABELS[category]}
              </h1>
              <p className="mt-2 text-lg text-slate-600 max-w-2xl">
                {CATEGORY_DESCRIPTIONS[category]}
              </p>
            </div>
            {isLoggedIn && (
              <Link href="/dashboard" className="flex-shrink-0">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <ShoppingBag className="w-4 h-4" />
                  My Registry
                </Button>
              </Link>
            )}
          </div>

          {/* Retailer Tabs */}
          {retailers.length > 1 && (
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveRetailer(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeRetailer === null
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                All ({items.length})
              </button>
              {retailers.map((retailer) => {
                const count = items.filter((i) => i.retailer === retailer).length
                return (
                  <button
                    key={retailer}
                    onClick={() =>
                      setActiveRetailer(activeRetailer === retailer ? null : retailer)
                    }
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeRetailer === retailer
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {retailer} ({count})
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isLoggedIn && (
          <div className="mb-6 bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between">
            <p className="text-sm text-rose-800">
              Sign in to add items to your registry
            </p>
            <Link href={`/auth/login?redirect=/shop/${category}`}>
              <Button variant="primary" size="sm">
                Sign In
              </Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <CuratedProductCard
              key={item.id}
              item={item}
              onAddToRegistry={handleAddToRegistry}
              isAdding={addingIds.has(item.id)}
              isAdded={addedIds.has(item.id)}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-500">No items found for this filter.</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => setActiveRetailer(null)}
            >
              Show all items
            </Button>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-sm font-medium transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
