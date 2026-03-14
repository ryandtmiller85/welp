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
        <p className="text-xl text-slate-900 font-medium">
          It&apos;s time to start over.
        </p>

        <p>
          Maybe you saw it coming. Maybe you didn&apos;t. Either way, you&apos;re here now &mdash;
          and &ldquo;here&rdquo; means you could use some help, love, and probably some stuff, too. A new apartment needs dishes. A solo life
          needs its own Netflix password. Moving out costs money. Therapy costs money.
        </p>

        <p>
          Your friends and family are already asking &ldquo;what can I do?&rdquo; &mdash;
          now you can give them an actual answer.
        </p>

        <p>
          We&apos;re not here to be sad about it. We&apos;re here to be{' '}
          <em>real</em> about it. Yeah, this sucks. But you&apos;re going to be fine.
          And the people who love you want to help you get there.
        </p>

        <p>
          <strong className="text-slate-900">That&apos;s Welp. A registry for fresh starts.</strong>
        </p>
      </div>

      <div className="mt-12 p-8 bg-rose-50 rounded-2xl border border-rose-100">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          <h2 className="text-xl font-bold text-slate-900">Welp is for</h2>
        </div>
        <div className="space-y-3 text-slate-700">
          <p>
            <strong>Fresh starts.</strong> Breakups, divorce, canceled weddings &mdash;
            whatever the reason, you deserve support while you rebuild.
          </p>
          <p>
            <strong>Big transitions.</strong> Job loss, medical setbacks, housing changes.
            Life doesn&apos;t come with a safety net, but your community can be one.
          </p>
          <p>
            <strong>Anyone starting from scratch.</strong> If you need things and the people
            around you want to help, this is for you.
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
