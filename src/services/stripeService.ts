export const STRIPE_PLANS = {
  pro: {
    name: 'Pro',
    price: '$9.99',
    trialDays: 30,
    paymentLink: 'https://buy.stripe.com/LIVE_PRO_LINK',
  },
  max: {
    name: 'Max',
    price: '$29.99',
    trialDays: 0,
    paymentLink: 'https://buy.stripe.com/LIVE_MAX_LINK',
  },
}
```

---

## 4. Live Webhook yarat

Stripe → **Developers → Webhooks** → yeni endpoint əlavə et:
```
https://qgeocpxddcmqpxkbfgfh.supabase.co/functions/v1/stripe-webhook
