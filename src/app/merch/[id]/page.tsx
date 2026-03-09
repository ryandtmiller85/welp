'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Minus, Plus } from 'lucide-react'
import { MERCH_ITEMS, type MerchItem, type SizeVariant } from '@/lib/merch-items'

// ---------------------------------------------------------------------------
// Product Detail Page
// ---------------------------------------------------------------------------

export default function ProductDetailPage() {
  const params = useParams()
  const id = params.id as string
  const item = MERCH_ITEMS.find((i) => i.id === id)

  const [selectedSize, setSelectedSize] = useState<SizeVariant | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Reset loading state on page visibility (bfcache fix)
  useEffect(() => {
    const reset = () => setIsLoading(false)
    window.addEventListener('pageshow', reset)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') reset()
    })
    return () => {
      window.removeEventListener('pageshow', reset)
    }
  }, [])

  // Set default variant on mount
  useEffect(() => {
    if (item) {
      setSelectedSize(item.variants[item.defaultVariantIndex] ?? item.variants[0])
    }
  }, [item])

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Product not found</h1>
          <p className="text-slate-500 mb-6">This item doesn&apos;t exist or has been removed.</p>
          <Link
            href="/merch"
            className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Merch
          </Link>
        </div>
      </div>
    )
  }

  // Use pre-built gallery images from the catalog, or fall back to the single front image
  const galleryImages = item.galleryImages && item.galleryImages.length > 0
    ? item.galleryImages
    : item.imageUrl
      ? [{ label: 'Front', url: item.imageUrl }]
      : []

  async function handleCheckout() {
    if (!selectedSize) return
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout/merch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item!.id,
          variantId: selectedSize.variantId,
          size: selectedSize.label,
          quantity,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed')
      }

      window.location.href = data.url
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setIsLoading(false)
    }
  }

  const hasSizeSelection = item.variants.length > 1

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky nav bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/merch"
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Merch
          </Link>
          <span className="text-sm text-slate-400">welp. merch</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* ── Left: Image Gallery ── */}
          <div>
            {/* Main image */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden aspect-square flex items-center justify-center">
              {galleryImages.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={galleryImages[activeImage]?.url}
                  alt={`${item.title} — ${galleryImages[activeImage]?.label}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: item.color }}
                >
                  <span
                    className="font-black text-4xl"
                    style={{ color: item.design.textColor }}
                  >
                    {item.design.text}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {galleryImages.length > 1 && (
              <div className="flex gap-3 mt-4">
                {galleryImages.map((img, idx) => (
                  <button
                    key={img.label}
                    onClick={() => setActiveImage(idx)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all w-20 h-20 flex-shrink-0 ${
                      activeImage === idx
                        ? 'border-rose-500 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.label}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] text-center py-0.5">
                      {img.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Product Info ── */}
          <div className="flex flex-col">
            {/* Badge */}
            {item.badge && (
              <span
                className={`inline-flex items-center self-start px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${
                  item.badge === 'Best Seller'
                    ? 'bg-amber-100 text-amber-800'
                    : item.badge === 'New'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                }`}
              >
                {item.badge}
              </span>
            )}

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {item.title}
            </h1>

            <p className="text-slate-600 mt-3 leading-relaxed">
              {item.description}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-5">
              <span className="text-3xl font-bold text-slate-900">
                ${item.price.toFixed(2)}
              </span>
              {item.comparePrice && (
                <span className="text-lg line-through text-slate-400">
                  ${item.comparePrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Divider */}
            <hr className="my-6 border-slate-200" />

            {/* Size selector */}
            {hasSizeSelection && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-900 mb-3">
                  Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {item.variants.map((v) => (
                    <button
                      key={v.variantId}
                      onClick={() => setSelectedSize(v)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        selectedSize?.variantId === v.variantId
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-900 mb-3">
                Quantity
              </label>
              <div className="inline-flex items-center border border-slate-200 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 text-sm font-medium text-slate-900 min-w-[2rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                  disabled={quantity >= 10}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-500 mb-4">{error}</p>
            )}

            {/* Buy button */}
            <button
              onClick={handleCheckout}
              disabled={isLoading || !selectedSize}
              className="w-full px-6 py-3.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl font-semibold text-base
                hover:from-rose-600 hover:to-rose-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed
                shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </span>
              ) : (
                `Buy Now — $${(item.price * quantity).toFixed(2)}`
              )}
            </button>

            {/* Shipping note */}
            <p className="text-xs text-slate-400 text-center mt-3">
              Free shipping on orders over $50. Ships to US only.
            </p>

            {/* Collection tag */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                From{' '}
                <Link
                  href={`/merch`}
                  className="text-rose-600 hover:text-rose-700 font-medium"
                >
                  {item.collection === 'essentials'
                    ? 'The Essentials'
                    : item.collection === 'statements'
                      ? 'The Statements'
                      : 'The Petty Collection'}
                </Link>{' '}
                &middot; {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 text-center">
        <p className="text-sm text-slate-400">
          Built with spite and love. All proceeds support fresh starts.
        </p>
      </div>
    </div>
  )
}
