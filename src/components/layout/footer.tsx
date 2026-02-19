import Link from 'next/link'
import { Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <span className="text-2xl font-black text-white">welp.</span>
            <p className="mt-3 text-sm leading-relaxed max-w-md">
              Because starting over shouldn&apos;t mean starting from scratch.
              A registry for breakups, fresh starts, and everything in between.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Platform
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/browse" className="text-sm hover:text-white transition-colors">
                  Browse Registries
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="text-sm hover:text-white transition-colors">
                  Create a Registry
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm hover:text-white transition-colors">
                  About Welp
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-sm hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="text-sm hover:text-white transition-colors">
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} Welp. All rights reserved.
          </p>
          <p className="text-xs flex items-center gap-1">
            Built with spite and <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  )
}
