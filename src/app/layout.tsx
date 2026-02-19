import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
