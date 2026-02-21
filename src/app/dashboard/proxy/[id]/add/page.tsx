'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Select } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { CuratedProductCard } from '@/components/shop/curated-product-card'
import { CURATED_ITEMS, type CuratedItem } from '@/lib/curated-items'
import { CATEGORY_LABELS, CATEGORY_DESCRIPTIONS, PRIORITY_LABELS } from '@/lib/constants'
import { constructAffiliateUrl } from '@/lib/utils'
import type { ItemCategory, ItemPriority } from '@/lib/types/database'
import {
  ArrowLeft,
  Package,
  UtensilsCrossed,
  Bed,
  Sofa,
  Coffee,
  Flame,
  Sparkles,
  PawPrint,
  Link as LinkIcon,
  PenLine,
  Search,
  ExternalLink,
} from 'lucide-react'

// Categories that have curated items
const CATALOG_CATEGORIES: { key: ItemCategory; icon: React.ReactNode }[] = [
  { key: 'the_basics', icon: <Package className="w-6 h-6" /> },
  { key: 'kitchen_reset', icon: <UtensilsCrossed className="w-6 h-6" /> },
  { key: 'bedroom_glowup', icon: <Bed className="w-6 h-6" /> },
  { key: 'living_solo', icon: <Sofa className="w-6 h-6" /> },
  { key: 'self_care', icon: <Coffee className="w-6 h-6" /> },
  { key: 'petty_fund', icon: <Flame className="w-6 h-6" /> },
  { key: 'treat_yoself', icon: <Sparkles className="w-6 h-6" /> },
  { key: 'pets', icon: <PawPrint className="w-6 h-6" /> },
]

