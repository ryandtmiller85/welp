'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Select } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { CATEGORY_LABELS, PRIORITY_LABELS } from '@/lib/constants'
import type { ItemCategory, ItemPriority } from '@/lib/types/database'
import { ArrowLeft } from 'lucide-react'

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

export default function ProxyAddItemPage() {
  const params = useParams()
  const router = useRouter()
  const proxyId = params.id as string

  const [recipientName, setRecipientName] = useState('')
  const [activeTab, setActiveTab] = useState<'url' | 'manual'>('url')
  const [urlInput, setUrlInput] = useState('')
  const [isScraping, setIsScraping] = useState(false)
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null)
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/proxy-registry`)
        if (res.ok) {
          const registries = await res.json()
          const proxy = registries.find((r: any) => r.id === proxyId)
          if (proxy) setRecipientName(proxy.recipient_name || 'Someone')
        }
      } catch {}
    }
    fetchProfile()
  }, [proxyId])

  const handleScrapeUrl = async () => {
    setSubmitError('')
    setIsScraping(true)
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
      setIsScraping(false)
    }
  }

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
      if (formData.price && isNaN(priceValue || 0)) throw new Error('Invalid price format')

      const response = await fetch('/api/registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proxyProfileId: proxyId,
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
      setFormData({ title: '', description: '', imageUrl: '', price: '', sourceUrl: '', category: 'other', priority: 'want', customNote: '' })
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
              <p className="text-slate-600 mb-6">
                The item has been added to {recipientName}&apos;s registry.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="primary" onClick={() => setSubmitSuccess(false)}>
                  Add Another Item
                </Button>
                <Button variant="secondary" onClick={() => router.push(`/dashboard/proxy/${proxyId}`)}>
                  Back to Management
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
        <Link
          href={`/dashboard/proxy/${proxyId}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {recipientName}&apos;s Registry
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Add Item for {recipientName}
        </h1>
        <p className="text-slate-600 mb-8">Add something {recipientName} needs to their registry.</p>

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

        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {submitError}
          </div>
        )}

        {/* URL Tab */}
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
                  disabled={!urlInput.trim() || isScraping}
                  loading={isScraping}
                  className="w-full"
                >
                  {isScraping ? 'Fetching Details...' : 'Fetch Details'}
                </Button>
              </div>

              {scrapedData && (
                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-semibold text-slate-900">Preview & Edit</h3>
                  {scrapedData.imageUrl && (
                    <div className="bg-slate-100 rounded-lg overflow-hidden">
                      <img src={scrapedData.imageUrl} alt={scrapedData.title || 'Product'} className="w-full h-48 object-cover" />
                    </div>
                  )}
                  <Input label="Title" value={formData.title} onChange={(e) => handleFormChange('title', e.target.value)} id="title-url" />
                  <Textarea label="Description" value={formData.description} onChange={(e) => handleFormChange('description', e.target.value)} id="desc-url" placeholder="Product description (optional)" />
                  <Input label="Price (USD)" type="number" step="0.01" value={formData.price} onChange={(e) => handleFormChange('price', e.target.value)} id="price-url" placeholder="0.00" />
                  <Select label="Category" value={formData.category} onChange={(e) => handleFormChange('category', e.target.value)} options={CATEGORIES} id="cat-url" />
                  <Select label="Priority" value={formData.priority} onChange={(e) => handleFormChange('priority', e.target.value)} options={PRIORITIES} id="pri-url" />
                  <Textarea label="Custom Note" value={formData.customNote} onChange={(e) => handleFormChange('customNote', e.target.value)} id="note-url" placeholder="Any additional notes (optional)" />
                  <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting} loading={isSubmitting} className="w-full">
                    Add to {recipientName}&apos;s Registry
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Manual Tab */}
        {activeTab === 'manual' && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-900">Add Item Manually</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Title" value={formData.title} onChange={(e) => handleFormChange('title', e.target.value)} id="title-manual" placeholder="Item name" required />
              <Textarea label="Description" value={formData.description} onChange={(e) => handleFormChange('description', e.target.value)} id="desc-manual" placeholder="Product description (optional)" />
              <Input label="Image URL" value={formData.imageUrl} onChange={(e) => handleFormChange('imageUrl', e.target.value)} id="img-manual" placeholder="https://... (optional)" />
              <Input label="Price (USD)" type="number" step="0.01" value={formData.price} onChange={(e) => handleFormChange('price', e.target.value)} id="price-manual" placeholder="0.00 (optional)" />
              <Input label="Source URL" type="url" value={formData.sourceUrl} onChange={(e) => handleFormChange('sourceUrl', e.target.value)} id="source-manual" placeholder="https://... (optional)" />
              <Select label="Category" value={formData.category} onChange={(e) => handleFormChange('category', e.target.value)} options={CATEGORIES} id="cat-manual" />
              <Select label="Priority" value={formData.priority} onChange={(e) => handleFormChange('priority', e.target.value)} options={PRIORITIES} id="pri-manual" />
              <Textarea label="Custom Note" value={formData.customNote} onChange={(e) => handleFormChange('customNote', e.target.value)} id="note-manual" placeholder="Any additional notes (optional)" />
              <div className="flex gap-3 pt-4">
                <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting} loading={isSubmitting} className="flex-1">
                  Add to {recipientName}&apos;s Registry
                </Button>
                <Button variant="outline" onClick={() => router.push(`/dashboard/proxy/${proxyId}`)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
