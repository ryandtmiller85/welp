'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Select } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { CATEGORY_LABELS, PRIORITY_LABELS } from '@/lib/constants'
import type { ItemCategory, ItemPriority } from '@/lib/types/database'

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

interface ScrapedData {
  title: string | null
  description: string | null
  imageUrl: string | null
  priceCents: number | null
  retailer: string | null
  sourceUrl: string
}

interface FormData {
  title: string
  description: string
  imageUrl: string
  price: string
  sourceUrl: string
  category: ItemCategory
  priority: ItemPriority
  customNote: string
}

export default function AddItemPage() {
  const [activeTab, setActiveTab] = useState<'url' | 'manual'>('url')
  const [urlInput, setUrlInput] = useState('')
  const [isScaping, setIsScaping] = useState(false)
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    imageUrl: '',
    price: '',
    sourceUrl: '',
    category: 'other',
    priority: 'want',
    customNote: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleScrapeUrl = async () => {
    setSubmitError('')
    setIsScaping(true)

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to scrape URL')
      }

      const data: ScrapedData = await response.json()
      setScrapedData(data)

      // Pre-fill form with scraped data
      setFormData((prev) => ({
        ...prev,
        title: data.title || '',
        description: data.description || '',
        imageUrl: data.imageUrl || '',
        price: data.priceCents ? String(data.priceCents / 100) : '',
        sourceUrl: data.sourceUrl,
      }))
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to scrape URL')
    } finally {
      setIsScaping(false)
    }
  }

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    setSubmitError('')

    if (!formData.title.trim()) {
      setSubmitError('Title is required')
      return
    }

    setIsSubmitting(true)

    try {
      const priceValue = formData.price ? Math.round(parseFloat(formData.price) * 100) : null
      if (formData.price && isNaN(priceValue || 0)) {
        throw new Error('Invalid price format')
      }

      const response = await fetch('/api/registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          imageUrl: formData.imageUrl || null,
          priceCents: priceValue,
          sourceUrl: formData.sourceUrl || null,
          retailer: scrapedData?.retailer || null,
          category: formData.category,
          priority: formData.priority,
          customNote: formData.customNote || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add item')
      }

      setSubmitSuccess(true)
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        price: '',
        sourceUrl: '',
        category: 'other',
        priority: 'want',
        customNote: '',
      })
      setScrapedData(null)
      setUrlInput('')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to add item')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-4">✓</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Item Added!</h2>
              <p className="text-slate-600 mb-6">Your item has been added to your registry.</p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="primary"
                  onClick={() => {
                    setSubmitSuccess(false)
                    setActiveTab('url')
                  }}
                >
                  Add Another Item
                </Button>
                <Button variant="secondary" onClick={() => (window.location.href = '/dashboard')}>
                  View Registry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Add Item to Registry</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('url')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'url'
                ? 'text-rose-600 border-b-2 border-rose-600 -mb-[2px]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Paste URL
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'manual'
                ? 'text-rose-600 border-b-2 border-rose-600 -mb-[2px]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Add Manually
          </button>
        </div>

        {/* Error message */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {submitError}
          </div>
        )}

        {/* Paste URL Tab */}
        {activeTab === 'url' && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-900">Paste Product URL</h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Input
                  label="Product URL"
                  type="url"
                  placeholder="https://www.amazon.com/product-name/dp/..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  id="url-input"
                />
                <Button
                  variant="primary"
                  onClick={handleScrapeUrl}
                  disabled={!urlInput.trim() || isScaping}
                  loading={isScaping}
                  className="w-full"
                >
                  {isScaping ? 'Fetching Details...' : 'Fetch Details'}
                </Button>
              </div>

              {/* Scraped Preview */}
              {scrapedData && (
                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-semibold text-slate-900">Preview & Edit</h3>

                  {scrapedData.imageUrl && (
                    <div className="bg-slate-100 rounded-lg overflow-hidden">
                      <img
                        src={scrapedData.imageUrl}
                        alt={scrapedData.title || 'Product'}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          ;(e.currentTarget as HTMLImageElement).src =
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e2e8f0" width="200" height="200"/%3E%3C/svg%3E'
                        }}
                      />
                    </div>
                  )}

                  <Input
                    label="Title"
                    value={formData.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    id="title-url"
                  />

                  <Textarea
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    id="description-url"
                    placeholder="Product description (optional)"
                  />

                  <Input
                    label="Image URL"
                    value={formData.imageUrl}
                    onChange={(e) => handleFormChange('imageUrl', e.target.value)}
                    id="image-url"
                    placeholder="https://..."
                  />

                  <Input
                    label="Price (USD)"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleFormChange('price', e.target.value)}
                    id="price-url"
                    placeholder="0.00"
                  />

                  {scrapedData.retailer && (
                    <div className="p-3 bg-slate-100 rounded-lg text-sm text-slate-700">
                      Retailer: <strong>{scrapedData.retailer}</strong>
                    </div>
                  )}

                  <Input
                    label="Source URL"
                    type="url"
                    value={formData.sourceUrl}
                    onChange={(e) => handleFormChange('sourceUrl', e.target.value)}
                    id="source-url"
                    placeholder="https://..."
                  />

                  <Select
                    label="Category"
                    value={formData.category}
                    onChange={(e) => handleFormChange('category', e.target.value as ItemCategory)}
                    options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
                    id="category-url"
                  />

                  <Select
                    label="Priority"
                    value={formData.priority}
                    onChange={(e) => handleFormChange('priority', e.target.value as ItemPriority)}
                    options={PRIORITIES.map((p) => ({ value: p.value, label: p.label }))}
                    id="priority-url"
                  />

                  <Textarea
                    label="Custom Note"
                    value={formData.customNote}
                    onChange={(e) => handleFormChange('customNote', e.target.value)}
                    id="note-url"
                    placeholder="Any additional notes (optional)"
                  />

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="primary"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      loading={isSubmitting}
                      className="flex-1"
                    >
                      Add to Registry
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setScrapedData(null)
                        setUrlInput('')
                        setFormData({
                          title: '',
                          description: '',
                          imageUrl: '',
                          price: '',
                          sourceUrl: '',
                          category: 'other',
                          priority: 'want',
                          customNote: '',
                        })
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Manual Add Tab */}
        {activeTab === 'manual' && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-900">Add Item Manually</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Title"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                id="title-manual"
                placeholder="Item name"
                required
              />

              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                id="description-manual"
                placeholder="Product description (optional)"
              />

              <Input
                label="Image URL"
                value={formData.imageUrl}
                onChange={(e) => handleFormChange('imageUrl', e.target.value)}
                id="image-manual"
                placeholder="https://... (optional)"
              />

              <Input
                label="Price (USD)"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleFormChange('price', e.target.value)}
                id="price-manual"
                placeholder="0.00 (optional)"
              />

              <Input
                label="Source URL"
                type="url"
                value={formData.sourceUrl}
                onChange={(e) => handleFormChange('sourceUrl', e.target.value)}
                id="source-manual"
                placeholder="https://... (optional)"
              />

              <Select
                label="Category"
                value={formData.category}
                onChange={(e) => handleFormChange('category', e.target.value as ItemCategory)}
                options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
                id="category-manual"
              />

              <Select
                label="Priority"
                value={formData.priority}
                onChange={(e) => handleFormChange('priority', e.target.value as ItemPriority)}
                options={PRIORITIES.map((p) => ({ value: p.value, label: p.label }))}
                id="priority-manual"
              />

              <Textarea
                label="Custom Note"
                value={formData.customNote}
                onChange={(e) => handleFormChange('customNote', e.target.value)}
                id="note-manual"
                placeholder="Any additional notes (optional)"
              />

              <div className="flex gap-3 pt-4">
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  className="flex-1"
                >
                  Add to Registry
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setFormData({
                      title: '',
                      description: '',
                      imageUrl: '',
                      price: '',
                      sourceUrl: '',
                      category: 'other',
                      priority: 'want',
                      customNote: '',
                    })
                  }
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
