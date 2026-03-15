'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCents } from '@/lib/utils'
import { CATEGORY_LABELS, PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/constants'
import type { RegistryItem } from '@/lib/types/database'
import { Package, ExternalLink, ArrowUp, ArrowDown, GripVertical } from 'lucide-react'

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' }> = {
  available: { label: 'Available', variant: 'default' },
  claimed: { label: 'Claimed', variant: 'success' },
  partially_funded: { label: 'Partial', variant: 'warning' },
  fulfilled: { label: 'Fulfilled', variant: 'success' },
}

export function ReorderableItems({ initialItems }: { initialItems: RegistryItem[] }) {
  const [items, setItems] = useState(initialItems)
  const [reorderMode, setReorderMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  function moveItem(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= items.length) return

    const newItems = [...items]
    const temp = newItems[index]
    newItems[index] = newItems[newIndex]
    newItems[newIndex] = temp
    setItems(newItems)
    setHasChanges(true)
  }

  async function saveOrder() {
    setSaving(true)
    try {
      const res = await fetch('/api/registry/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: items.map((i) => i.id) }),
      })

      if (!res.ok) throw new Error('Failed to save')

      setHasChanges(false)
      setReorderMode(false)
    } catch (error) {
      console.error('Save order failed:', error)
    } finally {
      setSaving(false)
    }
  }

  function cancelReorder() {
    setItems(initialItems)
    setHasChanges(false)
    setReorderMode(false)
  }

  return (
    <div>
      {/* Reorder controls */}
      <div className="flex items-center justify-end gap-2 mb-4">
        {!reorderMode ? (
          <Button variant="outline" size="sm" onClick={() => setReorderMode(true)} className="gap-1.5">
            <GripVertical className="w-4 h-4" />
            Reorder Items
          </Button>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={cancelReorder} disabled={saving}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={saveOrder}
              disabled={!hasChanges || saving}
              loading={saving}
            >
              {saving ? 'Saving...' : 'Save Order'}
            </Button>
          </>
        )}
      </div>

      {reorderMode && (
        <p className="text-sm text-slate-500 mb-4">
          Use the arrows to reorder items. This controls how they appear on your public registry.
        </p>
      )}

      <div className="space-y-3">
        {items.map((item, index) => {
          const status = statusConfig[item.status] || statusConfig.available
          const priorityColor = PRIORITY_COLORS[item.priority] || ''

          return (
            <Card key={item.id} hover={!reorderMode}>
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  {/* Reorder buttons */}
                  {reorderMode && (
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button
                        onClick={() => moveItem(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Move up"
                      >
                        <ArrowUp className="w-4 h-4 text-slate-500" />
                      </button>
                      <button
                        onClick={() => moveItem(index, 'down')}
                        disabled={index === items.length - 1}
                        className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Move down"
                      >
                        <ArrowDown className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                  )}

                  {/* Image Thumbnail */}
                  <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-slate-100 overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{item.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-slate-600">
                        {item.price_cents ? formatCents(item.price_cents) : 'Price TBD'}
                      </span>
                      {item.retailer && (
                        <span className="text-sm text-slate-400">· {item.retailer}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="custom" className={`text-xs ${priorityColor}`}>
                        {PRIORITY_LABELS[item.priority]}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {CATEGORY_LABELS[item.category]}
                      </span>
                    </div>
                  </div>

                  {/* Status + Actions */}
                  {!reorderMode && (
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      {item.source_url && (
                        <a href={item.source_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      )}
                      <Link href={`/dashboard/items/${item.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Position indicator in reorder mode */}
                  {reorderMode && (
                    <span className="text-sm text-slate-400 font-mono flex-shrink-0 w-8 text-center">
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Claimed info */}
                {!reorderMode && item.claimed_by_name && (
                  <p className="text-xs text-slate-400 mt-2 ml-20">
                    Claimed by {item.claimed_by_name}
                    {item.claimed_at && ` on ${new Date(item.claimed_at).toLocaleDateString()}`}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
