import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { MERCH_ITEMS } from '@/lib/merch-items'

export async function POST(req: NextRequest) {
  try {
    const { itemId, variantId, size, quantity = 1 } = await req.json()

    // Validate the item exists in our catalog
    const item = MERCH_ITEMS.find((i) => i.id === itemId)
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    if (quantity < 1 || quantity > 10) {
      return NextResponse.json({ error: 'Quantity must be 1-10' }, { status: 400 })
    }

    // Validate variant if provided
    let selectedSize = size || 'One Size'
    if (variantId && item.variants.length > 0) {
      const variant = item.variants.find((v) => v.variantId === variantId)
      if (!variant) {
        return NextResponse.json({ error: 'Invalid size selection' }, { status: 400 })
      }
      selectedSize = variant.label
    }

    const origin = req.headers.get('origin') || 'https://alliswelp.com'

    const metadata = {
      merch_item_id: item.id,
      category: item.category,
      collection: item.collection,
      variant_id: variantId?.toString() || '',
      selected_size: selectedSize,
    }

    // Create Stripe Checkout session
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${item.title}${selectedSize !== 'One Size' ? ` (${selectedSize})` : ''}`,
              description: item.description,
              metadata,
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity,
        },
      ],
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      // Automatic tax calculation (enabled in Stripe dashboard)
      automatic_tax: { enabled: true },
      success_url: `${origin}/merch/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/merch/${item.id}`,
      metadata,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
