'use client'

import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number // 0-100
  label?: string
  showPercent?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'rose' | 'green' | 'amber' | 'purple'
  className?: string
}

export function ProgressBar({
  value,
  label,
  showPercent = true,
  size = 'md',
  color = 'rose',
  className,
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 100)

  const heights = { sm: 'h-2', md: 'h-3', lg: 'h-4' }
  const colors = {
    rose: 'bg-rose-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
  }

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm text-slate-600">{label}</span>}
          {showPercent && <span className="text-sm font-medium text-slate-700">{clamped}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-slate-200 rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', colors[color])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
