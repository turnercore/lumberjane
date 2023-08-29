import Stripe from 'stripe'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'


type ExpectedSearchParams = {
  session_id : string
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ''

export default async function SubscribedPage({ searchParams } : {searchParams: ExpectedSearchParams}) {
  const supabase = createServerComponentClient({ cookies })
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2023-08-16',
  })
  const session = await stripe.checkout.sessions.retrieve(searchParams.session_id)

  if (session.customer) {
    const stripeCustomerId = session.customer as string
    //Get user ID from session
    const { data: sessionData , error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.error(sessionError)
      return (
        <div>
          <h1>Something went wrong. User session not found.</h1>
        </div>
      )
    }

    const userId = sessionData.session?.user?.id
    if (!userId) {
      return (
        <div>
          <h1>Something went wrong. User not found.</h1>
        </div>
      )
    }

    const { error: updateError } = 
      await supabase
      .from('profiles')
      .update({ 'stripe_customer_id': stripeCustomerId })
      .match({ id: userId })
      .single()

    if (updateError) {
      console.error(updateError)
      return (
        <div>
          <h1>Something went wrong. User not updated.</h1>
        </div>
      )
    }

    return (
      <div>
        <h1>Thank you for supporting!</h1>
      </div>
    )
  }

  return (
    <div>
      <h1>No Customer Session ID</h1>
    </div>
  )
}