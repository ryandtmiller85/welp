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
  // Use getSession() instead of getUser() in the layout.
  // The middleware already called getUser() to validate & refresh the token.
  // getSession() just reads from the (now-fresh) cookies — no network call,
  // no risk of triggering token deletion in a server component context.
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

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