const ALL_CATEGORIES: { value: ItemCategory; label: string }[] = [
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

const MARKETPLACES = [
  { name: 'Amazon', color: '#FF9900', searchUrl: (q: string) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}&tag=welp-20` },
  { name: 'Target', color: '#CC0000', searchUrl: (q: string) => `https://www.target.com/s?searchTerm=${encodeURIComponent(q)}` },
  { name: 'Walmart', color: '#0071DC', searchUrl: (q: string) => `https://www.walmart.com/search?q=${encodeURIComponent(q)}` },
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
  const [activeTab, setActiveTab] = useState<'catalog' | 'url' | 'manual'>('catalog')
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(null)
  const [showMarketplaceSearch, setShowMarketplaceSearch] = useState(false)

  // Marketplace search state
  const [marketplaceQuery, setMarketplaceQuery] = useState('')
  const [marketplaceUrlInput, setMarketplaceUrlInput] = useState('')
  const [isMarketplaceScraping, setIsMarketplaceScraping] = useState(false)
  const [marketplaceScrapedData, setMarketplaceScrapedData] = useState<ScrapedData | null>(null)
  const [marketplaceFormData, setMarketplaceFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    price: '',
    sourceUrl: '',
    category: 'other' as ItemCategory,
    priority: 'want' as ItemPriority,
    customNote: '',
  })
  const [isMarketplaceSubmitting, setIsMarketplaceSubmitting] = useState(false)

  // Catalog state
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set())
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // URL scrape state
  const [urlInput, setUrlInput] = useState('')
  const [isScraping, setIsScraping] = useState(false)
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null)

  // Form state
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

  // Fetch recipient name
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

  // ── Catalog handlers ──────────────────────────────────────────────────

  async function handleAddFromCatalog(item: CuratedItem) {
    setAddingIds((prev) => new Set(prev).add(item.id))

    try {
      const category = CATALOG_CATEGORIES.find((c) => {
        const items = CURATED_ITEMS[c.key] ?? []
        return items.some((i) => i.id === item.id)
      })?.key || 'other'

      const res = await fetch('/api/registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proxyProfileId: proxyId,
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
      showToast(`"${item.title}" added to ${recipientName}'s registry!`, 'success')
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

  // ── Marketplace search handlers ─────────────────────────────────────

  function openMarketplaceSearch() {
    setShowMarketplaceSearch(true)
    setMarketplaceUrlInput('')
    setMarketplaceScrapedData(null)
    setMarketplaceQuery('')
    if (selectedCategory) {
      setMarketplaceFormData((prev) => ({ ...prev, category: selectedCategory }))
    }
  }

  function handleSearchMarketplace(marketplace: typeof MARKETPLACES[number]) {
    const query = marketplaceQuery.trim() || CATEGORY_LABELS[selectedCategory || 'other']
    window.open(marketplace.searchUrl(query), '_blank')
  }

  async function handleMarketplaceScrape() {
    setSubmitError('')
    setIsMarketplaceScraping(true)

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: marketplaceUrlInput }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to scrape URL')
      }

      const data: ScrapedData = await response.json()
      setMarketplaceScrapedData(data)

      setMarketplaceFormData((prev) => ({
        ...prev,
        title: data.title || '',
        description: data.description || '',
        imageUrl: data.imageUrl || '',
        price: data.priceCents ? String(data.priceCents / 100) : '',
        sourceUrl: data.sourceUrl,
        category: selectedCategory || prev.category,
      }))
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to scrape URL')
    } finally {
      setIsMarketplaceScraping(false)
    }
  }

  async function handleMarketplaceSubmit() {
    setSubmitError('')
    if (!marketplaceFormData.title.trim()) {
      setSubmitError('Title is required')
      return
    }

    setIsMarketplaceSubmitting(true)

    try {
      const priceValue = marketplaceFormData.price
        ? Math.round(parseFloat(marketplaceFormData.price) * 100)
        : null
      if (marketplaceFormData.price && isNaN(priceValue || 0)) throw new Error('Invalid price format')

      const affiliateUrl = constructAffiliateUrl(marketplaceFormData.sourceUrl)

      const response = await fetch('/api/registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proxyProfileId: proxyId,
          title: marketplaceFormData.title,
          description: marketplaceFormData.description || null,
          imageUrl: marketplaceFormData.imageUrl || null,
          priceCents: priceValue,
          sourceUrl: marketplaceFormData.sourceUrl || null,
          affiliateUrl: affiliateUrl || null,
          retailer: marketplaceScrapedData?.retailer || null,
          category: marketplaceFormData.category,
          priority: marketplaceFormData.priority,
          customNote: marketplaceFormData.customNote || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add item')
      }

      showToast(`"${marketplaceFormData.title}" added to ${recipientName}'s registry!`, 'success')
      setShowMarketplaceSearch(false)
      setMarketplaceScrapedData(null)
      setMarketplaceUrlInput('')
      setMarketplaceFormData({
        title: '',
        description: '',
        imageUrl: '',
        price: '',
        sourceUrl: '',
        category: selectedCategory || 'other',
        priority: 'want',
        customNote: '',
      })
    } catch (error: any) {
      setSubmitError(error.message || 'Something went wrong')
    } finally {
      setIsMarketplaceSubmitting(false)
    }
  }

  // ── URL scrape handlers ───────────────────────────────────────────────

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

  // ── Form handlers ─────────────────────────────────────────────────────

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

      // Auto-construct affiliate URL for the Paste URL tab
      const affiliateUrl = activeTab === 'url' ? constructAffiliateUrl(formData.sourceUrl) : null

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
          affiliateUrl: affiliateUrl || null,
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

  const resetForm = () => {
    setFormData({ title: '', description: '', imageUrl: '', price: '', sourceUrl: '', category: 'other', priority: 'want', customNote: '' })
    setScrapedData(null)
    setUrlInput('')
    setSubmitError('')
  }

  // ── Success screen ────────────────────────────────────────────────────

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
                <Button
                  variant="primary"
                  onClick={() => { setSubmitSuccess(false); setActiveTab('catalog'); setSelectedCategory(null) }}
                >
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

  // ── Main render ───────────────────────────────────────────────────────

  const catalogItems = selectedCategory ? (CURATED_ITEMS[selectedCategory] ?? []) : []

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
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
        <p className="text-slate-600 mb-8">
          Browse curated picks or add your own items to {recipientName}&apos;s registry.
        </p>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-slate-200">
          <button
            onClick={() => { setActiveTab('catalog'); setSelectedCategory(null); setShowMarketplaceSearch(false) }}
            className={`px-4 py-2.5 font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'catalog'
                ? 'text-rose-600 border-b-2 border-rose-600 -mb-[2px]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Browse Catalog
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`px-4 py-2.5 font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'url'
                ? 'text-rose-600 border-b-2 border-rose-600 -mb-[2px]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            Paste URL
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2.5 font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'manual'
                ? 'text-rose-600 border-b-2 border-rose-600 -mb-[2px]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <PenLine className="w-4 h-4" />
            Add Manually
          </button>
        </div>

        {/* Error message */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {submitError}
          </div>
        )}

        {/* ── Browse Catalog Tab ─────────────────────────────────────── */}
        {activeTab === 'catalog' && !selectedCategory && (
          <div>
            <p className="text-sm text-slate-500 mb-6">
              Pick a category to browse curated items — one click to add to {recipientName}&apos;s registry.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CATALOG_CATEGORIES.map(({ key, icon }) => {
                const items = CURATED_ITEMS[key] ?? []
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className="text-left"
                  >
                    <Card hover className="h-full cursor-pointer">
                      <CardContent className="py-6 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 text-rose-600 mb-3">
                          {icon}
                        </div>
                        <h3 className="font-semibold text-slate-900 text-sm">
                          {CATEGORY_LABELS[key]}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {CATEGORY_DESCRIPTIONS[key]}
                        </p>
                        <p className="text-xs text-rose-600 font-medium mt-2">
                          {items.length} items
                        </p>
                      </CardContent>
                    </Card>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'catalog' && selectedCategory && !showMarketplaceSearch && (
          <div>
            <button
              onClick={() => setSelectedCategory(null)}
              className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to categories
            </button>

            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {CATEGORY_LABELS[selectedCategory]}
            </h2>
            <p className="text-slate-600 text-sm mb-6">
              {CATEGORY_DESCRIPTIONS[selectedCategory]}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {catalogItems.map((item) => (
                <CuratedProductCard
                  key={item.id}
                  item={item}
                  onAddToRegistry={handleAddFromCatalog}
                  isAdding={addingIds.has(item.id)}
                  isAdded={addedIds.has(item.id)}
                />
              ))}

              {/* "Something Else?" card */}
              <button
                onClick={openMarketplaceSearch}
                className="text-left"
              >
                <Card className="flex flex-col h-full overflow-hidden border-2 border-dashed border-slate-300 hover:border-rose-300 hover:bg-rose-50/50 transition-all cursor-pointer">
                  <div className="relative aspect-square bg-slate-50 overflow-hidden flex items-center justify-center">
                    <div className="text-center px-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-rose-500 mb-3">
                        <Search className="w-8 h-8" />
                      </div>
                      <h3 className="font-semibold text-slate-700 text-sm">
                        Don&apos;t see what you need?
                      </h3>
                    </div>
                  </div>
                  <CardContent className="flex flex-col flex-1 py-4 text-center">
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">
                      Search Amazon, Target, Walmart and add any item — we&apos;ll handle the rest.
                    </p>
                    <div className="mt-auto">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-600">
                        <Search className="w-3.5 h-3.5" />
                        Search Stores
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </button>
            </div>
          </div>
        )}

        {/* ── Marketplace Search Flow ────────────────────────────────── */}
        {activeTab === 'catalog' && selectedCategory && showMarketplaceSearch && (
          <div>
            <button
              onClick={() => {
                setShowMarketplaceSearch(false)
                setMarketplaceScrapedData(null)
                setMarketplaceUrlInput('')
                setSubmitError('')
              }}
              className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {CATEGORY_LABELS[selectedCategory]}
            </button>

            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              Search Partner Stores
            </h2>
            <p className="text-slate-600 text-sm mb-6">
              Find what you&apos;re looking for, then paste the product link below.
            </p>

            {/* Search & store buttons */}
            <Card className="mb-6">
              <CardContent className="py-6">
                <label htmlFor="mp-search" className="block text-sm font-medium text-slate-700 mb-2">
                  What are you looking for?
                </label>
                <div className="flex gap-2 mb-4">
                  <Input
                    id="mp-search"
                    placeholder={`e.g. "cast iron skillet", "throw pillows"...`}
                    value={marketplaceQuery}
                    onChange={(e) => setMarketplaceQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && marketplaceQuery.trim()) {
                        handleSearchMarketplace(MARKETPLACES[0])
                      }
                    }}
                  />
                </div>

                <p className="text-xs text-slate-500 mb-3">Open a store to search — then copy the product URL:</p>
                <div className="flex flex-wrap gap-2">
                  {MARKETPLACES.map((mp) => (
                    <button
                      key={mp.name}
                      onClick={() => handleSearchMarketplace(mp)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-sm font-medium text-slate-700"
                    >
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: mp.color }}
                      />
                      {mp.name}
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Paste URL section */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">Paste the product URL</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    label="Product URL"
                    type="url"
                    placeholder="https://www.amazon.com/dp/..."
                    value={marketplaceUrlInput}
                    onChange={(e) => setMarketplaceUrlInput(e.target.value)}
                    id="mp-url-input"
                  />
                  <Button
                    variant="primary"
                    onClick={handleMarketplaceScrape}
                    disabled={!marketplaceUrlInput.trim() || isMarketplaceScraping}
                    loading={isMarketplaceScraping}
                    className="w-full"
                  >
                    {isMarketplaceScraping ? 'Fetching Details...' : 'Fetch Details'}
                  </Button>
                </div>

                {marketplaceScrapedData && (
                  <div className="border-t pt-6 space-y-4">
                    <h3 className="font-semibold text-slate-900">Preview & Edit</h3>

                    {marketplaceScrapedData.imageUrl && (
                      <div className="bg-slate-100 rounded-lg overflow-hidden">
                        <img
                          src={marketplaceScrapedData.imageUrl}
                          alt={marketplaceScrapedData.title || 'Product'}
                          className="w-full h-48 object-contain p-2"
                        />
                      </div>
                    )}

                    {constructAffiliateUrl(marketplaceFormData.sourceUrl) && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
                        Affiliate link will be included — you&apos;ll earn commission on this item!
                      </div>
                    )}

                    <Input label="Title" value={marketplaceFormData.title} onChange={(e) => setMarketplaceFormData(prev => ({ ...prev, title: e.target.value }))} id="mp-title" />
                    <Textarea label="Description" value={marketplaceFormData.description} onChange={(e) => setMarketplaceFormData(prev => ({ ...prev, description: e.target.value }))} id="mp-desc" placeholder="Product description (optional)" />
                    <Input label="Price (USD)" type="number" step="0.01" value={marketplaceFormData.price} onChange={(e) => setMarketplaceFormData(prev => ({ ...prev, price: e.target.value }))} id="mp-price" placeholder="0.00" />

                    {marketplaceScrapedData.retailer && (
                      <div className="p-3 bg-slate-100 rounded-lg text-sm text-slate-700">
                        Retailer: <strong>{marketplaceScrapedData.retailer}</strong>
                      </div>
                    )}

                    <Select label="Category" value={marketplaceFormData.category} onChange={(e) => setMarketplaceFormData(prev => ({ ...prev, category: e.target.value as ItemCategory }))} options={ALL_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))} id="mp-cat" />
                    <Select label="Priority" value={marketplaceFormData.priority} onChange={(e) => setMarketplaceFormData(prev => ({ ...prev, priority: e.target.value as ItemPriority }))} options={PRIORITIES.map((p) => ({ value: p.value, label: p.label }))} id="mp-pri" />

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="primary"
                        onClick={handleMarketplaceSubmit}
                        disabled={isMarketplaceSubmitting}
                        loading={isMarketplaceSubmitting}
                        className="flex-1"
                      >
                        Add to {recipientName}&apos;s Registry
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setMarketplaceScrapedData(null)
                          setMarketplaceUrlInput('')
                          setMarketplaceFormData(prev => ({ ...prev, title: '', description: '', imageUrl: '', price: '', sourceUrl: '' }))
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Paste URL Tab ──────────────────────────────────────────── */}
        {activeTab === 'url' && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-900">Paste Product URL</h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Input label="Product URL" type="url" placeholder="https://www.amazon.com/product-name/dp/..." value={urlInput} onChange={(e) => setUrlInput(e.target.value)} id="url-input" />
                <Button variant="primary" onClick={handleScrapeUrl} disabled={!urlInput.trim() || isScraping} loading={isScraping} className="w-full">
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

                  {constructAffiliateUrl(formData.sourceUrl) && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
                      Affiliate link detected — you&apos;ll earn commission on this item!
                    </div>
                  )}

                  <Input label="Title" value={formData.title} onChange={(e) => handleFormChange('title', e.target.value)} id="title-url" />
                  <Textarea label="Description" value={formData.description} onChange={(e) => handleFormChange('description', e.target.value)} id="desc-url" placeholder="Product description (optional)" />
                  <Input label="Price (USD)" type="number" step="0.01" value={formData.price} onChange={(e) => handleFormChange('price', e.target.value)} id="price-url" placeholder="0.00" />
                  <Select label="Category" value={formData.category} onChange={(e) => handleFormChange('category', e.target.value)} options={ALL_CATEGORIES} id="cat-url" />
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

        {/* ── Manual Add Tab ─────────────────────────────────────────── */}
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
              <Select label="Category" value={formData.category} onChange={(e) => handleFormChange('category', e.target.value)} options={ALL_CATEGORIES} id="cat-manual" />
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
