'use client'

export function ShareButton({ displayName }: { displayName: string }) {
  return (
    <div className="flex-shrink-0">
      <button
        onClick={() => {
          const url = typeof window !== 'undefined' ? window.location.href : ''
          if (typeof navigator !== 'undefined' && navigator.share) {
            navigator.share({
              title: `${displayName}'s Registry`,
              url,
            })
          } else {
            if (typeof navigator !== 'undefined') {
              navigator.clipboard.writeText(url)
            }
            alert('Link copied to clipboard!')
          }
        }}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-200 whitespace-nowrap"
      >
        <span>Share</span>
        <span>🔗</span>
      </button>
    </div>
  )
}
