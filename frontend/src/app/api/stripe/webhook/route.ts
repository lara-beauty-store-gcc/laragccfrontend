import Stripe from 'stripe';
import { getStripe, stripeWebhookSecret } from '@/lib/stripe-server';
import { processPaidStripeOrder } from '@/lib/stripe-process-paid-order';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const secret = stripeWebhookSecret();
  if (!secret) {
    return Response.json({ error: 'webhook_not_configured' }, { status: 503 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return Response.json({ error: 'missing_signature' }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch {
    return Response.json({ error: 'invalid_signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== 'paid') {
      return Response.json({ received: true, ignored: 'not_paid' });
    }

    const result = await processPaidStripeOrder({ metadata: session.metadata || {}, req });
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json({ received: true, orderId: result.orderId });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const result = await processPaidStripeOrder({ metadata: paymentIntent.metadata || {}, req });
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json({ received: true, orderId: result.orderId });
  }

  return Response.json({ received: true, ignored: event.type });
}
