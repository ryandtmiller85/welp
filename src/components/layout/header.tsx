'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Menu, X } from 'lucide-react'

interface HeaderProps {
  initialUser?: { id: string; email: string } | null
}

export function Header({ initialUser }: HeaderProps) {
  // Auth state comes purely from the server via initialUser.
  // No client-side Supabase auth listener — it was causing false
  // SIGNED_OUT events that overwrote the correct server state.
  // Login and logout both do full page navigations, so the server
  // always provides fresh auth state on every page load.
  const user = initialUser ?? null
  const [menuOpen, setMenuOpen] = useState(false)

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
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-slate-600 hover:bg-slate-100 focus:ring-slate-400 px-3 py-1.5 text-sm"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm px-3 py-1.5 text-sm"
                >
                  Start Your Registry
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
                <Link
                  href="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-400 px-3 py-1.5 text-sm"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm px-3 py-1.5 text-sm"
                >
                  Start Your Registry
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
