import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { createOrder, getShopId } from '@/lib/printify'
import { getPrintifyMapping } from '@/lib/printify-products'
import Stripe from 'stripe'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function splitName(name: string): { first_name: string; last_name: string } {
  const parts = name.trim().split(/\s+/)
  return {
    first_name: parts[0] || '',
    last_name: parts.slice(1).join(' ') || '',
  }
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

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      if (!session.metadata?.merch_item_id) break

      try {
        const fullSession = await getStripe().checkout.sessions.retrieve(session.id)
        const shipping = fullSession.collected_information?.shipping_details

        const { error: dbError } = await getSupabaseAdmin()
          .from('merch_orders')
          .insert({
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

        if (dbError) {
          console.error('Failed to insert merch_order:', dbError)
        } else {
          console.log('Merch order recorded')
        }

        const mapping = getPrintifyMapping(session.metadata.merch_item_id)

        if (mapping?.printifyProductId && mapping?.defaultVariantId && shipping?.address) {
          try {
            const shopId = await getShopId()
            const { first_name, last_name } = splitName(shipping.name || 'Customer')

            const printifyOrder = await createOrder(shopId, {
              external_id: session.id,
              label: 'welp-order-' + Date.now(),
              line_items: [
                {
                  product_id: mapping.printifyProductId,
                  variant_id: mapping.defaultVariantId,
                  quantity: 1,
                },
              ],
              shipping_method: 1,
              send_shipping_notification: true,
              address_to: {
                first_name,
                last_name,
                email: session.customer_details?.email || '',
                country: shipping.address.country || 'US',
                region: shipping.address.state || '',
                address1: shipping.address.line1 || '',
                address2: shipping.address.line2 || '',
                city: shipping.address.city || '',
                zip: shipping.address.postal_code || '',
              },
            })

            await getSupabaseAdmin()
              .from('merch_orders')
              .update({
                printify_order_id: printifyOrder.id,
                status: 'fulfilling',
              })
              .eq('stripe_session_id', session.id)

            console.log('Printify order created')
          } catch (printifyErr) {
            console.error('Failed to create Printify order:', printifyErr)
          }
        }
      } catch (err) {
        console.error('Error processing checkout.session.completed:', err)
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      console.warn('Payment failed')
      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}