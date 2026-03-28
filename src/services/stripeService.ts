export const LEMON_PLANS = {
  pro: {
    name: 'Pro',
    price: '$9.99',
    trialDays: 30,
    variantId: '1457042',
    paymentLink: 'https://arn-ai.lemonsqueezy.com/buy/1457042',
  },
  max: {
    name: 'Max',
    price: '$29.99',
    trialDays: 0,
    variantId: '1457051',
    paymentLink: 'https://arn-ai.lemonsqueezy.com/buy/1457051',
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

// Köhnə Stripe ilə uyğunluq üçün
export const STRIPE_PLANS = LEMON_PLANS
