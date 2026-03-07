import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Lazy Supabase admin client for webhook processing (no user session)
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      // Only process merch orders (identified by metadata)
      if (!session.metadata?.merch_item_id) break

      try {
        // Retrieve full session to get collected shipping info
        const fullSession = await getStripe().checkout.sessions.retrieve(session.id)
        const shipping = fullSession.collected_information?.shipping_details

        const { error } = await getSupabaseAdmin().from('merch_orders').insert({
          stripe_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent as string,
          merch_item_id: session.metadata.merch_item_id,
          item_title: session.metadata.item_title || null,
          amount_total: session.amount_total,
          currency: session.currency,
          customer_email: session.customer_details?.email || null,
          shipping_name: shipping?.name || null,
          shipping_address: shipping?.address
            ? JSON.stringify(shipping.address)
            : null,
          status: 'paid',
        })

        if (error) {
          console.error('Failed to insert merch_order:', error)
        } else {
          console.log(`Merch order recorded: ${session.metadata.merch_item_id}`)
        }
      } catch (err) {
        console.error('Error processing checkout.session.completed:', err)
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      console.warn(`Payment failed: ${pi.id}`, pi.last_payment_error?.message)
      break
    }

    default:
      // Ignore unhandled event types
      break
  }

  return NextResponse.json({ received: true })
}
