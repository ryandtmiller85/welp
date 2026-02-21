'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, Check, ArrowRight, Loader2 } from 'lucide-react'

export default function ClaimPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string // token is the proxy profile ID
  const supabase = createClient()

  const [profile, setProfile] = useState<any>(null)
  const [advocate, setAdvocate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const load = async () => {
      // Check auth
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session?.user)

      // Fetch the proxy profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', token)
        .eq('is_proxy', true)
        .single() as any

      if (profileError || !profileData) {
        setError('This registry was not found or is not available for claiming.')
        setLoading(false)
        return
      }

      if (profileData.claimed_by_user_id) {
        setError('This registry has already been claimed.')
        setLoading(false)
        return
      }

      setProfile(profileData)

      // Fetch advocate info
      if (profileData.created_by_user_id) {
        const { data: advocateData } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', profileData.created_by_user_id)
          .single() as any
        setAdvocate(advocateData)
      }

      setLoading(false)
    }
    load()
  }, [token, supabase])

  const handleClaim = async () => {
    setClaiming(true)
    try {
      const res = await fetch(`/api/proxy-registry/${token}/claim`, {
        method: 'POST',
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || 'Failed to claim registry')
        return
      }

      setClaimed(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setClaiming(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-slate-100">
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Hmm...</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <Link href="/">
            <Button variant="primary">Go to Homepage</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (claimed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-slate-100">
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">It&apos;s yours!</h1>
          <p className="text-slate-600 mb-8">
            Your registry is now under your control. You can edit items, add more, and manage everything from your dashboard.
          </p>
          <Link href="/dashboard">
            <Button variant="primary" size="lg">
              Go to My Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-slate-100">
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 mb-4">
            <Heart className="w-8 h-8 text-rose-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Someone loves you
          </h1>
          <p className="mt-2 text-slate-600">
            {advocate?.display_name || 'Someone who cares'} created a registry to help you get back on your feet.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                {(profile.recipient_name || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {profile.recipient_name}&apos;s Fresh Start Registry
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Created by {advocate?.display_name || 'someone who cares'} ({profile.relationship || 'friend'})
                </p>
                {profile.story_text && (
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                    &ldquo;{profile.story_text}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {!isLoggedIn ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 text-center mb-4">
              Sign up or log in to claim this registry and make it yours.
            </p>
            <Link href={`/auth/signup?redirect=/claim/${token}`}>
              <Button variant="primary" className="w-full" size="lg">
                Sign Up to Claim
              </Button>
            </Link>
            <Link href={`/auth/login?redirect=/claim/${token}`}>
              <Button variant="outline" className="w-full" size="lg">
                Log In to Claim
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              variant="primary"
              className="w-full"
              size="lg"
              onClick={handleClaim}
              loading={claiming}
              disabled={claiming}
            >
              <Heart className="w-5 h-5 mr-2" />
              Claim My Registry
            </Button>
            <p className="text-xs text-slate-400 text-center">
              This will transfer full control of the registry to your account.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
