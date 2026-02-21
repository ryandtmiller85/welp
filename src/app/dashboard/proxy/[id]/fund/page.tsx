'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Select } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { FUND_LABELS, FUND_DESCRIPTIONS } from '@/lib/constants'
import type { FundType } from '@/lib/types/database'
import { ArrowLeft } from 'lucide-react'

const FUND_TYPES: { value: FundType; label: string; description: string }[] = [
  { value: 'moving', label: FUND_LABELS.moving, description: FUND_DESCRIPTIONS.moving },
  { value: 'deposit', label: FUND_LABELS.deposit, description: FUND_DESCRIPTIONS.deposit },
  { value: 'legal', label: FUND_LABELS.legal, description: FUND_DESCRIPTIONS.legal },
  { value: 'therapy', label: FUND_LABELS.therapy, description: FUND_DESCRIPTIONS.therapy },
  { value: 'pet', label: FUND_LABELS.pet, description: FUND_DESCRIPTIONS.pet },
  { value: 'travel', label: FUND_LABELS.travel, description: FUND_DESCRIPTIONS.travel },
  { value: 'petty', label: FUND_LABELS.petty, description: FUND_DESCRIPTIONS.petty },
  { value: 'custom', label: FUND_LABELS.custom, description: FUND_DESCRIPTIONS.custom },
]

export default function ProxyNewFundPage() {
  const params = useParams()
  const router = useRouter()
  const proxyId = params.id as string

  const [recipientName, setRecipientName] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goalAmount, setGoalAmount] = useState('')
  const [fundType, setFundType] = useState<FundType>('custom')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const selectedFund = FUND_TYPES.find((f) => f.value === fundType)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/proxy-registry')
        if (res.ok) {
          const registries = await res.json()
          const proxy = registries.find((r: any) => r.id === proxyId)
          if (proxy) setRecipientName(proxy.recipient_name || 'Someone')
        }
      } catch {}
    }
    fetchProfile()
  }, [proxyId])

  const handleFundTypeChange = (type: string) => {
    const ft = type as FundType
    setFundType(ft)
    const fund = FUND_TYPES.find((f) => f.value === ft)
    if (fund && !title) setTitle(fund.label)
    if (fund && !description) setDescription(fund.description)
  }

  const handleSubmit = async () => {
    setSubmitError('')
    if (!title.trim()) {
      setSubmitError('Title is required')
      return
    }

    const goalCents = Math.round(parseFloat(goalAmount) * 100)
    if (!goalAmount || isNaN(goalCents) || goalCents <= 0) {
      setSubmitError('Please enter a valid goal amount')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/funds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proxyProfileId: proxyId,
          title: title.trim(),
          description: description.trim() || null,
          goal_cents: goalCents,
          fund_type: fundType,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create fund')
      }

      setSubmitSuccess(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create fund')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-4">💰</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Fund Created!</h2>
              <p className="text-slate-600 mb-6">
                The fund is now live on {recipientName}&apos;s registry.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="primary"
                  onClick={() => {
                    setSubmitSuccess(false)
                    setTitle('')
                    setDescription('')
                    setGoalAmount('')
                    setFundType('custom')
                  }}
                >
                  Create Another Fund
                </Button>
                <Button variant="secondary" onClick={() => router.push(`/dashboard/proxy/${proxyId}`)}>
                  Back to Management
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/dashboard/proxy/${proxyId}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {recipientName}&apos;s Registry
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Create a Fund for {recipientName}
        </h1>
        <p className="text-slate-600 mb-8">
          Let people contribute cash toward something {recipientName} needs.
        </p>

        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {submitError}
          </div>
        )}

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">Fund Details</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <Select
              label="Fund Type"
              value={fundType}
              onChange={(e) => handleFundTypeChange(e.target.value)}
              options={FUND_TYPES.map((f) => ({ value: f.value, label: f.label }))}
              id="fund-type"
            />

            {selectedFund && (
              <p className="text-sm text-slate-500 -mt-3 italic">{selectedFund.description}</p>
            )}

            <Input
              label="Fund Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              id="fund-title"
              placeholder="e.g., Security Deposit Fund"
              required
            />

            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              id="fund-description"
              placeholder="Tell people what this fund is for..."
            />

            <Input
              label="Goal Amount (USD)"
              type="number"
              step="0.01"
              min="1"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              id="fund-goal"
              placeholder="500.00"
              required
            />

            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
                loading={isSubmitting}
                className="flex-1"
              >
                Create Fund
              </Button>
              <Button variant="outline" onClick={() => router.push(`/dashboard/proxy/${proxyId}`)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
