import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About',
  description: 'The story behind Welp — who built it, why, and how it works.',
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <h1 className="text-4xl sm:text-5xl font-black text-slate-900">
        About Welp
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        A registry for the life events nobody plans for.
      </p>

      <div className="mt-10 space-y-10 text-slate-700 leading-relaxed">
        {/* Who Built This */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Who Built This</h2>
          <p>
            Welp was built by Ryan and his sister after watching someone they care about
            go through the hardest kind of fresh start. They noticed something: when people
            get married or have a baby, there&apos;s an entire industry built around helping
            them. When people go through a breakup, divorce, job loss, or any other kind of
            fresh start? Nothing.
          </p>
          <p className="mt-4">
            Welp exists to change that. It&apos;s the registry for the stuff nobody talks
            about needing &mdash; the towels, the pots, the security deposit, the therapy
            fund. The things that make starting over actually possible.
          </p>
        </section>

        {/* How Welp Works */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">How Welp Works</h2>
          <p>
            You create a registry. Add items you need (from our curated catalog or any
            retailer), set up cash funds for bigger expenses, and share your link with the
            people who want to help. They buy items directly from retailers or contribute
            to your funds. That&apos;s it.
          </p>
          <p className="mt-4">
            Welp is <strong className="text-slate-900">free to use</strong>. We earn a small
            commission when supporters buy items through affiliate links &mdash; at no extra
            cost to anyone. We also sell{' '}
            <Link href="/merch" className="text-rose-600 hover:underline font-medium">
              merch
            </Link>
            . Your data isn&apos;t sold. Your story isn&apos;t monetized. That&apos;s it.
          </p>
        </section>

        {/* Why It Matters */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Why It Matters</h2>
          <p>
            When someone goes through a tough transition, their friends and family usually
            want to help but don&apos;t know how. Welp gives them a way. Instead of awkward
            &ldquo;let me know if you need anything&rdquo; texts, people can actually show
            up &mdash; whether that&apos;s buying a set of towels, chipping in for a
            security deposit, or just leaving a message of support.
          </p>
        </section>

        {/* Get in Touch */}
        <section className="border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Get in Touch</h2>
          <p>
            Questions, feedback, partnership ideas, or just want to say hey? Reach out at{' '}
            <a
              href="mailto:hello@alliswelp.com"
              className="text-rose-600 hover:underline font-medium"
            >
              hello@alliswelp.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
