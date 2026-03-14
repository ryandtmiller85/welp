'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [secret, setSecret] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [tapCount, setTapCount] = useState(0)
  const router = useRouter()

  function handleTap() {
    const next = tapCount + 1
    setTapCount(next)
    if (next >= 3) {
      setShowLogin(true)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
      })

      if (res.status === 429) {
        setError('Too many attempts. Please try again later.')
      } else if (res.ok) {
        router.push('/admin')
      } else {
        setError('Invalid credentials')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Default view: looks exactly like the standard 404 page
  if (!showLogin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div
            className="text-6xl font-black text-slate-200 mb-2 select-none cursor-default"
            onClick={handleTap}
          >
            404
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Page not found</h1>
          <p className="text-slate-500 mb-6">
            Looks like this page moved on too. Can&apos;t blame it.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/"
              className="px-5 py-2.5 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-colors"
            >
              Go Home
            </Link>
            <Link
              href="/browse"
              className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
            >
              Browse Registries
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Secret login form — only visible after triple-tap on "404"
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 rounded-xl p-8 w-96 shadow-2xl">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-2.5 mb-4">
            {error}
          </div>
        )}

        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Access key"
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 mb-4"
          autoFocus
        />

        <button
          type="submit"
          disabled={loading || !secret}
          className="w-full bg-rose-600 hover:bg-rose-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          {loading ? '...' : 'Go'}
        </button>
      </form>
    </div>
  )
}
