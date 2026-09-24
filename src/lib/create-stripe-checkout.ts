import type { OrderLinePayload } from '@/lib/submit-order';

export type StripeCheckoutPayload = {
  customerName: string;
  phone: string;
  area?: string;
  items: OrderLinePayload[];
  sourceUrl?: string;
  paymentMethod: 'card';
};

export type StripeCheckoutResult = {
  checkoutUrl: string;
  sessionId?: string;
  orderId?: string;
};

export async function createStripeCheckout(
  payload: StripeCheckoutPayload,
): Promise<StripeCheckoutResult> {
  const res = await fetch('/api/stripe/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.error || 'stripe_checkout_failed');
  }

  const checkoutUrl = String(data.checkoutUrl || data.url || '');
  if (!checkoutUrl) {
    throw new Error('stripe_checkout_missing_url');
  }

  return {
    checkoutUrl,
    sessionId: data.sessionId ? String(data.sessionId) : undefined,
    orderId: data.orderId ? String(data.orderId) : undefined,
  };
}
