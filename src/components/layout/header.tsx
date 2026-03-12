'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Menu, X } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

type HeaderUser = SupabaseUser | { id: string; email: string }

interface HeaderProps {
  initialUser?: { id: string; email: string } | null
}

export function Header({ initialUser }: HeaderProps) {
  // Use initialUser from server as the starting state so the header
  // renders correctly on first paint without waiting for client-side auth
  const [user, setUser] = useState<HeaderUser | null>(initialUser ?? null)
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Use getSession() instead of getUser() to avoid network calls.
    // getUser() contacts the Supabase API server, and if the call fails
    // (network error, token issue), the SDK fires SIGNED_OUT which
    // deletes all auth cookies from the browser via document.cookie.
    // getSession() only reads from local cookie state — safe and fast.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }
    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-rose-600 transition-colors">
              welp.
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/browse"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Browse
            </Link>
            <Link
              href="/shop"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Shop
            </Link>
            <Link
              href="/merch"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Merch
            </Link>
            <Link
              href="/about"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              About
            </Link>

            {user ? (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-slate-700 hover:text-rose-600 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">Start Your Registry</Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 py-4 space-y-3">
            <Link
              href="/browse"
              className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50"
              onClick={() => setMenuOpen(false)}
            >
              Browse Registries
            </Link>
            <Link
              href="/shop"
              className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50"
              onClick={() => setMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              href="/merch"
              className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50"
              onClick={() => setMenuOpen(false)}
            >
              Merch
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50"
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>
            {user ? (
              <Link
                href="/dashboard"
                className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-rose-600 rounded-lg hover:bg-slate-50"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
            ) : (
              <div className="flex gap-3 px-3 pt-2">
                <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                  <Button variant="outline" size="sm">Log In</Button>
                </Link>
                <Link href="/auth/signup" onClick={() => setMenuOpen(false)}>
                  <Button size="sm">Start Your Registry</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
