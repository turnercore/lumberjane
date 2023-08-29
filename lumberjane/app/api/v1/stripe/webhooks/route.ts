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
  console.error('eventData', eventData)
  console.log(eventData)


  return NextResponse.json({ received: true })

  // const productId = eventData.product as string // You'll need to extract this based on your Stripe setup

  // // Update transactions table
  // await supabase.from('transactions').insert([
  //   {
  //     transaction_id: eventData.id,
  //     user_id: userId,
  //     data: JSON.stringify(eventData)
  //   }
  // ])

  // // Handle subscriptions
  // switch (event.type) {
  //   case 'payment_intent.succeeded':
  //     // Check if a subscription already exists
  //     const { data: existingSubscriptions } = await supabase
  //       .from('subscriptions')
  //       .select('*')
  //       .eq('user_id', userId)

  //     const currentDate = new Date()
  //     const endDate = new Date()
  //     endDate.setFullYear(currentDate.getFullYear() + 1)
  //     endDate.setDate(currentDate.getDate() + 3)

  //     if (existingSubscriptions && existingSubscriptions.length > 0) {
  //       // Renew subscription
  //       await supabase.from('subscriptions').upsert([
  //         {
  //           user_id: userId,
  //           start_date: currentDate,
  //           end_date: endDate,
  //           product_id: productId,
  //         }
  //       ])
  //     } else {
  //       // Create new subscription
  //       await supabase.from('subscriptions').insert([
  //         {
  //           user_id: userId,
  //           start_date: currentDate,
  //           end_date: endDate,
  //           product_id: productId,
  //         }
  //       ])
  //     }
  //     break
  //   default:
  //     console.log(`Unhandled event type ${event.type}`)
  // }

  // return NextResponse.json({ received: true })
}
