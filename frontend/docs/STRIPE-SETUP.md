# Stripe setup — Lara Beauty Store

## Security (important)

- **Never** put `STRIPE_SECRET_KEY` in frontend/client code or git.
- **Never** paste live secret keys in chat, tickets, or screenshots.
- If a secret key was exposed, **rotate it immediately** in [Stripe Dashboard → API keys](https://dashboard.stripe.com/apikeys).
- `pk_live_...` (publishable) is safe for browsers and **required** for inline card fields on `/checkout/card`.

## EasyPanel env (store / frontend service)

```env
# Enable card option in checkout UI
NEXT_PUBLIC_CARD_PAYMENT_ENABLED=true

# Publishable key — required for card form on checkout page
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Server-only (required for card payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Redeploy after saving env vars.

## Stripe Dashboard

1. **Payment Intent** is created by `POST /api/stripe/create-payment-intent` when the customer opens `/checkout/card`.
2. Card fields are shown inline via **Stripe Payment Element** (card number, expiry, CVC — handled by Stripe, not stored on our server).
3. Add webhook endpoint:
   - URL: `https://larabeauty.store/api/stripe/webhook`
   - Events: `payment_intent.succeeded`, `checkout.session.completed` (legacy redirect flow)
4. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET` in EasyPanel.

## Verify

```bash
curl -s https://larabeauty.store/api/health
# stripeCheckout should be "configured"
```

## Pricing

| Method | Delivery | Example (239 AED subtotal) |
|--------|----------|----------------------------|
| Card   | Free     | Total 239 AED              |
| COD    | +20 AED  | Total 259 AED              |

Payment is confirmed after Stripe webhook `payment_intent.succeeded` (or legacy `checkout.session.completed`) with paid status.
