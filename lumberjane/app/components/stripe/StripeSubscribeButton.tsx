import { Button } from '@/components/ui'
import type { ReactElement } from 'react'

type SubscribeButtonProps = {
  subscriptionType: string,
  children: React.ReactNode
}

export default function StripeSubscribeButton({ subscriptionType, children }: SubscribeButtonProps): ReactElement {  
  const handleSubscribe = async () => {
    try {
      const response = await fetch('/api/v1/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lookup_key: subscriptionType })
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
    <Button onClick={handleSubscribe}>
      {children}
    </Button>
  )
}
