'use client'

import { useState, useEffect } from 'react'

export function ShareRegistry({ slug }: { slug: string }) {
  const [registryUrl, setRegistryUrl] = useState(() =>
    typeof window !== 'undefined' ? `${window.location.origin}/${slug}` : ''
  )
  const [copied, setCopied] = useState(false)
  const [personalNote, setPersonalNote] = useState('')
  const [showNoteField, setShowNoteField] = useState(false)

  useEffect(() => {
    // Always sync when slug changes or on first client render
    const url = `${window.location.origin}/${slug}`
    if (url !== registryUrl) setRegistryUrl(url)
  }, [slug])

  function buildShareText() {
    if (personalNote.trim()) {
      return `${personalNote.trim()}\n\n${registryUrl}`
    }
    return registryUrl
  }

  const handleCopy = async () => {
    const text = buildShareText()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = text
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

      {/* Personal note toggle + field */}
      {!showNoteField ? (
        <button
          onClick={() => setShowNoteField(true)}
          className="text-sm text-rose-600 hover:text-rose-700 font-medium mb-4 inline-block"
        >
          + Add a personal note
        </button>
      ) : (
        <div className="mb-4">
          <label htmlFor="share-note" className="block text-sm font-medium text-slate-700 mb-1">
            Personal note (copied with the link)
          </label>
          <textarea
            id="share-note"
            value={personalNote}
            onChange={(e) => setPersonalNote(e.target.value)}
            placeholder="Hey — I finally made a list of what I need. No pressure, but if you've been asking how to help, this is it."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
            maxLength={500}
          />
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-slate-400">{personalNote.length}/500</p>
            <button
              onClick={() => { setShowNoteField(false); setPersonalNote('') }}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Remove note
            </button>
          </div>
        </div>
      )}

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
          {copied ? '✓ Copied!' : personalNote.trim() ? '📋 Copy with Note' : '📋 Copy'}
        </button>
      </div>

      {/* Preview of what will be copied */}
      {personalNote.trim() && (
        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-xs text-slate-400 mb-1 font-medium">Preview (what gets copied):</p>
          <p className="text-sm text-slate-600 whitespace-pre-wrap">{buildShareText()}</p>
        </div>
      )}
    </div>
  )
}
