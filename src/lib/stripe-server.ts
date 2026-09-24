import Stripe from 'stripe';
import { stripeSecretKey } from '@/lib/runtime-env';

let client: Stripe | null | undefined;

export { stripeConfigured, stripeSecretKey, stripeWebhookSecret } from '@/lib/runtime-env';

export function getStripe(): Stripe {
  const key = stripeSecretKey();
  if (!key) {
    throw new Error('stripe_not_configured');
  }

  if (!client) {
    client = new Stripe(key, { apiVersion: '2025-02-24.acacia' });
  }

  return client;
}
