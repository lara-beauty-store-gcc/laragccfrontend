import { loadStripe, type Stripe } from '@stripe/stripe-js';

let cachedPublishableKey = '';
let stripePromise: Promise<Stripe | null> | null = null;
let configPromise: Promise<{ publishableKey: string | null; ready: boolean }> | null = null;

function readBuildTimeKey(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
}

export function getStripePublishableKey(): string {
  return cachedPublishableKey || readBuildTimeKey();
}

export function primeStripePublishableKey(key: string) {
  const trimmed = key.trim();
  if (!trimmed) return;
  cachedPublishableKey = trimmed;
  stripePromise = loadStripe(trimmed, { locale: 'ar' });
}

/** Load pk_live from build env or GET /api/stripe/config (EasyPanel runtime). */
export async function ensureStripeClient(): Promise<{ ready: boolean; publishableKey: string | null }> {
  const buildKey = readBuildTimeKey();
  if (buildKey) {
    primeStripePublishableKey(buildKey);
    return { ready: true, publishableKey: buildKey };
  }

  if (cachedPublishableKey) {
    return { ready: true, publishableKey: cachedPublishableKey };
  }

  if (!configPromise) {
    configPromise = fetch('/api/stripe/config', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data: { publishableKey?: string | null; ready?: boolean }) => {
        const key = String(data.publishableKey || '').trim();
        if (key) primeStripePublishableKey(key);
        return { ready: Boolean(data.ready && key), publishableKey: key || null };
      })
      .catch(() => ({ ready: false, publishableKey: null }));
  }

  return configPromise;
}

export function getStripeBrowser(): Promise<Stripe | null> {
  const key = getStripePublishableKey();
  if (!key) return Promise.resolve(null);

  if (!stripePromise) {
    stripePromise = loadStripe(key, { locale: 'ar' });
  }

  return stripePromise;
}
