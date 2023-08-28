import PricingCard from './components/PricingCard'

const PricingPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Pricing</h1>
      <div className="grid grid-cols-3 gap-4">
        <PricingCard
          title="Free Tier"
          description="$0/year"
          features={[
            '20 requests a day (tracked monthly)',
            '20 api keys',
            '20 active tokens',
            'BYOK (Bring Your Own Key) for AI response validation'
          ]}
          tier="free"
          disabledButton={true}
        >
          <p> Free! </p>
        </PricingCard>

        <PricingCard
          title="Supporter Tier"
          description="$10/year"
          features={[
            '100 requests a day (tracked monthly)',
            'Unlimited api keys',
            'Unlimited active tokens',
            '1000 ai response validations monthly'
          ]}
          tier="supporter"
        >
          Subscribe
        </PricingCard>

        <PricingCard
          title="Pillar Tier"
          description="$99/year"
          features={[
            'Unlimited requests',
            'Unlimited api keys',
            'Unlimited active tokens',
            'Unlimited ai response validation'
          ]}
          tier="pillar"
        >
          <p> Coming soon! </p>
          </PricingCard>

      </div>

      {/* Disclaimer */}
      <div className="mt-8 text-sm text-gray-600">
        We use Stripe for payment fulfillment. You will be redirected to Stripe and then back to the site after payment goes through.
      </div>
    </div>
  )
}

export default PricingPage
