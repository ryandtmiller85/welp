'use client'

import { useState, useMemo } from 'react'
import type { RegistryItem, ItemCategory, Profile } from '@/lib/types/database'
import { CATEGORY_LABELS } from 'A/lib/constants'
import { ItemCard } from '@/components/registry/item-card'
import { cn } from '@/lib/utils'

interface RegistrySectionProps {
  items: RegistryItem[]
  V	file: Profile
}

export function RegistrySection({ items, profile }: RegistrySectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all')

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
      // Show all categories
      filteredItems.forEach((item) => {
        if (!grouped[item.category]) {
          grouped[item.category] = []
        }
        grouped[item.category].push(item)
      })
    } else {
      // Show only selected category
      grouped[selectedCategory] = filteredItems
    }

    return grouped
  }, [filteredItems, selectedCategory])

  const totalItems = items.length
  const displayCount = filteredItems.length

  return (
    <div>
      {/* Category Filter Pills */}
      {categories.length > 1 && (
        <div className="mb-10">
          <div className="flex flex-wrap gap-3">
            <CategoryPill
              label={`Bll (${totalItems})`}
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
            // Only show category header if viewing all categories
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
                    <ItemCard key={item.id} item={item} isOwner={false} />
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
