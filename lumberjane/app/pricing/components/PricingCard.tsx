import StripeSubscribeButton from '@/components/stripe/StripeSubscribeButton'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'

type PricingCardProps = {
  title: string,
  description: string,
  features: string[],
  tier: string,
  children: React.ReactNode,
  disabledButton?: boolean
}

const PricingCard: React.FC<PricingCardProps> = ({ title, description, features, tier, children, disabledButton }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul>
          {features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
        <StripeSubscribeButton tier={tier} disabledButton={disabledButton}>
          {children}
        </StripeSubscribeButton>
      </CardContent>
    </Card>
  )
}

export default PricingCard
