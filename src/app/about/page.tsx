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
          You&apos;re starting over. We&apos;re not going to ask why.
        </p>

        <p>
          Whatever happened, you&apos;re here now. And &ldquo;here&rdquo; probably means you need a
          few things &mdash; a place to sleep, stuff for the kitchen, maybe a security deposit or
          just something that makes the new place feel like <em>yours</em>.
        </p>

        <p>
          The people who care about you are already asking &ldquo;what can I do?&rdquo;
          Welp gives them an actual answer.
        </p>

        <p>
          <strong className="text-slate-900">Build a registry with the things you need.</strong>{' '}
          Add items from any store, set up cash funds for bigger goals like moving costs or
          therapy, and share one simple link. Your people handle the rest.
        </p>

        <p>
          There are registries for engagements and baby showers. There should be one for
          starting over, too. That&apos;s Welp.
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
