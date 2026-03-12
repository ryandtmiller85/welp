import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getAdminSupabase } from '@/lib/admin-api'
import { createOrder, getShopId } from '@/lib/printify'
import { getPrintifyMapping } from '@/lib/printify-products'
import { sendContributionNotification } from '@/lib/email'
import Stripe from 'stripe'

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

      // ── Fund contribution ──────────────────────────────
      if (session.metadata?.type === 'fund_contribution') {
        await handleFundContribution(session)
        break
      }

      // ── Merch order ────────────────────────────────────
      if (session.metadata?.merch_item_id) {
        await handleMerchOrder(session)
        break
      }

      break
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      console.error('Payment failed:', pi.id, pi.last_payment_error?.message)
      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}

// ── Fund contribution handler ──────────────────────────────

async function handleFundContribution(session: Stripe.Checkout.Session) {
  const supabase = getAdminSupabase()
  const meta = session.metadata!

  const fundId = meta.fund_id
  const amountCents = session.amount_total || 0
  const contributorName = meta.contributor_name || 'Anonymous'
  const contributorEmail = meta.contributor_email || null
  const message = meta.message || null
  const isAnonymous = meta.is_anonymous === 'true'

  try {
    // 1. Insert contribution record
    const { error: contribError } = await supabase
      .from('contributions')
      .insert({
        cash_fund_id: fundId,
        contributor_name: isAnonymous ? 'Anonymous' : contributorName,
        contributor_email: contributorEmail,
        amount_cents: amountCents,
        is_anonymous: isAnonymous,
        message,
        stripe_payment_id: session.payment_intent as string,
        status: 'completed',
      })

    if (contribError) {
      console.error('Failed to insert contribution:', contribError)
    }

    // 2. Update the fund's raised_cents
    // Use raw SQL to atomically increment
    const { data: fund } = await supabase
      .from('cash_funds')
      .select('raised_cents')
      .eq('id', fundId)
      .single()

    if (fund) {
      const newRaised = (fund.raised_cents || 0) + amountCents
      await supabase
        .from('cash_funds')
        .update({ raised_cents: newRaised })
        .eq('id', fundId)
    }

    // 3. Send email notification to registry owner (fire-and-forget)
    const ownerSlug = meta.owner_slug
    const ownerUserId = meta.owner_user_id

    if (ownerUserId) {
      const { data: owner } = await supabase
        .from('profiles')
        .select('email, display_name, slug')
        .eq('id', ownerUserId)
        .single()

      if (owner?.email) {
        const fundTitle = meta.fund_title || 'your fund'
        const displayAmount = `$${(amountCents / 100).toFixed(2)}`

        sendContributionNotification({
          ownerEmail: owner.email,
          ownerName: owner.display_name || 'there',
          contributorName: isAnonymous ? 'Someone anonymous' : contributorName,
          amount: displayAmount,
          fundTitle,
          message: message || undefined,
          registrySlug: owner.slug || ownerSlug || '',
        }).catch(() => {})
      }
    }
  } catch (err) {
    console.error('Error processing fund contribution:', err)
  }
}

// ── Merch order handler ────────────────────────────────────

async function handleMerchOrder(session: Stripe.Checkout.Session) {
  const supabase = getAdminSupabase()

  try {
    const fullSession = await getStripe().checkout.sessions.retrieve(session.id)
    const shipping = fullSession.collected_information?.shipping_details

    const { error: dbError } = await supabase
      .from('merch_orders')
      .insert({
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        merch_item_id: session.metadata!.merch_item_id,
        item_title: session.metadata!.item_title || null,
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
    }

    const mapping = getPrintifyMapping(session.metadata!.merch_item_id)

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

        await supabase
          .from('merch_orders')
          .update({
            printify_order_id: printifyOrder.id,
            status: 'fulfilling',
          })
          .eq('stripe_session_id', session.id)

      } catch (printifyErr) {
        console.error('Failed to create Printify order:', printifyErr)
      }
    }
  } catch (err) {
    console.error('Error processing checkout.session.completed:', err)
  }
}
