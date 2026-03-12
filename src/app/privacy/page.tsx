import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Welp — how we handle your data.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <h1 className="text-4xl sm:text-5xl font-black text-slate-900">
        Privacy Policy
      </h1>
      <p className="mt-4 text-sm text-slate-500">Last updated: March 11, 2026</p>

      <div className="mt-10 space-y-8 text-slate-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">The Short Version</h2>
          <p>
            We collect what we need to run Welp. We don&apos;t sell your data. We don&apos;t share it with
            advertisers. Your breakup is your business &mdash; we just help you get through it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">What We Collect</h2>
          <p className="mb-3">
            <strong className="text-slate-900">Account information:</strong> When you sign up, we collect your
            email address and any profile info you add (display name, story, photos, location). If you sign in
            with Google, we receive your name and email from Google.
          </p>
          <p className="mb-3">
            <strong className="text-slate-900">Registry content:</strong> Items you add, cash funds you create,
            and any story or messages you write. This is the stuff you explicitly put on the platform.
          </p>
          <p className="mb-3">
            <strong className="text-slate-900">Payment information:</strong> When you set up payouts or make a
            contribution, payment processing is handled entirely by Stripe. We don&apos;t store credit card
            numbers or bank account details on our servers.
          </p>
          <p className="mb-3">
            <strong className="text-slate-900">Usage data:</strong> We use Vercel Analytics to understand how
            people use Welp (page views, general traffic patterns). This data is aggregated and
            privacy-friendly &mdash; no individual tracking across sites.
          </p>
          <p>
            <strong className="text-slate-900">Contributor information:</strong> When someone contributes to a
            fund, we collect their name, optional email, and optional message. Anonymous contributions store
            the display name as &ldquo;Anonymous.&rdquo;
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">How We Use It</h2>
          <p>
            We use your information to operate and improve Welp: displaying your registry, processing
            contributions, sending email notifications (contribution alerts, encouragement messages, proxy
            registry invites), and maintaining the platform. That&apos;s it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Who We Share It With</h2>
          <p className="mb-3">
            <strong className="text-slate-900">Your registry visitors:</strong> If your registry is public or
            shared via link, visitors can see your display name, story, items, and fund progress. They cannot
            see your email address or private account details.
          </p>
          <p className="mb-3">
            <strong className="text-slate-900">Service providers:</strong> We use Supabase (database and auth),
            Stripe (payments), Resend (transactional emails), Vercel (hosting and analytics), and Printify
            (merch fulfillment). These providers only access what they need to provide their services.
          </p>
          <p>
            <strong className="text-slate-900">Nobody else.</strong> We don&apos;t sell or rent your personal
            information. Period.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Data Retention</h2>
          <p>
            We keep your data as long as your account is active. If you delete your account, we&apos;ll
            remove your personal data within 30 days, except where we need to retain it for legal or
            financial record-keeping (e.g., transaction records required by payment regulations).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Your Rights</h2>
          <p>
            You can update or delete your profile information from your dashboard at any time. If you want to
            export your data or fully delete your account, email us at{' '}
            <a href="mailto:hello@alliswelp.com" className="text-rose-600 hover:text-rose-700 underline">
              hello@alliswelp.com
            </a>{' '}
            and we&apos;ll take care of it. If you&apos;re in California (CCPA) or the EU (GDPR), you have
            additional rights regarding access, correction, deletion, and portability of your data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Cookies</h2>
          <p>
            We use essential cookies to keep you logged in and maintain your session. We don&apos;t use
            third-party advertising or tracking cookies. Vercel Analytics uses privacy-friendly,
            cookie-free analytics.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Children</h2>
          <p>
            Welp is not intended for anyone under 18. We don&apos;t knowingly collect personal information
            from minors. If you believe a minor has created an account, please contact us and we&apos;ll
            remove it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Changes</h2>
          <p>
            We may update this policy as Welp grows. We&apos;ll post the updated version here with a new
            &ldquo;last updated&rdquo; date. For significant changes, we&apos;ll notify you through the
            platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Contact</h2>
          <p>
            Privacy questions? Email{' '}
            <a href="mailto:hello@alliswelp.com" className="text-rose-600 hover:text-rose-700 underline">
              hello@alliswelp.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  )
}
