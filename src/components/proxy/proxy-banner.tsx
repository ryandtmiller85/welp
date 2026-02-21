import { Heart } from 'lucide-react'

interface ProxyBannerProps {
  advocateName: string
  relationship: string
}

export function ProxyBanner({ advocateName, relationship }: ProxyBannerProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 border border-rose-100 rounded-xl text-sm">
      <Heart className="w-4 h-4 text-rose-500 flex-shrink-0" />
      <p className="text-rose-700">
        Created with love by{' '}
        <span className="font-semibold">{advocateName}</span>
        <span className="text-rose-500"> ({relationship})</span>
      </p>
    </div>
  )
}
