import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Community Guidelines',
  description: 'Community Guidelines for Welp — keeping this a good place for people going through hard things.',
}

export default function GuidelinesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <h1 className="text-4xl sm:text-5xl font-black text-slate-900">
        Community Guidelines
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        Welp is a space for people going through hard things. These guidelines exist to keep it that way.
      </p>

      <div className="mt-10 space-y-8 text-slate-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Be Real, Be Kind</h2>
          <p>
            Breakups are messy. Fresh starts are emotional. People on Welp are often at a vulnerable point in
            their lives. You don&apos;t have to be positive all the time &mdash; honesty is welcome here &mdash;
            but basic kindness isn&apos;t optional. Encourage people. Respect their situations. If you
            wouldn&apos;t say it to someone sitting across from you at a bar, don&apos;t say it here.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Registries Should Be Genuine</h2>
          <p>
            Welp registries are for real people going through real life transitions. Don&apos;t create a
            registry to scam people, collect money under false pretenses, or misrepresent your situation. If
            you&apos;re creating a registry on behalf of someone else (a proxy registry), make sure they know
            about it or would genuinely appreciate it. Creating one as a prank or to embarrass someone isn&apos;t
            okay.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">No Harassment or Hate</h2>
          <p>
            Don&apos;t use Welp to target, harass, stalk, or intimidate anyone &mdash; including an ex. This
            includes using registry stories, encouragement messages, or any other feature to send threats,
            share private information about someone without consent, or engage in hate speech based on race,
            gender, sexual orientation, religion, disability, or any other protected characteristic.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Keep It Legal</h2>
          <p>
            Don&apos;t use Welp for anything illegal. Don&apos;t add items that are illegal to buy or sell.
            Don&apos;t use cash funds to launder money. Don&apos;t impersonate another person. This should
            go without saying, but here we are.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Respect Privacy</h2>
          <p>
            Don&apos;t share someone else&apos;s private information on the platform. This includes addresses,
            phone numbers, photos shared without consent, details about children, or information about the
            other person in a breakup. Your story is yours to tell &mdash; their story is theirs.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Encouragement Messages</h2>
          <p>
            The encouragement wall is for support. Use it to send kind words, funny messages, or genuine
            encouragement. Don&apos;t use it to advertise, send spam, harass the registry owner, or leave
            inappropriate content. Messages that violate these guidelines will be removed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">No Spam or Abuse</h2>
          <p>
            Don&apos;t create fake accounts, send unsolicited messages, manipulate the platform, scrape user
            data, or use bots. Don&apos;t game the browse page or artificially inflate fund contributions.
            One real account per real person.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">What Happens If You Break the Rules</h2>
          <p>
            We review reports and may take action including removing content, temporarily suspending your
            account, or permanently banning you from the platform. For serious violations (fraud, harassment,
            illegal activity), we may report to the appropriate authorities. We try to be fair, but
            we reserve the right to make final calls on enforcement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Report Something</h2>
          <p>
            If you see something that violates these guidelines, let us know at{' '}
            <a href="mailto:hello@alliswelp.com" className="text-rose-600 hover:text-rose-700 underline">
              hello@alliswelp.com
            </a>. We take reports seriously and will investigate promptly.
          </p>
        </section>

        <section className="p-6 bg-slate-100 rounded-xl">
          <p className="text-slate-900 font-medium">
            The bottom line: Welp is for people rebuilding. Be the kind of person who helps with that,
            not the kind who makes it harder. We&apos;re all just trying to get through it.
          </p>
        </section>
      </div>
    </div>
  )
}
