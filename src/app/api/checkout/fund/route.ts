import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const PLATFORM_FEE_PERCENT = 5 // 5% platform fee
const MIN_CONTRIBUTION_CENTS = 500 // $5.00 minimum

const contributionSchema = z.object({
  fund_id: z.string().uuid(),
  amount_cents: z.number().int().min(MIN_CONTRIBUTION_CENTS).max(999_999_99),
  contributor_name: z.string().trim().min(1).max(100),
  contributor_email: z.string().email().max(320).optional().nullable(),
  message: z.string().trim().max(500).optional().nullable(),
  is_anonymous: z.boolean().optional().default(false),
})

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * POST /api/checkout/fund
 * Creates a Stripe Checkout session with a destination charge
 * to the fund owner's connected Express account.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = contributionSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]
      return NextResponse.json(
        { error: `${firstError.path.join('.')}: ${firstError.message}` },
        { status: 400 }
      )
    }

    const { fund_id, amount_cents, contributor_name, contributor_email, message, is_anonymous } = parsed.data
    const supabase = getSupabaseAdmin()

    // Look up the fund and its owner
    const { data: fund, error: fundError } = await supabase
      .from('cash_funds')
      .select('id, title, user_id, goal_cents, raised_cents, is_active')
      .eq('id', fund_id)
      .single()

    if (fundError || !fund) {
      return NextResponse.json({ error: 'Fund not found' }, { status: 404 })
    }

    if (!fund.is_active) {
      return NextResponse.json({ error: 'This fund is no longer active' }, { status: 400 })
    }

    // Get the fund owner's profile (need stripe_account_id)
    const { data: owner, error: ownerError } = await supabase
      .from('profiles')
      .select('id, stripe_account_id, stripe_onboarding_complete, email, display_name, slug')
      .eq('id', fund.user_id)
      .single()

    if (ownerError || !owner) {
      return NextResponse.json({ error: 'Registry owner not found' }, { status: 404 })
    }

    if (!owner.stripe_account_id || !owner.stripe_onboarding_complete) {
      return NextResponse.json(
        { error: 'This registry owner hasn\'t set up payouts yet. Contributions cannot be processed at this time.' },
        { status: 400 }
      )
    }

    const origin = req.headers.get('origin') || 'https://alliswelp.com'
    const stripe = getStripe()

    // Calculate platform fee (5% of contribution)
    const applicationFee = Math.round(amount_cents * (PLATFORM_FEE_PERCENT / 100))

    const metadata = {
      type: 'fund_contribution',
      fund_id: fund.id,
      fund_title: fund.title,
      owner_user_id: owner.id,
      owner_slug: owner.slug || '',
      contributor_name,
      contributor_email: contributor_email || '',
      message: message || '',
      is_anonymous: is_anonymous ? 'true' : 'false',
    }

    // Create Stripe Checkout session with destination charge
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Contribution to "${fund.title}"`,
              description: `Supporting ${owner.display_name || 'someone'}'s fresh start on Welp`,
            },
            unit_amount: amount_cents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: applicationFee,
        transfer_data: {
          destination: owner.stripe_account_id,
        },
        metadata,
      },
      customer_email: contributor_email || undefined,
      success_url: `${origin}/${owner.slug}?contributed=true&fund=${fund.id}`,
      cancel_url: `${origin}/${owner.slug}`,
      metadata,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Fund checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
