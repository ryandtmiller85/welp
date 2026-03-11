'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, ExternalLink, Loader2, AlertCircle, DollarSign, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ConnectStatus {
  connected: boolean
  onboarding_complete: boolean
  charges_enabled: boolean
  payouts_enabled: boolean
  account_id?: string
}

export default function PayoutsPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<ConnectStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [onboarding, setOnboarding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const justReturned = searchParams.get('success') === 'true'
  const needsRefresh = searchParams.get('refresh') === 'true'

  useEffect(() => {
    fetchStatus()
  }, [])

  async function fetchStatus() {
    try {
      const res = await fetch('/api/connect/status')
      const data = await res.json()
      if (res.ok) {
        setStatus(data)
      } else {
        setError(data.error || 'Failed to load status')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  async function handleSetupPayouts() {
    setOnboarding(true)
    setError(null)

    try {
      const res = await fetch('/api/connect/onboard', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to start onboarding')
        setOnboarding(false)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError('Network error. Please try again.')
      setOnboarding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
      </div>
    )
  }

  const isFullySetUp = status?.onboarding_complete

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Payout Settings</h1>
              <p className="text-slate-600 text-sm mt-0.5">Set up your account to receive fund contributions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Success banner */}
        {justReturned && isFullySetUp && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800">Payouts are set up!</p>
              <p className="text-sm text-green-700 mt-1">
                Your Stripe account is connected and ready to receive contributions.
                When someone contributes to your funds, the money will be deposited to your bank account.
              </p>
            </div>
          </div>
        )}

        {/* Needs to complete onboarding */}
        {justReturned && !isFullySetUp && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-800">Almost there!</p>
              <p className="text-sm text-amber-700 mt-1">
                Your Stripe account was created but onboarding isn&apos;t complete yet.
                Click the button below to finish setting up.
              </p>
            </div>
          </div>
        )}

        {needsRefresh && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-800">Session expired</p>
              <p className="text-sm text-amber-700 mt-1">
                The onboarding link expired. Click below to get a fresh link and continue setup.
              </p>
            </div>
          </div>
        )}

        {/* Status Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${isFullySetUp ? 'bg-green-100' : 'bg-rose-100'}`}>
                <DollarSign className={`w-8 h-8 ${isFullySetUp ? 'text-green-600' : 'text-rose-600'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-slate-900">Stripe Connect</h2>
                  {isFullySetUp ? (
                    <Badge variant="success">Active</Badge>
                  ) : status?.connected ? (
                    <Badge variant="warning">Incomplete</Badge>
                  ) : (
                    <Badge variant="default">Not connected</Badge>
                  )}
                </div>

                {isFullySetUp ? (
                  <div className="space-y-3">
                    <p className="text-slate-600">
                      Your account is connected and ready to receive contributions.
                      Stripe handles payouts directly to your bank account.
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-slate-700">Charges enabled</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-slate-700">Payouts enabled</span>
                      </div>
                    </div>
                    <a
                      href="https://connect.stripe.com/express_login"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 font-medium mt-2"
                    >
                      Open Stripe Dashboard
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-slate-600">
                      Connect a Stripe account to start receiving contributions to your funds.
                      Stripe handles all the payment processing, identity verification, and payouts.
                    </p>
                    <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                      <h3 className="text-sm font-semibold text-slate-800">How it works:</h3>
                      <ul className="text-sm text-slate-600 space-y-1.5">
                        <li className="flex items-start gap-2">
                          <span className="text-rose-500 font-bold mt-px">1.</span>
                          Click the button below to set up your Stripe Express account
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-rose-500 font-bold mt-px">2.</span>
                          Complete Stripe&apos;s quick identity verification
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-rose-500 font-bold mt-px">3.</span>
                          Add your bank account for deposits
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-rose-500 font-bold mt-px">4.</span>
                          Contributions flow directly to your bank (minus 5% platform fee + Stripe processing)
                        </li>
                      </ul>
                    </div>

                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleSetupPayouts}
                      disabled={onboarding}
                      className="w-full sm:w-auto"
                    >
                      {onboarding ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Redirecting to Stripe...
                        </>
                      ) : status?.connected ? (
                        'Continue Setup'
                      ) : (
                        'Set Up Payouts'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-900 mb-3">About contributions</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <p>
                When someone contributes to one of your funds, the payment is processed by Stripe.
                A 5% platform fee is deducted to support Welp, and Stripe&apos;s standard processing
                fee (2.9% + 30¢) applies.
              </p>
              <p>
                For example, on a $25 contribution: ~$1.25 goes to Welp, ~$1.03 goes to Stripe
                processing, and you receive ~$22.72.
              </p>
              <p>
                Payouts are deposited to your bank account on Stripe&apos;s standard schedule
                (typically 2 business days).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
