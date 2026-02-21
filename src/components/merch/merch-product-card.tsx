'use client'

import { MerchItem } from '@/lib/merch-items'
import { Badge } from '@/components/ui/badge'

const BADGE_STYLES: Record<string, string> = {
  'Best Seller': 'bg-amber-100 text-amber-800',
  New: 'bg-emerald-100 text-emerald-800',
  Limited: 'bg-rose-100 text-rose-800',
}

function ProductMockup({ item, size = 'md' }: { item: MerchItem; size?: 'sm' | 'md' }) {
  const isSmall = size === 'sm'

  if (item.category === 'tees' || item.category === 'sweatshirts') {
    return (
      <div
        className={`relative rounded-xl flex items-center justify-center ${isSmall ? 'h-48' : 'h-64'}`}
        style={{ backgroundColor: item.color }}
      >
        <div className="text-center px-4">
          {item.design.type === 'wordmark' && (
            <span
              className={`font-black tracking-tight ${isSmall ? 'text-2xl' : 'text-3xl'}`}
              style={{ color: item.design.textColor }}
            >
              {item.design.text}
            </span>
          )}
          {item.design.type === 'centered-text' && (
            <div>
              <span
                className={`font-black tracking-tight block ${isSmall ? 'text-xl' : 'text-2xl'}`}
                style={{ color: item.design.textColor }}
              >
                {item.design.text}
              </span>
              {item.design.subtext && (
                <span
                  className={`font-medium block mt-1 ${isSmall ? 'text-xs' : 'text-sm'}`}
                  style={{ color: item.design.textColor, opacity: 0.8 }}
                >
                  {item.design.subtext}
                </span>
              )}
            </div>
          )}
          {item.design.type === 'multi-line' && (
            <div>
              <span
                className={`font-bold block whitespace-pre-line leading-tight ${isSmall ? 'text-base' : 'text-lg'}`}
                style={{ color: item.design.textColor }}
              >
                {item.design.text}
              </span>
              {item.design.subtext && (
                <span
                  className={`font-medium block mt-2 ${isSmall ? 'text-xs' : 'text-sm'}`}
                  style={{ color: item.design.textColor, opacity: 0.7 }}
                >
                  {item.design.subtext}
                </span>
              )}
            </div>
          )}
        </div>
        {/* Garment shape hint */}
        {item.category === 'tees' && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-3 rounded-t-full"
            style={{ backgroundColor: item.color, filter: 'brightness(0.85)' }} />
        )}
      </div>
    )
  }

  if (item.category === 'hats') {
    return (
      <div
        className={`relative rounded-xl flex items-center justify-center ${isSmall ? 'h-48' : 'h-64'}`}
        style={{ backgroundColor: item.color }}
      >
        <div className="relative">
          <div className="w-24 h-14 rounded-t-full border-b-4"
            style={{ borderColor: item.design.textColor, opacity: 0.3 }} />
          <span
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black text-sm"
            style={{ color: item.design.textColor }}
          >
            {item.design.text}
          </span>
        </div>
      </div>
    )
  }

  if (item.category === 'mugs') {
    return (
      <div
        className={`relative rounded-xl flex items-center justify-center ${isSmall ? 'h-48' : 'h-64'}`}
        style={{ backgroundColor: '#f1f5f9' }}
      >
        <div className="relative">
          <div
            className="w-20 h-24 rounded-lg border-4 flex items-center justify-center"
            style={{ backgroundColor: item.color, borderColor: item.color === '#ffffff' ? '#e2e8f0' : item.color }}
          >
            <div className="text-center px-1">
              <span
                className="font-black block text-sm"
                style={{ color: item.design.textColor }}
              >
                {item.design.text}
              </span>
              {item.design.subtext && (
                <span
                  className="text-[10px] block mt-0.5"
                  style={{ color: item.design.textColor, opacity: 0.8 }}
                >
                  {item.design.subtext}
                </span>
              )}
            </div>
          </div>
          {/* Mug handle */}
          <div
            className="absolute top-3 -right-3 w-4 h-10 rounded-r-full border-4"
            style={{ borderColor: item.color === '#ffffff' ? '#e2e8f0' : item.color, borderLeft: 'none' }}
          />
        </div>
      </div>
    )
  }

  if (item.category === 'totes') {
    return (
      <div
        className={`relative rounded-xl flex items-center justify-center ${isSmall ? 'h-48' : 'h-64'}`}
        style={{ backgroundColor: '#f8fafc' }}
      >
        <div className="relative">
          {/* Handles */}
          <div className="flex justify-center gap-6 -mb-1">
            <div className="w-1.5 h-6 rounded-t-full" style={{ backgroundColor: item.color }} />
            <div className="w-1.5 h-6 rounded-t-full" style={{ backgroundColor: item.color }} />
          </div>
          <div
            className="w-24 h-28 rounded-b-lg flex items-center justify-center"
            style={{ backgroundColor: item.color }}
          >
            <span
              className="font-black"
              style={{ color: item.design.textColor, fontSize: item.design.fontSize || '18px' }}
            >
              {item.design.text}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Stickers
  return (
    <div
      className={`relative rounded-xl flex items-center justify-center ${isSmall ? 'h-48' : 'h-64'}`}
      style={{ backgroundColor: '#f8fafc' }}
    >
      <div className="grid grid-cols-2 gap-2 p-4">
        {['welp.', 'still here.', 'fresh start', 'main character'].map((text) => (
          <div
            key={text}
            className="w-14 h-14 rounded-full flex items-center justify-center text-[9px] font-bold"
            style={{ backgroundColor: item.color, color: item.design.textColor }}
          >
            {text}
          </div>
        ))}
      </div>
    </div>
  )
}

interface MerchProductCardProps {
  item: MerchItem
  size?: 'sm' | 'md'
}

export function MerchProductCard({ item, size = 'md' }: MerchProductCardProps) {
  const isSmall = size === 'sm'

  return (
    <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
      <div className="relative overflow-hidden">
        <ProductMockup item={item} size={size} />
        {item.badge && (
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${BADGE_STYLES[item.badge] || 'bg-slate-100 text-slate-800'}`}>
              {item.badge}
            </span>
          </div>
        )}
      </div>
      <div className={`${isSmall ? 'p-3' : 'p-4'}`}>
        <h3 className={`font-semibold text-slate-900 ${isSmall ? 'text-sm' : 'text-base'} line-clamp-1`}>
          {item.title}
        </h3>
        {!isSmall && (
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.description}</p>
        )}
        <div className={`flex items-center gap-2 ${isSmall ? 'mt-2' : 'mt-3'}`}>
          <span className={`font-bold text-slate-900 ${isSmall ? 'text-sm' : 'text-lg'}`}>
            ${item.price.toFixed(2)}
          </span>
          {item.comparePrice && (
            <span className={`line-through text-slate-400 ${isSmall ? 'text-xs' : 'text-sm'}`}>
              ${item.comparePrice.toFixed(2)}
            </span>
          )}
        </div>
        <a
          href={item.buyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-3 w-full inline-flex items-center justify-center font-medium rounded-lg transition-all
            bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700
            ${isSmall ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}`}
        >
          Shop Now
        </a>
      </div>
    </div>
  )
}
