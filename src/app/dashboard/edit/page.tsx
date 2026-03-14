'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile, EventType } from '@/lib/types/database'
import { EVENT_LABELS, PRIVACY_LABELS } from '@/lib/constants'
import { Input, Textarea, Select } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import Link from 'next/link'

const EVENT_OPTIONS: { value: EventType; label: string }[] = [
  { value: 'breakup', label: 'Breakup' },
  { value: 'divorce', label: 'Divorce' },
  { value: 'canceled_wedding', label: 'Canceled Wedding' },
  { value: 'fresh_start', label: 'Fresh Start' },
  { value: 'job_loss', label: 'Job Loss' },
  { value: 'medical', label: 'Medical Crisis' },
  { value: 'housing', label: 'Housing Change' },
  { value: 'other', label: 'Other' },
]

const PRIVACY_OPTIONS = [
  { value: 'public', label: PRIVACY_LABELS.public },
  { value: 'link_only', label: PRIVACY_LABELS.link_only },
  { value: 'private', label: PRIVACY_LABELS.private },
]

export default function EditProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<Partial<Profile>>({
    display_name: '',
    alias: '',
    story_text: '',
    event_type: 'other',
    event_date: '',
    city: '',
    state: '',
    privacy_level: 'link_only',
    slug: '',
    show_days_counter: false,
  })

  // Fetch current profile on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError || !session?.user) {
          router.push('/auth/login')
          return
        }

        const user = session.user

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!error && profile) {
          setFormData(profile)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        setMessage({ type: 'error', text: 'Failed to load profile' })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, type, value } = e.target
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }))
    // Clear field error when user starts typing
    setFieldErrors((prev) => { const { [name]: _, ...rest } = prev; return rest })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    setFieldErrors({})

    // Client-side field validation
    const errors: Record<string, string> = {}
    if (formData.display_name && formData.display_name.length > 80) {
      errors.display_name = 'Display name must be 80 characters or fewer'
    }
    if (formData.alias && formData.alias.length > 80) {
      errors.alias = 'Alias must be 80 characters or fewer'
    }
    if (formData.story_text && formData.story_text.length > 5000) {
      errors.story_text = 'Story must be 5,000 characters or fewer'
    }
    if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = 'URL slug can only contain lowercase letters, numbers, and hyphens'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setSaving(false)
      return
    }

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session?.user) {
        throw new Error('Not authenticated')
      }

      const user = session.user

      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id)

      if (error) {
        throw error
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save profile'
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600" />
          <p className="mt-4 text-slate-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/dashboard" className="text-rose-600 hover:text-rose-700 text-sm font-medium mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Edit Your Profile</h1>
          <p className="text-slate-600 mt-1">
            Make your registry personal. The more you share, the better supporters can help.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {message && (
          <Card className={message.type === 'success' ? 'bg-emerald-50 border-emerald-200 mb-6' : 'bg-red-50 border-red-200 mb-6'}>
            <CardContent className="pt-4">
              <p
                className={
                  message.type === 'success' ? 'text-emerald-800' : 'text-red-800'
                }
              >
                {message.text}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Display Name */}
              <Input
                id="display_name"
                name="display_name"
                label="Display Name"
                placeholder="Jane Doe"
                value={formData.display_name || ''}
                onChange={handleChange}
                maxLength={80}
                error={fieldErrors.display_name}
                hint={`How you'd like to be known (${(formData.display_name || '').length}/80)`}
              />

              {/* Alias */}
              <Input
                id="alias"
                name="alias"
                label="Alias (Optional)"
                placeholder="Just Jane"
                value={formData.alias || ''}
                onChange={handleChange}
                error={fieldErrors.alias}
                hint="A nickname or alternative name"
              />

              {/* Profile Slug */}
              <Input
                id="slug"
                name="slug"
                label="URL Slug"
                placeholder="jane-doe"
                value={formData.slug || ''}
                onChange={handleChange}
                error={fieldErrors.slug}
                hint="Your unique URL: yoursite.com/jane-doe"
              />

              {/* Your Story */}
              <Textarea
                id="story_text"
                name="story_text"
                label="Your Story"
                placeholder="Share what happened and what you need help with. Be honest - people want to help when they understand your situation."
                value={formData.story_text || ''}
                error={fieldErrors.story_text}
                onChange={handleChange}
                hint="This helps supporters understand your situation (required for public profile)"
              />
            </CardContent>

            <CardHeader className="border-t border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Event Details</h2>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Event Type */}
              <Select
                id="event_type"
                name="event_type"
                label="What happened?"
                value={formData.event_type || 'other'}
                onChange={handleChange}
                options={EVENT_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                }))}
              />

              {/* Event Date */}
              <Input
                id="event_date"
                name="event_date"
                label="Event Date"
                type="date"
                value={formData.event_date || ''}
                onChange={handleChange}
                hint="When did this happen?"
              />

              {/* Location */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="city"
                  name="city"
                  label="City"
                  placeholder="New York"
                  value={formData.city || ''}
                  onChange={handleChange}
                />
                <Input
                  id="state"
                  name="state"
                  label="State/Province"
                  placeholder="NY"
                  value={formData.state || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Show Days Counter */}
              <div className="flex items-start gap-3">
                <input
                  id="show_days_counter"
                  name="show_days_counter"
                  type="checkbox"
                  checked={formData.show_days_counter || false}
                  onChange={handleChange}
                  className="mt-1 rounded border-slate-300"
                />
                <div>
                  <label
                    htmlFor="show_days_counter"
                    className="block text-sm font-medium text-slate-700 cursor-pointer"
                  >
                    Show days since event
                  </label>
                  <p className="text-sm text-slate-500 mt-1">
                    Display how long it's been since the event on your public profile
                  </p>
                </div>
              </div>
            </CardContent>

            <CardHeader className="border-t border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Privacy & Photos</h2>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Privacy Level */}
              <Select
                id="privacy_level"
                name="privacy_level"
                label="Who can see your registry?"
                value={formData.privacy_level || 'link_only'}
                onChange={handleChange}
                options={PRIVACY_OPTIONS}
              />

              {/* Photo Upload Placeholder */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">
                  Profile Photo
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50">
                  <div className="text-2xl mb-2">📸</div>
                  <p className="text-sm text-slate-600 font-medium mb-1">Photo upload coming soon</p>
                  <p className="text-xs text-slate-500">
                    We're working on photo uploads. For now, you can use an avatar.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">
                  Cover Photo
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50">
                  <div className="text-2xl mb-2">🖼️</div>
                  <p className="text-sm text-slate-600 font-medium mb-1">Cover photo upload coming soon</p>
                  <p className="text-xs text-slate-500">
                    Help personalize your registry page with a cover image.
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex gap-3">
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full" disabled={saving}>
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                loading={saving}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
