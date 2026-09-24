import { businessConfig } from '@/config/business';
import { generateLaraOrderIds } from '@/lib/order-ids';
import { getStripe } from '@/lib/stripe-server';

const { market } = businessConfig;

export type StripeCheckoutItem = {
  sku: string;
  name: string;
  slug: string;
  quantity: number;
  lineTotalAed: number;
};

export type CreateStripeSessionInput = {
  customerName: string;
  phone: string;
  area?: string;
  items: StripeCheckoutItem[];
  sourceUrl: string;
  successUrl: string;
  cancelUrl: string;
};

function toStripeAmount(aed: number): number {
  return Math.round(aed * 100);
}

export async function createStripeCheckoutSession(input: CreateStripeSessionInput) {
  const stripe = getStripe();
  const orderIds = generateLaraOrderIds(input.items.length);
  const subtotal = input.items.reduce((sum, item) => sum + item.lineTotalAed, 0);

  const lineItems = input.items.map((item) => ({
    quantity: 1,
    price_data: {
      currency: market.currency.toLowerCase(),
      unit_amount: toStripeAmount(item.lineTotalAed),
      product_data: {
        name: item.name,
        metadata: {
          sku: item.sku,
          slug: item.slug,
          quantity: String(item.quantity),
        },
      },
    },
  }));

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    customer_creation: 'if_required',
    phone_number_collection: { enabled: false },
    metadata: {
      orderId: orderIds[0],
      orderIds: orderIds.join(','),
      customerName: input.customerName,
      phone: input.phone,
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
    },
  });

  if (!session.url) {
    throw new Error('stripe_checkout_missing_url');
  }

  return {
    checkoutUrl: session.url,
    sessionId: session.id,
    orderId: orderIds[0],
    orderIds,
  };
}
