'use client'

import { useState, useEffect } from 'react'

export function ShareRegistry({ slug }: { slug: string }) {
  const [registryUrl, setRegistryUrl] = useState(() =>
    typeof window !== 'undefined' ? `${window.location.origin}/${slug}` : ''
  )
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Always sync when slug changes or on first client render
    const url = `${window.location.origin}/${slug}`
    if (url !== registryUrl) setRegistryUrl(url)
  }, [slug])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(registryUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = registryUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
        <span className="text-rose-500">↗</span> Share Your Registry
      </h3>
      <p className="text-sm text-slate-600 mb-4">
        Share this link with friends and family to let them help you rebuild:
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          readOnly
          value={registryUrl}
          placeholder="Loading your registry link..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 font-mono"
        />
        <button
          onClick={handleCopy}
          className={`px-5 py-3 font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
            copied
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:shadow-lg'
          }`}
        >
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>
    </div>
  )
}
