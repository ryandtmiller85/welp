'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const router = useRouter()
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
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

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
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-rose-600" />
                  </div>
                </button>

                {profileMenuOpen && (
                  <>
                    <div className="fixed inset-0" onClick={() => setProfileMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <a href="/auth/logout"
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </a>
                    </div>
                  </>
                )}
              </div>
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
              <>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <a href="/auth/logout"
                  className="block w-full text-left px-3 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50"
                >
                  Sign Out
                </a>
              </>
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
