# Stripe setup — Lara Beauty Store

## EasyPanel env (store / frontend service)

```env
NEXT_PUBLIC_CARD_PAYMENT_ENABLED=true

# Secret key — server only (sk_live_...)
STRIPE_SECRET_KEY=sk_live_...

# Publishable key — safe for browser (pk_live_...) — REQUIRED for card form
STRIPE_PUBLISHABLE_KEY=pk_live_...

STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=https://larabeauty.store
```

**Important:** `sk_live` and `pk_live` are **two different keys** in Stripe Dashboard → API keys.

After saving env vars, **restart/redeploy** the container (no rebuild required for `STRIPE_PUBLISHABLE_KEY`).

## Verify

```bash
curl -s https://larabeauty.store/api/health
# stripeCheckout: configured
# stripePublishableKey: configured
# stripeCardReady: ready

curl -s https://larabeauty.store/api/stripe/config
# {"cardPayments":true,"publishableKey":"pk_live_...","ready":true}
```

## Webhook

- URL: `https://larabeauty.store/api/stripe/webhook`
- Events: `payment_intent.succeeded`

## Security

- Never commit `STRIPE_SECRET_KEY` to git.
- `STRIPE_PUBLISHABLE_KEY` is safe in the browser; the app serves it via `/api/stripe/config` at runtime.
