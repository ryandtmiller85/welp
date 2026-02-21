import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'Welp is a registry for fresh starts. Because starting over shouldn\'t mean starting from scratch.',
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <h1 className="text-4xl sm:text-5xl font-black text-slate-900">
        About welp.
      </h1>

      <div className="mt-8 space-y-6 text-lg text-slate-700 leading-relaxed">
        <p>
          When someone gets engaged, there&apos;s a registry. When someone has a baby, there&apos;s a
          registry. But when someone&apos;s life falls apart? When they walk in on their partner
          cheating, or the wedding gets canceled, or they need to start completely over?
        </p>

        <p>
          Nothing. You get nothing. Maybe a GoFundMe if it&apos;s bad enough. Maybe some casseroles
          from your mom.
        </p>

        <p>
          <strong className="text-slate-900">Welp exists because starting over requires stuff.</strong>{' '}
          A new apartment needs dishes. A solo life needs its own Netflix password. Moving out
          costs money. Therapy costs money. And your friends and family are already asking
          &ldquo;what can I do?&rdquo; &mdash; now you can give them an actual answer.
        </p>

        <p>
          We&apos;re not here to be sad about it. We&apos;re here to be{' '}
          <em>real</em> about it. Yeah, this sucks. But you&apos;re going to be fine. And
          the people who love you want to help you get there.
        </p>

        <p>
          That&apos;s Welp. A registry for fresh starts.
        </p>
      </div>

      <div className="mt-12 p-8 bg-rose-50 rounded-2xl border border-rose-100">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          <h2 className="text-xl font-bold text-slate-900">Who it&apos;s for</h2>
        </div>
        <div className="space-y-3 text-slate-700">
          <p>
            <strong>Going through a breakup</strong> and need to furnish a new place from scratch.
          </p>
          <p>
            <strong>Getting divorced</strong> and splitting everything means starting with nothing.
          </p>
          <p>
            <strong>Canceled a wedding</strong> and need help picking up the pieces (and returning the gifts).
          </p>
          <p>
            <strong>Any fresh start, really.</strong> Job loss, medical crisis, house fire,
            or just a chapter that needs closing. If you need things and people want to help,
            Welp is for you.
          </p>
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link href="/auth/signup">
          <Button size="lg" className="text-base">
            Create Your Registry
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
