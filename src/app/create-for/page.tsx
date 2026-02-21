'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Users,
  ShoppingBag,
  Check,
  Sparkles,
  Copy,
} from 'lucide-react'
import type { EventType } from '@/lib/types/database'

const STEPS = ['Who', 'Situation', 'Review'] as const

const RELATIONSHIPS = [
  'Mom', 'Dad', 'Sister', 'Brother', 'Best Friend',
  'Coworker', 'Cousin', 'Aunt', 'Uncle', 'Partner', 'Other',
] as const

const EVENT_OPTIONS: { value: EventType; label: string; emoji: string }[] = [
  { value: 'breakup', label: 'Breakup', emoji: '💔' },
  { value: 'divorce', label: 'Divorce', emoji: '📋' },
  { value: 'canceled_wedding', label: 'Canceled Wedding', emoji: '💍' },
  { value: 'fresh_start', label: 'Fresh Start', emoji: '🌱' },
  { value: 'job_loss', label: 'Job Loss', emoji: '💼' },
  { value: 'medical', label: 'Medical', emoji: '🏥' },
  { value: 'housing', label: 'Housing Change', emoji: '🏠' },
  { value: 'other', label: 'Other', emoji: '✨' },
]

export default function CreateForPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ slug: string } | null>(null)
  const [copied, setCopied] = useState(false)

  // Form state
  const [recipientName, setRecipientName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [eventType, setEventType] = useState<EventType>('breakup')
  const [storyText, setStoryText] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')

  const canProceed = () => {
    if (step === 0) return recipientName.trim().length > 0 && relationship.length > 0
    if (step === 1) return true // situation step is optional
    return true
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/proxy-registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: recipientName.trim(),
          relationship,
          recipientEmail: recipientEmail.trim() || null,
          eventType,
          storyText: storyText.trim() || null,
          city: city.trim() || null,
          state: state.trim() || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to create registry')
        return
      }

      const data = await res.json()
      setResult(data)
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const registryUrl = result ? `${window.location.origin}/${result.slug}` : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(registryUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Success screen
  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-slate-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6">
              <Check className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Registry created!
            </h1>
            <p className="mt-3 text-lg text-slate-600">
              You just did something amazing for {recipientName}.
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="py-8">
              <h3 className="font-semibold text-slate-900 mb-2">Share this link</h3>
              <p className="text-sm text-slate-500 mb-4">
                Send this to friends and family so they can help support {recipientName}.
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 font-mono truncate">
                  {registryUrl}
                </div>
                <Button
                  variant={copied ? 'secondary' : 'primary'}
                  onClick={handleCopy}
                  className="flex-shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={`/${result.slug}`} className="flex-1">
              <Button variant="outline" className="w-full" size="lg">
                View Registry
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button variant="primary" className="w-full" size="lg">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-slate-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Create for Someone Else
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Help someone you love get back on their feet
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  i < step
                    ? 'bg-rose-500 text-white'
                    : i === step
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`ml-2 text-sm hidden sm:inline ${i === step ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-3 ${i < step ? 'bg-rose-300' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Who */}
        {step === 0 && (
          <Card>
            <CardContent className="py-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-1">
                Who is this for?
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Tell us about the person you&apos;re helping.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Their first name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Sarah"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    I&apos;m their... <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {RELATIONSHIPS.map((rel) => (
                      <button
                        key={rel}
                        onClick={() => setRelationship(rel)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                          relationship === rel
                            ? 'bg-rose-500 text-white border-rose-500'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-rose-200'
                        }`}
                      >
                        {rel}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Their email <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="so they can take over later"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-400 mt-1.5">
                    We&apos;ll let them know and give them a way to claim the registry when they&apos;re ready.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Situation */}
        {step === 1 && (
          <Card>
            <CardContent className="py-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-1">
                What&apos;s {recipientName} going through?
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                This helps people understand how to support them. Everything here is optional.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    What happened?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {EVENT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setEventType(opt.value)}
                        className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all border text-center ${
                          eventType === opt.value
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="block text-base mb-0.5">{opt.emoji}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Their story <span className="text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                    placeholder={`"My ${relationship.toLowerCase() || 'friend'} ${recipientName} just went through a rough breakup and is starting over in a new apartment. They need basically everything..."`}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-slate-400 mt-1.5">
                    Write from your perspective — you know them best.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Denver"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="CO"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review */}
        {step === 2 && (
          <div className="space-y-4">
            <Card>
              <CardContent className="py-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-1">
                  Review & Launch
                </h2>
                <p className="text-slate-500 text-sm mb-6">
                  Here&apos;s what {recipientName}&apos;s registry will look like. You can always edit it later.
                </p>

                <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                      {recipientName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{recipientName}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {EVENT_OPTIONS.find((e) => e.value === eventType)?.emoji}{' '}
                        {EVENT_OPTIONS.find((e) => e.value === eventType)?.label}
                        {city && state && ` • ${city}, ${state}`}
                      </p>
                    </div>
                  </div>

                  {storyText && (
                    <p className="text-slate-600 text-sm leading-relaxed border-t border-slate-200 pt-4">
                      {storyText}
                    </p>
                  )}

                  <div className="border-t border-slate-200 pt-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-full text-xs font-medium">
                      <Heart className="w-3 h-3" />
                      Created with love by you ({relationship})
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-50/50 border-amber-200">
              <CardContent className="py-4">
                <p className="text-sm text-amber-800">
                  <strong>Privacy:</strong> This registry will be link-only — only people with the link can see it.
                  {recipientEmail && ` We'll notify ${recipientName} at ${recipientEmail} so they can claim it later.`}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="ghost"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              variant="primary"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Launch Registry
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
