'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Select } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CATEGORY_LABELS, PRIORITY_LABELS } from '@/lib/constants'
import type { ItemCategory, ItemPriority, RegistryItem } from '@/lib/types/database'
import { ArrowLeft, Trash2, ExternalLink } from 'lucide-react'

const CATEGORIES: { value: ItemCategory; label: string }[] = [
  { value: 'the_basics', label: CATEGORY_LABELS.the_basics },
  { value: 'kitchen_reset', label: CATEGORY_LABELS.kitchen_reset },
  { value: 'bedroom_glowup', label: CATEGORY_LABELS.bedroom_glowup },
  { value: 'living_solo', label: CATEGORY_LABELS.living_solo },
  { value: 'self_care', label: CATEGORY_LABELS.self_care },
  { value: 'wheels', label: CATEGORY_LABELS.wheels },
  { value: 'petty_fund', label: CATEGORY_LABELS.petty_fund },
  { value: 'fresh_start_fund', label: CATEGORY_LABELS.fresh_start_fund },
  { value: 'treat_yoself', label: CATEGORY_LABELS.treat_yoself },
  { value: 'pets', label: CATEGORY_LABELS.pets },
  { value: 'tech', label: CATEGORY_LABELS.tech },
  { value: 'other', label: CATEGORY_LABELS.other },
]

const PRIORITIES: { value: ItemPriority; label: string }[] = [
  { value: 'need', label: PRIORITY_LABELS.need },
  { value: 'want', label: PRIORITY_LABELS.want },
  { value: 'dream', label: PRIORITY_LABELS.dream },
]

export default function EditItemPage() {
  const router = useRouter()
  const params = useParams()
  const itemId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    price: '',
    sourceUrl: '',
    category: 'other' as ItemCategory,
    priority: 'want' as ItemPriority,
    customNote: '',
  })
  const [originalItem, setOriginalItem] = useState<RegistryItem | null>(null)

  useEffect(() => {
    async function fetchItem() {
      try {
        const response = await fetch('/api/registry')
        if (!response.ok) {
          router.push('/auth/login')
          return
        }

        const items: RegistryItem[] = await response.json()
        const item = items.find((i) => i.id === itemId)

        if (!item) {
          setMessage({ type: 'error', text: 'Item not found' })
          setLoading(false)
          return
        }

        setOriginalItem(item)
        setFormData({
          title: item.title || '',
          description: item.description || '',
          imageUrl: item.image_url || '',
          price: item.price_cents ? String(item.price_cents / 100) : '',
          sourceUrl: item.source_url || '',
          category: item.category,
          priority: item.priority,
          customNote: item.custom_note || '',
        })
      } catch (error) {
        console.error('Error fetching item:', error)
        setMessage({ type: 'error', text: 'Failed to load item' })
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [itemId, router])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setMessage(null)

    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Title is required' })
      return
    }

    setSaving(true)

    try {
      const priceValue = formData.price ? Math.round(parseFloat(formData.price) * 100) : null
      if (formData.price && isNaN(priceValue || 0)) {
        throw new Error('Invalid price format')
      }

      const response = await fetch(`/api/registry/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          image_url: formData.imageUrl || null,
          price_cents: priceValue,
          source_url: formData.sourceUrl || null,
          category: formData.category,
          priority: formData.priority,
          custom_note: formData.customNote || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update item')
      }

      setMessage({ type: 'success', text: 'Item updated!' })
      setTimeout(() => router.push('/dashboard/items'), 1500)
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/registry/${itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete item')
      }

      router.push('/dashboard/items')
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to delete' })
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600" />
          <p className="mt-4 text-slate-600">Loading item...</p>
        </div>
      </div>
    )
  }

  if (!originalItem && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-8 text-center">
            <p className="text-lg font-semibold text-slate-900 mb-2">Item not found</p>
            <p className="text-slate-600 mb-4">This item may have been deleted or doesn&apos;t belong to you.</p>
            <Link href="/dashboard/items">
              <Button variant="primary">Back to Items</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/dashboard/items"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Items
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-900">Edit Item</h1>
            {originalItem?.status === 'claimed' && (
              <Badge variant="success">Claimed</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">Item Details</h2>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Image Preview */}
            {formData.imageUrl && (
              <div className="bg-slate-100 rounded-lg overflow-hidden">
                <img
                  src={formData.imageUrl}
                  alt={formData.title || 'Product'}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            )}

            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              id="title"
              required
            />

            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              id="description"
              placeholder="Product description (optional)"
            />

            <Input
              label="Image URL"
              value={formData.imageUrl}
              onChange={(e) => handleChange('imageUrl', e.target.value)}
              id="imageUrl"
              placeholder="https://..."
            />

            <Input
              label="Price (USD)"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              id="price"
              placeholder="0.00"
            />

            <Input
              label="Source URL"
              type="url"
              value={formData.sourceUrl}
              onChange={(e) => handleChange('sourceUrl', e.target.value)}
              id="sourceUrl"
              placeholder="https://..."
            />

            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
              id="category"
            />

            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              options={PRIORITIES.map((p) => ({ value: p.value, label: p.label }))}
              id="priority"
            />

            <Textarea
              label="Custom Note"
              value={formData.customNote}
              onChange={(e) => handleChange('customNote', e.target.value)}
              id="customNote"
              placeholder="Any additional notes (optional)"
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-3 sm:flex-row">
            <div className="flex gap-3 flex-1">
              <Link href="/dashboard/items" className="flex-1">
                <Button variant="outline" className="w-full" disabled={saving}>
                  Cancel
                </Button>
              </Link>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSave}
                loading={saving}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
            <div className="sm:ml-3">
              {!showDeleteConfirm ? (
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleDelete}
                    loading={deleting}
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                  </Button>
                </div>
              )}
            </div>
          </CardFooter>
        </Card>

        {/* Source Link */}
        {originalItem?.source_url && (
          <div className="mt-4 text-center">
            <a
              href={originalItem.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-500 hover:text-rose-600 inline-flex items-center gap-1"
            >
              View original product
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
