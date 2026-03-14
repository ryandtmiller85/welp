import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { ConditionalLayout } from '@/components/layout/conditional-layout'
import { FeedbackWidget } from '@/components/feedback/feedback-widget'
import { createClient } from '@/lib/supabase/server'

const IS_TESTING = process.env.NEXT_PUBLIC_TESTING_MODE === 'true'

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
    siteName: 'Welp',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Welp — Registry for Fresh Starts',
    description: "Because starting over shouldn't mean starting from scratch.",
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
        {IS_TESTING && <FeedbackWidget />}
        <Analytics />
      </body>
    </html>
  )
}
