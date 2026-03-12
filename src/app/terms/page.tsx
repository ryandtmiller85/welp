import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Welp — a registry for fresh starts.',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <h1 className="text-4xl sm:text-5xl font-black text-slate-900">
        Terms of Service
      </h1>
      <p className="mt-4 text-sm text-slate-500">Last updated: March 11, 2026</p>

      <div className="mt-10 space-y-8 text-slate-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">1. What Welp Is</h2>
          <p>
            Welp (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;) operates alliswelp.com, a platform
            that lets people create registries for fresh starts &mdash; breakups, divorces, life changes, and
            everything in between. By using Welp, you agree to these terms. If you don&apos;t agree, that&apos;s
            okay &mdash; but you can&apos;t use the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">2. Accounts</h2>
          <p>
            You need an account to create a registry. You&apos;re responsible for keeping your login
            credentials secure. If someone else uses your account, that&apos;s on you. You must be at least
            18 years old to use Welp. One account per person, please.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">3. Registry Content</h2>
          <p>
            You own the content you post on your registry (items, story, photos). By posting it, you give us
            permission to display it on the platform and in connection with promoting Welp. Don&apos;t post
            anything you don&apos;t have the right to share. Don&apos;t use your registry for anything illegal,
            fraudulent, or harmful. We can remove content or suspend accounts that violate these terms or our{' '}
            <Link href="/guidelines" className="text-rose-600 hover:text-rose-700 underline">
              Community Guidelines
            </Link>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">4. Cash Funds &amp; Payments</h2>
          <p>
            Welp uses Stripe to process contributions to cash funds. When someone contributes to your fund,
            Welp takes a 5% platform fee. The rest goes to your connected Stripe account. There is a $5.00
            minimum contribution. We are not responsible for disputes between contributors and registry owners.
            Stripe&apos;s terms of service also apply to payment processing.
          </p>
          <p className="mt-3">
            Contributions are voluntary gifts. They are not tax-deductible charitable donations. Registry owners
            are responsible for any applicable tax obligations on funds received.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">5. Merch &amp; Shop</h2>
          <p>
            Merch items sold through Welp are fulfilled by third-party print-on-demand partners. Shop items
            link to external retailers. We do our best to ensure product quality and accurate listings, but
            we&apos;re not the manufacturer or seller for these items. Returns, exchanges, and product issues
            should be directed to the respective fulfillment partner or retailer.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">6. Proxy Registries</h2>
          <p>
            Welp allows you to create a registry on behalf of someone else (a &ldquo;proxy registry&rdquo;).
            You must have that person&apos;s knowledge or reasonable belief they would want one. Creating
            a registry for someone as harassment, a joke at their expense, or without good intent violates
            these terms and our Community Guidelines.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">7. What You Can&apos;t Do</h2>
          <p>
            Don&apos;t use Welp to scam people, harass anyone, post hateful content, impersonate others,
            scrape the site, attempt to access other users&apos; accounts, or interfere with the platform.
            Basically: don&apos;t be terrible. We reserve the right to suspend or terminate accounts that
            violate these terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">8. Disclaimer &amp; Limitation of Liability</h2>
          <p>
            Welp is provided &ldquo;as is.&rdquo; We do our best, but we can&apos;t guarantee the platform
            will be available 100% of the time, that every feature will work perfectly, or that contributions
            will always process without issue. To the maximum extent permitted by law, Welp is not liable for
            indirect, incidental, or consequential damages arising from your use of the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">9. Changes to These Terms</h2>
          <p>
            We may update these terms from time to time. If we make significant changes, we&apos;ll let you
            know through the platform. Continuing to use Welp after changes means you accept the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">10. Contact</h2>
          <p>
            Questions about these terms? Reach out at{' '}
            <a href="mailto:hello@alliswelp.com" className="text-rose-600 hover:text-rose-700 underline">
              hello@alliswelp.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  )
}
