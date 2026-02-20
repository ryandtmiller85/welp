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
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

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
            <span className="text-2xl font-black tracking-tight text-slate-900group-hover:text-rose-600 transition-colors">
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
              href="/about"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              About
            </Link>

            {user ? (
              <div className="relative">
                <a href="/auth/logout" className="block w-full text-left px-3 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50">
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
