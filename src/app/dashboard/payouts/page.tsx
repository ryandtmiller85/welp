'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, ExternalLink, Loader2, AlertCircle, DollarSign, ArrowLeft, Shield, Clock, CreditCard, HelpCircle } from 'lucide-react'
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
                  <div className="space-y-5">
                    <p className="text-slate-600">
                      To receive contributions to your funds, you&apos;ll need to set up a free Stripe
                      account. This is a one-time process that takes about 5 minutes.
                    </p>

                    {/* What to expect */}
                    <div className="bg-slate-50 rounded-xl p-5 space-y-4">
                      <h3 className="text-sm font-semibold text-slate-900">What to expect when you click the button below:</h3>
                      <p className="text-sm text-slate-600">
                        You&apos;ll be redirected to Stripe (our secure payment partner) to create a free
                        account. Stripe is used by millions of businesses worldwide including Shopify,
                        Lyft, and DoorDash. They&apos;ll ask you for:
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-rose-600">1</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">Email &amp; business type</p>
                            <p className="text-xs text-slate-500">Just your email and that you&apos;re an individual (not a company)</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-rose-600">2</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">Industry &amp; description</p>
                            <p className="text-xs text-slate-500">Select &quot;Personal services&quot; and describe it as receiving contributions through a Welp registry</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-rose-600">3</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">Personal details</p>
                            <p className="text-xs text-slate-500">Your name, address, date of birth, and last 4 of your SSN for identity verification</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-rose-600">4</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">Bank account</p>
                            <p className="text-xs text-slate-500">Link your bank account where you&apos;d like contributions deposited</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Trust signals */}
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                        <span>256-bit encryption</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>~5 minutes to complete</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        <span>No cost to you</span>
                      </div>
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

        {/* FAQ Card */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-slate-400" />
              Common Questions
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-800">How much do I actually receive?</p>
                <p className="text-sm text-slate-600 mt-1">
                  A 5% platform fee supports Welp, and Stripe charges 2.9% + 30¢ for payment
                  processing. On a $25 contribution, you&apos;d receive about $22.72.
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">When do I get paid?</p>
                <p className="text-sm text-slate-600 mt-1">
                  Contributions are deposited to your bank account automatically on a rolling
                  basis, typically within 2 business days of each contribution.
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Why does Stripe need my personal info?</p>
                <p className="text-sm text-slate-600 mt-1">
                  US financial regulations require identity verification for anyone receiving
                  payments. Stripe handles this securely — Welp never sees your SSN, bank
                  details, or identity documents.
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Is there a minimum contribution?</p>
                <p className="text-sm text-slate-600 mt-1">
                  Yes, the minimum contribution is $5.00 to ensure processing fees don&apos;t
                  eat into small amounts.
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Can I change my bank account later?</p>
                <p className="text-sm text-slate-600 mt-1">
                  Yes, you can update your bank account anytime through the Stripe Express
                  dashboard (link available after setup is complete).
                </p>
              </div>
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
