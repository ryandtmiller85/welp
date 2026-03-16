'use client'

import { useState } from 'react'

export function ShareButton({ displayName }: { displayName: string }) {
  const [copied, setCopied] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
    setCopied(true)
    setShowToast(true)
    setTimeout(() => setCopied(false), 2000)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''

    // Always copy to clipboard first — gives immediate feedback
    await copyToClipboard(url)

    // Then try native share as a bonus (non-blocking)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${displayName}'s Registry`,
          url,
        })
      } catch {
        // User cancelled — that's fine, link is already copied
      }
    }
  }

  return (
    <div className="flex-shrink-0 relative">
      <button
        onClick={handleShare}
        className={`inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
          copied
            ? 'bg-emerald-500 text-white shadow-lg'
            : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:shadow-lg hover:from-rose-600 hover:to-pink-600'
        }`}
      >
        <span>{copied ? '✓ Link Copied!' : 'Share'}</span>
        {!copied && <span>🔗</span>}
      </button>

      {/* Toast notification — appears below button for extra visibility */}
      {showToast && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
            ✓ Link copied to clipboard
          </div>
        </div>
      )}
    </div>
  )
}
