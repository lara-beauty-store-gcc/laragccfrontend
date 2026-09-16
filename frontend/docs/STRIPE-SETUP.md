# Stripe setup — Lara Beauty Store

## Security (important)

- **Never** put `STRIPE_SECRET_KEY` in frontend/client code or git.
- **Never** paste live secret keys in chat, tickets, or screenshots.
- If a secret key was exposed, **rotate it immediately** in [Stripe Dashboard → API keys](https://dashboard.stripe.com/apikeys).
- `pk_live_...` (publishable) is safe for browsers but this store uses **Stripe Checkout redirect** — publishable key is optional.

## EasyPanel env (store / frontend service)

```env
# Enable card option in checkout UI
NEXT_PUBLIC_CARD_PAYMENT_ENABLED=true

# Server-only (required for card payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Redeploy after saving env vars.

## Stripe Dashboard

1. **Checkout** is created by `POST /api/stripe/create-checkout` (server-side).
2. Add webhook endpoint:
   - URL: `https://larabeauty.store/api/stripe/webhook`
   - Events: `checkout.session.completed`
3. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET` in EasyPanel.

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

Payment is only confirmed after Stripe webhook `checkout.session.completed` with `payment_status=paid`.
