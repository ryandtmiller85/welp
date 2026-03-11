import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

/**
 * POST /api/connect/onboard
 * Creates a Stripe Express account (or re-uses existing) and returns
 * an Account Link URL for the user to complete onboarding.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const origin = req.headers.get('origin') || 'https://alliswelp.com'

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_account_id, stripe_onboarding_complete, email, display_name')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const stripe = getStripe()
    let accountId = profile.stripe_account_id

    // Create Express account if they don't have one yet
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: profile.email || session.user.email || undefined,
        metadata: {
          welp_user_id: userId,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        business_profile: {
          product_description: 'Receiving contributions through Welp breakup registry',
        },
      })

      accountId = account.id

      // Save the account ID to the profile
      await supabase
        .from('profiles')
        .update({ stripe_account_id: accountId })
        .eq('id', userId)
    }

    // Create an Account Link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/dashboard/payouts?refresh=true`,
      return_url: `${origin}/dashboard/payouts?success=true`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error: any) {
    console.error('Connect onboard error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create onboarding link' },
      { status: 500 }
    )
  }
}
