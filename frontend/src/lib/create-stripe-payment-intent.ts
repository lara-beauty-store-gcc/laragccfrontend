import type { OrderLinePayload } from '@/lib/submit-order';

export type StripePaymentIntentPayload = {
  customerName?: string;
  phone?: string;
  area?: string;
  items: OrderLinePayload[];
  sourceUrl?: string;
  paymentIntentId?: string;
};

export type StripePaymentIntentResult = {
  clientSecret: string;
  paymentIntentId: string;
  orderId: string;
  orderIds: string[];
  amount: number;
};

export async function createStripePaymentIntent(
  payload: StripePaymentIntentPayload,
): Promise<StripePaymentIntentResult> {
  const res = await fetch('/api/stripe/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.error || 'stripe_payment_intent_failed');
  }

  const clientSecret = String(data.clientSecret || '');
  if (!clientSecret) {
    throw new Error('stripe_payment_intent_missing_secret');
  }

  return {
    clientSecret,
    paymentIntentId: String(data.paymentIntentId || ''),
    orderId: String(data.orderId || ''),
    orderIds: Array.isArray(data.orderIds) ? data.orderIds.map(String) : [],
    amount: Number(data.amount) || 0,
  };
}
