'use client'
import { Button } from '@/components/ui'
import type { ReactElement } from 'react'

type SubscribeButtonProps = {
  tier: string,
  children: React.ReactNode,
  disabledButton?: boolean
}

export default function StripeSubscribeButton({ tier, children, disabledButton }: SubscribeButtonProps): ReactElement {  
  const handleSubscribe = async () => {
    try {
      const response = await fetch('/api/v1/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lookup_key: tier })
      })

      const data = await response.json()

      if (data && data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error creating Stripe checkout session:', error)
    }
  }

  return (
    <Button onClick={handleSubscribe} disabled={disabledButton ? true : false}>
      {children}
    </Button>
  )
}
