'use client'

import { useState, useMemo } from 'react'
import type { RegistryItem, ItemCategory, Profile } from '@/lib/types/database'
import { CATEGORY_LABELS } from '@/lib/constants'
import { ItemCard } from '@/components/registry/item-card'
import { trackClick } from '@/lib/track'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface RegistrySectionProps {
  items: RegistryItem[]
  profile: Profile
}

export function RegistrySection({ items: initialItems, profile }: RegistrySectionProps) {
  const [items, setItems] = useState<RegistryItem[]>(initialItems)
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all')

  // Claim modal state
  const [claimingItemId, setClaimingItemId] = useState<string | null>(null)
  const [claimName, setClaimName] = useState('')
  const [claimLoading, setClaimLoading] = useState(false)
  const [claimError, setClaimError] = useState('')
  const [claimSuccess, setClaimSuccess] = useState(false)

  // Get unique categories from items
  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map((item) => item.category)))
    return cats as ItemCategory[]
  }, [items])

  // Filter items by selected category
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') {
      return items
    }
    return items.filter((item) => item.category === selectedCategory)
  }, [items, selectedCategory])

  // Group filtered items by category for display
  const itemsByCategory = useMemo(() => {
    const grouped: Record<ItemCategory, RegistryItem[]> = {} as Record<ItemCategory, RegistryItem[]>

    if (selectedCategory === 'all') {
      filteredItems.forEach((item) => {
        if (!grouped[item.category]) {
          grouped[item.category] = []
        }
        grouped[item.category].push(item)
      })
    } else {
      grouped[selectedCategory] = filteredItems
    }

    return grouped
  }, [filteredItems, selectedCategory])

  const totalItems = items.length
  const displayCount = filteredItems.length

  const handleClaimClick = (itemId: string) => {
    setClaimingItemId(itemId)
    setClaimName('')
    setClaimError('')
    setClaimSuccess(false)
  }

  const handleClaimSubmit = async () => {
    if (!claimName.trim()) {
      setClaimError('Please enter your name')
      return
    }

    setClaimLoading(true)
    setClaimError('')

    try {
      const response = await fetch(`/api/registry/${claimingItemId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'claim',
          claimed_by_name: claimName.trim(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to claim item')
      }

      const updatedItem = await response.json()

      // Update item in local state
      setItems((prev) =>
        prev.map((item) =>
          item.id === claimingItemId
            ? { ...item, status: 'claimed' as const, claimed_by_name: claimName.trim(), claimed_at: new Date().toISOString() }
            : item
        )
      )

      setClaimSuccess(true)
    } catch (error) {
      setClaimError(error instanceof Error ? error.message : 'Failed to claim item')
    } finally {
      setClaimLoading(false)
    }
  }

  const claimingItem = claimingItemId ? items.find((i) => i.id === claimingItemId) : null

  return (
    <div>
      {/* Category Filter Pills */}
      {categories.length > 1 && (
        <div className="mb-10">
          <div className="flex flex-wrap gap-3">
            <CategoryPill
              label={`All (${totalItems})`}
              isActive={selectedCategory === 'all'}
              onClick={() => setSelectedCategory('all')}
            />
            {categories.map((category) => {
              const count = items.filter((item) => item.category === category).length
              return (
                <CategoryPill
                  key={category}
                  label={`${CATEGORY_LABELS[category]} (${count})`}
                  isActive={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                />
              )
            })}
          </div>
          {selectedCategory !== 'all' && displayCount > 0 && (
            <p className="text-sm text-slate-600 mt-4">
              Showing {displayCount} {displayCount === 1 ? 'item' : 'items'}
            </p>
          )}
        </div>
      )}

      {/* Items Grid */}
      {displayCount > 0 ? (
        <div className="space-y-12">
          {Object.entries(itemsByCategory).map(([category, categoryItems]) => {
            const shouldShowHeader = selectedCategory === 'all'

            return (
              <div key={category}>
                {shouldShowHeader && categoryItems.length > 0 && (
                  <h3 className="text-xl font-semibold text-slate-800 mb-6">
                    {CATEGORY_LABELS[category as ItemCategory]}
                  </h3>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      isOwner={false}
                      profileId={profile.id}
                      onClaim={handleClaimClick}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🤔</div>
          <p className="text-slate-600">
            No items in this category yet. Check back soon!
          </p>
        </div>
      )}

      {/* Claim Modal */}
      {claimingItemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {claimSuccess ? (
              <div className="p-8 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  You&apos;re amazing!
                </h3>
                <p className="text-slate-600 mb-6">
                  {claimingItem?.title} has been marked as claimed.
                  {claimingItem?.source_url && ' Go ahead and purchase it from the link provided.'}
                </p>
                {(claimingItem?.affiliate_url || claimingItem?.source_url) && (
                  <a
                    href={claimingItem.affiliate_url || claimingItem.source_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mb-3"
                    onClick={() => {
                      const url = claimingItem.affiliate_url || claimingItem.source_url!
                      trackClick({
                        url,
                        retailer: claimingItem.retailer,
                        isAffiliate: !!claimingItem.affiliate_url,
                        registryItemId: claimingItem.id,
                        profileId: profile.id,
                        source: 'registry',
                      })
                    }}
                  >
                    <Button variant="primary" className="w-full">
                      Buy This Item →
                    </Button>
                  </a>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setClaimingItemId(null)
                    setClaimSuccess(false)
                  }}
                >
                  Close
                </Button>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900">
                    Claim &ldquo;{claimingItem?.title}&rdquo;
                  </h3>
                  <p className="text-slate-600 mt-1 text-sm">
                    Let them know who&apos;s got their back.
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  {claimError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                      {claimError}
                    </div>
                  )}

                  <Input
                    label="Your Name"
                    value={claimName}
                    onChange={(e) => setClaimName(e.target.value)}
                    id="claim-name"
                    placeholder="Your first name or nickname"
                    autoFocus
                  />

                  <p className="text-xs text-slate-400">
                    This will be shown on the registry so they know who bought it.
                  </p>
                </div>

                <div className="p-6 border-t border-slate-100 flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setClaimingItemId(null)
                      setClaimError('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleClaimSubmit}
                    disabled={claimLoading}
                    loading={claimLoading}
                  >
                    {claimLoading ? 'Claiming...' : 'I Bought This!'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Category Pill Component
function CategoryPill({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-full font-medium transition-all duration-200 text-sm',
        isActive
          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      )}
    >
      {label}
    </button>
  )
}
