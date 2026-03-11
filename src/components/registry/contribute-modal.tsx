'use client'

import { useState } from 'react'
import { X, Heart, Loader2 } from 'lucide-react'
import type { CashFund } from '@/lib/types/database'
import { formatCents } from '@/lib/utils'

interface ContributeModalProps {
  fund: CashFund
  ownerName: string
  isOpen: boolean
  onClose: () => void
}

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000] // cents
const MIN_AMOUNT = 500 // $5.00

export function ContributeModal({ fund, ownerName, isOpen, onClose }: ContributeModalProps) {
  const [amountCents, setAmountCents] = useState<number>(2500)
  const [customAmount, setCustomAmount] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const remaining = fund.goal_cents - fund.raised_cents
  const effectiveAmount = isCustom
    ? Math.round(parseFloat(customAmount || '0') * 100)
    : amountCents

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (effectiveAmount < MIN_AMOUNT) {
      setError('Minimum contribution is $5.00')
      return
    }

    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/checkout/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fund_id: fund.id,
          amount_cents: effectiveAmount,
          contributor_name: name.trim(),
          contributor_email: email.trim() || null,
          message: message.trim() || null,
          is_anonymous: isAnonymous,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        setLoading(false)
        return
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Contribute</h2>
            <p className="text-sm text-slate-500">to {fund.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Fund progress */}
          <div className="bg-rose-50 rounded-lg p-4">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-rose-600">{formatCents(fund.raised_cents)}</span>
              {' '}raised of {formatCents(fund.goal_cents)} goal
            </p>
            {remaining > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                {formatCents(remaining)} still needed
              </p>
            )}
          </div>

          {/* Amount selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              How much would you like to give?
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {PRESET_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => { setAmountCents(amount); setIsCustom(false) }}
                  className={`py-2.5 px-3 rounded-lg border text-sm font-semibold transition-all ${
                    !isCustom && amountCents === amount
                      ? 'border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-200'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {formatCents(amount)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`py-2.5 px-3 rounded-lg border text-sm font-semibold transition-all ${
                  isCustom
                    ? 'border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-200'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                Custom
              </button>
            </div>
            {isCustom && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                <input
                  type="number"
                  min="5"
                  step="0.01"
                  placeholder="5.00"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full pl-7 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Your name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={100}
              required
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
            />
          </div>

          {/* Email (optional) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email <span className="text-slate-400 font-normal">(optional, for receipt)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              maxLength={320}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
            />
          </div>

          {/* Message (optional) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Leave a message <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`A note for ${ownerName}...`}
              maxLength={500}
              rows={2}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 resize-none"
            />
          </div>

          {/* Anonymous toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <span className="text-sm text-slate-600">Make my contribution anonymous</span>
          </label>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || effectiveAmount < MIN_AMOUNT}
            className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting to checkout...
              </>
            ) : (
              <>
                <Heart className="w-4 h-4" />
                Contribute {effectiveAmount >= MIN_AMOUNT ? formatCents(effectiveAmount) : ''}
              </>
            )}
          </button>

          <p className="text-xs text-center text-slate-400">
            Secure payment powered by Stripe. A 5% platform fee supports Welp.
          </p>
        </form>
      </div>
    </div>
  )
}
