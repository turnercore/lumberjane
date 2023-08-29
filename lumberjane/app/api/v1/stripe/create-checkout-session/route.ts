import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
export const dynamic = 'force-dynamic'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ''

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-08-16'
})

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: supabaseSessionData, error: supabaseSessionError } = await supabase.auth.getSession()
    if (supabaseSessionError) {
      return NextResponse.json({ error: 'Not logged in to supabase.' }, { status: 500 })
    }

    const user = supabaseSessionData.session?.user
    if (!user) {
      return NextResponse.json({ error: 'Not logged in to supabase.' }, { status: 500 })
    }

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
      cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/`
      })

      // Get the customer id from Stripe and add it to the user's profile, if everything goes well send the checkout session url
      supabase
        .from('profiles')
        .update({ stripe_customer_id: session.customer?.toString() })
        .eq('id', user.id)
        .then(({ data, error }) => {
          if (error) {
            console.error('Error updating user profile:', error)
          } else {
            return NextResponse.json({ success: true, url: session.url })
          }
        })
        
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
