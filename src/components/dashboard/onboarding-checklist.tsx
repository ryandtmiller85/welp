'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { Check, Link as LinkIcon, X } from 'lucide-react'

interface OnboardingChecklistProps {
  slug: string
  hasDisplayName: boolean
  hasStory: boolean
  hasItems: boolean
  userId: string
}

export function OnboardingChecklist({
  slug,
  hasDisplayName,
  hasStory,
  hasItems,
  userId,
}: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(false)
  const [editingSlug, setEditingSlug] = useState(false)
  const [newSlug, setNewSlug] = useState(slug)
  const [slugSaving, setSlugSaving] = useState(false)
  const [slugError, setSlugError] = useState<string | null>(null)
  const [slugSaved, setSlugSaved] = useState(false)
  const [currentSlug, setCurrentSlug] = useState(slug)

  useEffect(() => {
    const key = `welp-onboarding-dismissed-${userId}`
    if (typeof window !== 'undefined' && localStorage.getItem(key) === 'true') {
      setDismissed(true)
    }
  }, [userId])

  const allComplete = hasDisplayName && hasStory && hasItems
  if (dismissed || allComplete) return null

  const handleDismiss = () => {
    setDismissed(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`welp-onboarding-dismissed-${userId}`, 'true')
    }
  }

  const handleSlugSave = async () => {
    const cleaned = newSlug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    if (!cleaned || cleaned.length < 3) {
      setSlugError('Must be at least 3 characters')
      return
    }
    if (cleaned.length > 40) {
      setSlugError('Must be 40 characters or fewer')
      return
    }

    setSlugSaving(true)
    setSlugError(null)

    const supabase = createClient()

    // Check if slug is already taken
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('slug', cleaned)
      .neq('id', userId)
      .single()

    if (existing) {
      setSlugError('That link is already taken')
      setSlugSaving(false)
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({ slug: cleaned })
      .eq('id', userId)

    if (error) {
      setSlugError('Something went wrong. Try again.')
      setSlugSaving(false)
      return
    }

    setCurrentSlug(cleaned)
    setSlugSaved(true)
    setEditingSlug(false)
    setSlugSaving(false)
  }

  const steps = [
    {
      done: true,
      label: 'Set your registry link',
      detail: (
        <div className="mt-2">
          <p className="text-sm text-slate-500 mb-2">
            Your link: <strong className="text-slate-700">alliswelp.com/{currentSlug}</strong>
            {slugSaved && <span className="text-emerald-600 ml-2">Updated!</span>}
          </p>
          {!editingSlug ? (
            <Button variant="ghost" size="sm" onClick={() => setEditingSlug(true)}>
              <LinkIcon className="w-3 h-3 mr-1" />
              Customize
            </Button>
          ) : (
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-slate-400 whitespace-nowrap">alliswelp.com/</span>
                  <Input
                    id="slug-input"
                    value={newSlug}
                    onChange={(e) => { setNewSlug(e.target.value); setSlugError(null) }}
                    placeholder="your-name"
                    error={slugError || undefined}
                  />
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSlugSave}
                disabled={slugSaving}
                loading={slugSaving}
              >
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setEditingSlug(false); setSlugError(null) }}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      ),
    },
    {
      done: hasDisplayName,
      label: 'Add your display name',
      detail: !hasDisplayName && (
        <Link href="/dashboard/edit" className="mt-1 inline-block text-sm text-rose-600 hover:underline">
          Edit Profile &rarr;
        </Link>
      ),
    },
    {
      done: hasStory,
      label: 'Write your story',
      detail: !hasStory && (
        <Link href="/dashboard/edit" className="mt-1 inline-block text-sm text-rose-600 hover:underline">
          Add your story &rarr;
        </Link>
      ),
    },
    {
      done: hasItems,
      label: 'Add your first item',
      detail: !hasItems && (
        <Link href="/dashboard/add" className="mt-1 inline-block text-sm text-rose-600 hover:underline">
          Browse catalog &rarr;
        </Link>
      ),
    },
  ]

  const completedCount = steps.filter((s) => s.done).length

  return (
    <Card className="border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50">
      <CardContent className="py-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Get Started</h2>
            <p className="text-sm text-slate-600 mt-1">
              {completedCount} of {steps.length} steps complete &mdash; you&apos;re almost there!
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-600 p-1"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="w-full bg-slate-200 rounded-full h-2 mb-6">
          <div
            className="bg-rose-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>

        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                  step.done
                    ? 'bg-emerald-500 text-white'
                    : 'border-2 border-slate-300 text-slate-300'
                }`}
              >
                {step.done && <Check className="w-3.5 h-3.5" />}
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    step.done ? 'text-slate-400 line-through' : 'text-slate-900'
                  }`}
                >
                  {step.label}
                </p>
                {step.detail}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
