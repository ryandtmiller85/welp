'use client'

import { useSearchParams } from 'next/navigation'
import { Heart, X } from 'lucide-react'
import { useState } from 'react'

export function ContributionSuccess() {
  const searchParams = useSearchParams()
  const contributed = searchParams.get('contributed') === 'true'
  const [dismissed, setDismissed] = useState(false)

  if (!contributed || dismissed) return null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
        <Heart className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0 fill-green-600" />
        <div className="flex-1">
          <p className="font-semibold text-green-800">Thank you for your contribution!</p>
          <p className="text-sm text-green-700 mt-1">
            Your support means the world. The registry owner will be notified.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded hover:bg-green-100 transition-colors"
        >
          <X className="w-4 h-4 text-green-600" />
        </button>
      </div>
    </div>
  )
}
