import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'


const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET || ''
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ''


export async function POST(req: NextRequest) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2023-08-16'
  })

  const sig = req.headers.get('stripe-signature') || ''
  const body = await req.text()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err?.message}` }, { status: 400 })
  }
  const eventData = event.data as Stripe.Event.Data
  const paymentIntent = eventData.object as Stripe.PaymentIntent

  // Step 1: Find the corresponding user in your database using the Stripe customer ID
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', paymentIntent.customer)
    .single()

  if (profileError || !profile ) {
    console.error('Error fetching profile:', profileError)
    return NextResponse.json({ error: 'Profile not found' }, { status: 500 })
  }

  const userId = profile.id

  // Step 2: Create a new transaction record in the 'transactions' table
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert([
      {
        user_id: userId,
        stripe_customer_id: paymentIntent.customer,
        data: paymentIntent,
      },
    ])

  if (transactionError) {
    console.error('Error creating transaction:', transactionError)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }

  const supportLevel = paymentIntent.metadata.support_level

  // Step 3: Update the 'supporters' table with the subscription details
  const { error: supporterError } = await supabase
    .from('supporters')
    .upsert([
      {
        id: userId, // Assuming the ID in the 'supporters' table corresponds to the user ID
        support_level: supportLevel, // Set the appropriate subscription status
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 + 7 * 24 * 60 * 60 * 1000), // Set to 1 year + 7 days from now
      },
    ])

  if (supporterError) {
    console.error('Error updating supporter:', supporterError)
    return NextResponse.json({ error: 'Failed to update supporter' }, { status: 500 })
  }
  console.log(`Successfully updated supporter ${userId} to ${supportLevel}`)
  return NextResponse.json({ received: true })
}