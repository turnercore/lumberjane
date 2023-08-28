import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ''

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-08-16'
})

export async function POST(req: NextRequest) {
  try {
    const requestBody = JSON.parse(await req.text())
    if (!requestBody) {
      return NextResponse.json({ error: 'No request body provided' }, { status: 400 })
    }

    const lookup_key = requestBody.lookup_key
    if (!lookup_key) {
      return NextResponse.json({ error: 'Lookup key is required' }, { status: 400 })
    }

    const prices = await stripe.prices.list({
      lookup_keys: [lookup_key],
      expand: ['data.product']
    })

    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      line_items: [
        {
          price: prices.data[0].id,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/subscribed/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/`,
      automatic_tax: { enabled: true }
    })

    return NextResponse.json({ success: true, url: session.url })
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
