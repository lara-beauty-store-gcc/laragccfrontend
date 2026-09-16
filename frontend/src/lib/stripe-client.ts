import { loadStripe, type Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripePublishableKey(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
}

export function stripeElementsReady(): boolean {
  return Boolean(getStripePublishableKey());
}

export function getStripeBrowser(): Promise<Stripe | null> {
  const key = getStripePublishableKey();
  if (!key) return Promise.resolve(null);

  if (!stripePromise) {
    stripePromise = loadStripe(key, { locale: 'ar' });
  }

  return stripePromise;
}
