export const STRIPE_PLANS = {
  pro: {
    name: 'Pro',
    price: '$9.99',
    trialDays: 30,
    paymentLink: 'https://buy.stripe.com/test_6oUaEZ9hg3Vh8Cvc6hcZa01',
  },
  max: {
    name: 'Max',
    price: '$29.99',
    trialDays: 0,
    paymentLink: 'https://buy.stripe.com/test_3cIbJ33WWgI37yrgmxcZa00',
  },
}

export function redirectToCheckout(plan: 'pro' | 'max', email?: string) {
  const { paymentLink } = STRIPE_PLANS[plan]
  
  const params = new URLSearchParams()
  if (email) params.set('prefilled_email', email)
  
  // Ödənişdən sonra sayta qayıt
  params.set('success_url', `${window.location.origin}/chat?upgraded=true`)

  const url = `${paymentLink}?${params.toString()}`
  window.open(url, '_blank')
}
