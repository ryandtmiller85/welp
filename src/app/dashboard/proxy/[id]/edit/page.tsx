'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { EVENT_LABELS } from '@/lib/constants'
import { Input, Textarea, Select } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { EventType } from '@/lib/types/database'

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

export default function ProxyEditProfilePage() {
  const router = useRouter()
  const params = useParams()
  const proxyId = params.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [recipientName, setRecipientName] = useState('')

  const [formData, setFormData] = useState({
    recipient_name: '',
    story_text: '',
    event_type: 'other' as EventType,
    city: '',
    state: '',
    slug: '',
  })

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
          .eq('id', proxyId)
          .eq('is_proxy', true)
          .eq('created_by_user_id', user.id)
          .single() as any

        if (error || !profile) {
          setMessage({ type: 'error', text: 'Profile not found or you don\'t have access' })
          setLoading(false)
          return
        }

        if (profile.claimed_by_user_id) {
          setMessage({ type: 'error', text: 'This registry has been claimed. You can no longer edit it.' })
          setLoading(false)
          return
        }

        setRecipientName(profile.recipient_name || 'Someone')
        setFormData({
          recipient_name: profile.recipient_name || '',
          story_text: profile.story_text || '',
          event_type: profile.event_type || 'other',
          city: profile.city || '',
          state: profile.state || '',
          slug: profile.slug || '',
        })
      } catch (error) {
        console.error('Error fetching profile:', error)
        setMessage({ type: 'error', text: 'Failed to load profile' })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [proxyId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session?.user) throw new Error('Not authenticated')

      const user = session.user

      // Update the proxy profile — we need to set display_name from recipient_name
      const { error } = await supabase
        .from('profiles')
        .update({
          recipient_name: formData.recipient_name,
          display_name: formData.recipient_name,
          story_text: formData.story_text || null,
          event_type: formData.event_type,
          city: formData.city || null,
          state: formData.state || null,
          slug: formData.slug || null,
        } as any)
        .eq('id', proxyId)
        .eq('created_by_user_id', user.id)

      if (error) throw error

      setRecipientName(formData.recipient_name)
      setMessage({ type: 'success', text: 'Profile updated!' })
      setTimeout(() => router.push(`/dashboard/proxy/${proxyId}`), 1500)
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
          <p className="mt-4 text-slate-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/dashboard/proxy/${proxyId}`}
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {recipientName}&apos;s Registry
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">
            Edit {recipientName}&apos;s Profile
          </h1>
          <p className="text-slate-600 mt-1">
            Update the registry profile you created for {recipientName}.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <Card className={message.type === 'success' ? 'bg-emerald-50 border-emerald-200 mb-6' : 'bg-red-50 border-red-200 mb-6'}>
            <CardContent className="pt-4">
              <p className={message.type === 'success' ? 'text-emerald-800' : 'text-red-800'}>
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
              <Input
                id="recipient_name"
                name="recipient_name"
                label="Recipient Name"
                placeholder="Sarah"
                value={formData.recipient_name}
                onChange={handleChange}
                hint="The person this registry is for"
              />

              <Input
                id="slug"
                name="slug"
                label="URL Slug"
                placeholder="sarah-330bdb"
                value={formData.slug}
                onChange={handleChange}
                hint={`Registry URL: alliswelp.com/${formData.slug}`}
              />

              <Textarea
                id="story_text"
                name="story_text"
                label="Their Story"
                placeholder="Share what happened and why they need support. Write from your perspective — you know them best."
                value={formData.story_text}
                onChange={handleChange}
                hint="This helps supporters understand the situation"
              />
            </CardContent>

            <CardHeader className="border-t border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Event Details</h2>
            </CardHeader>

            <CardContent className="space-y-6">
              <Select
                id="event_type"
                name="event_type"
                label="What happened?"
                value={formData.event_type}
                onChange={handleChange}
                options={EVENT_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="city"
                  name="city"
                  label="City"
                  placeholder="Denver"
                  value={formData.city}
                  onChange={handleChange}
                />
                <Input
                  id="state"
                  name="state"
                  label="State/Province"
                  placeholder="CO"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>
            </CardContent>

            <CardFooter className="flex gap-3">
              <Link href={`/dashboard/proxy/${proxyId}`} className="flex-1">
                <Button variant="outline" className="w-full" disabled={saving}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" variant="primary" className="flex-1" loading={saving} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
