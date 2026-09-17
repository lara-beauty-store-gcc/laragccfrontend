import { businessConfig } from '@/config/business';
import { generateLaraOrderIds } from '@/lib/order-ids';
import { getStripe } from '@/lib/stripe-server';

const { market } = businessConfig;

export type StripePaymentItem = {
  sku: string;
  name: string;
  slug: string;
  quantity: number;
  lineTotalAed: number;
};

export type CreateStripePaymentIntentInput = {
  customerName?: string;
  email?: string;
  phone?: string;
  area?: string;
  items: StripePaymentItem[];
  sourceUrl: string;
};

function toStripeAmount(aed: number): number {
  return Math.round(aed * 100);
}

function buildMetadata(input: CreateStripePaymentIntentInput, orderIds: string[], subtotal: number) {
  return {
    orderId: orderIds[0],
    orderIds: orderIds.join(','),
    customerName: input.customerName || '',
    email: input.email || '',
    phone: input.phone || '',
    area: input.area || '',
    sourceUrl: input.sourceUrl,
    paymentMethod: 'CARD',
    subtotalAed: String(subtotal),
    deliveryFeeAed: '0',
    totalAed: String(subtotal),
    itemsJson: JSON.stringify(
      input.items.map((item) => ({
        sku: item.sku,
        name: item.name,
        slug: item.slug,
        quantity: item.quantity,
        lineTotalAed: item.lineTotalAed,
      })),
    ).slice(0, 450),
  };
}

export async function createStripePaymentIntent(input: CreateStripePaymentIntentInput) {
  const stripe = getStripe();
  const orderIds = generateLaraOrderIds(input.items.length);
  const subtotal = input.items.reduce((sum, item) => sum + item.lineTotalAed, 0);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: toStripeAmount(subtotal),
    currency: market.currency.toLowerCase(),
    automatic_payment_methods: { enabled: true },
    metadata: buildMetadata(input, orderIds, subtotal),
  });

  if (!paymentIntent.client_secret) {
    throw new Error('stripe_payment_intent_missing_secret');
  }

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    orderId: orderIds[0],
    orderIds,
    amount: subtotal,
  };
}

export async function updateStripePaymentIntent(
  paymentIntentId: string,
  input: CreateStripePaymentIntentInput,
) {
  const stripe = getStripe();
  const subtotal = input.items.reduce((sum, item) => sum + item.lineTotalAed, 0);
  const existing = await stripe.paymentIntents.retrieve(paymentIntentId);
  const orderIds = String(existing.metadata?.orderIds || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
    amount: toStripeAmount(subtotal),
    metadata: buildMetadata(
      input,
      orderIds.length ? orderIds : generateLaraOrderIds(input.items.length),
      subtotal,
    ),
  });

  if (!paymentIntent.client_secret) {
    throw new Error('stripe_payment_intent_missing_secret');
  }

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    orderId: orderIds[0] || generateLaraOrderIds(1)[0],
    orderIds: orderIds.length ? orderIds : generateLaraOrderIds(input.items.length),
    amount: subtotal,
  };
}
