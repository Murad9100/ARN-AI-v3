export const LEMON_PLANS = {
  pro: {
    name: 'Pro',
    price: '$9.99',
    trialDays: 30,
    variantId: '1457042',
    paymentLink: 'https://arn-ai.lemonsqueezy.com/checkout/buy/1cfec579-c8ef-4e0b-b1a7-41d0d17ede42',
  },
  max: {
    name: 'Max',
    price: '$29.99',
    trialDays: 0,
    variantId: '1457051',
    paymentLink: 'https://arn-ai.lemonsqueezy.com/checkout/buy/df95e11d-09cc-4eb0-9418-97106435c49c',
  },
}

export function redirectToCheckout(plan: 'pro' | 'max', email?: string) {
  const { paymentLink } = LEMON_PLANS[plan]

  const params = new URLSearchParams()
  if (email) params.set('checkout[email]', email)
  params.set('checkout[redirect_url]', `${window.location.origin}/chat?upgraded=true`)

  const url = `${paymentLink}?${params.toString()}`
  window.open(url, '_blank')
}

export const STRIPE_PLANS = LEMON_PLANS
