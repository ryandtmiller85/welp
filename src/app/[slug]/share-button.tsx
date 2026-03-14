'use client'

import { useState } from 'react'

export function ShareButton({ displayName }: { displayName: string }) {
  const [copied, setCopied] = useState(false)

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
    setTimeout(() => setCopied(false), 2000)
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
    <div className="flex-shrink-0">
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
    </div>
  )
}
