'use client'

import Link from 'next/link'
import { MerchItem } from '@/lib/merch-items'

const BADGE_STYLES: Record<string, string> = {
  'Best Seller': 'bg-amber-100 text-amber-800',
  New: 'bg-emerald-100 text-emerald-800',
  Limited: 'bg-rose-100 text-rose-800',
}

interface MerchProductCardProps {
  item: MerchItem
  size?: 'sm' | 'md'
}

export function MerchProductCard({ item, size = 'md' }: MerchProductCardProps) {
  const isSmall = size === 'sm'

  return (
    <Link
      href={`/merch/${item.id}`}
      className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden block"
    >
      <div className="relative overflow-hidden">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.title}
            className={`w-full object-cover ${isSmall ? 'h-48' : 'h-64'}`}
          />
        ) : (
          <div
            className={`relative rounded-xl flex items-center justify-center ${isSmall ? 'h-48' : 'h-64'}`}
            style={{ backgroundColor: item.color }}
          >
            <span
              className="font-black text-2xl"
              style={{ color: item.design.textColor }}
            >
              {item.design.text}
            </span>
          </div>
        )}
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
        <span
          className={`mt-3 w-full inline-flex items-center justify-center font-medium rounded-lg transition-all
            bg-gradient-to-r from-rose-500 to-rose-600 text-white group-hover:from-rose-600 group-hover:to-rose-700
            ${isSmall ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}`}
        >
          Shop Now
        </span>
      </div>
    </Link>
  )
}
