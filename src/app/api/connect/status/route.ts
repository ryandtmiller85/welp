import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

/**
 * GET /api/connect/status
 * Returns the current Stripe Connect status for the logged-in user.
 * Checks with Stripe API to see if charges are enabled (onboarding complete).
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_account_id, stripe_onboarding_complete')
      .eq('id', session.user.id)
      .single()

    if (!profile?.stripe_account_id) {
      return NextResponse.json({
        connected: false,
        onboarding_complete: false,
        charges_enabled: false,
        payouts_enabled: false,
      })
    }

    // Check actual status with Stripe
    const stripe = getStripe()
    const account = await stripe.accounts.retrieve(profile.stripe_account_id)

    const chargesEnabled = account.charges_enabled ?? false
    const payoutsEnabled = account.payouts_enabled ?? false
    const onboardingComplete = chargesEnabled && payoutsEnabled

    // Update our DB if onboarding status changed
    if (onboardingComplete !== profile.stripe_onboarding_complete) {
      await supabase
        .from('profiles')
        .update({ stripe_onboarding_complete: onboardingComplete })
        .eq('id', session.user.id)
    }

    return NextResponse.json({
      connected: true,
      onboarding_complete: onboardingComplete,
      charges_enabled: chargesEnabled,
      payouts_enabled: payoutsEnabled,
      account_id: profile.stripe_account_id,
    })
  } catch (error: any) {
    console.error('Connect status error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check status' },
      { status: 500 }
    )
  }
}
