import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { ConditionalLayout } from '@/components/layout/conditional-layout'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: {
    default: 'Welp — Registry for Fresh Starts',
    template: '%s | Welp',
  },
  description:
    "Because starting over shouldn't mean starting from scratch. A registry for breakups, fresh starts, and everything in between.",
  openGraph: {
    title: 'Welp — Registry for Fresh Starts',
    description:
      "Because starting over shouldn't mean starting from scratch.",
    type: 'website',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="en">
      <body className="font-sans antialiased min-h-screen">
        <ConditionalLayout initialUser={user ? { id: user.id, email: user.email ?? '' } : null}>
          {children}
        </ConditionalLayout>
        <Analytics />
      </body>
    </html>
  )
}
