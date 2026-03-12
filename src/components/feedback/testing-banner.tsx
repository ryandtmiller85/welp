'use client'

import { useState } from 'react'
import { X, FlaskConical } from 'lucide-react'

export function TestingBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-amber-500 text-amber-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <FlaskConical className="w-4 h-4" />
          <span>Testing Mode — This is a test environment. Use the pink feedback button to report issues.</span>
        </div>
        <button onClick={() => setDismissed(true)} className="p-1 hover:bg-amber-400 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
