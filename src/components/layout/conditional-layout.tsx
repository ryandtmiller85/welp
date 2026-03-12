'use client'

import { usePathname } from 'next/navigation'
import { Header } from './header'
import { Footer } from './footer'
import { TestingBanner } from '../feedback/testing-banner'

const IS_TESTING = process.env.NEXT_PUBLIC_TESTING_MODE === 'true'

interface ConditionalLayoutProps {
  children: React.ReactNode
  initialUser?: { id: string; email: string } | null
}

export function ConditionalLayout({ children, initialUser }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) {
    // Admin pages handle their own layout (dark theme, sidebar, etc.)
    return <>{children}</>
  }

  return (
    <div className="bg-slate-50 text-slate-900 flex flex-col min-h-screen">
      {IS_TESTING && <TestingBanner />}
      <Header initialUser={initialUser} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
