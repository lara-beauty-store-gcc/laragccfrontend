import Stripe from 'stripe';
import { businessConfig } from '@/config/business';
import { expandOrderIds, generateLaraOrderIds } from '@/lib/order-ids';
import { markOrdersSynced, persistOrdersLocally } from '@/lib/order-store';
import { clientIp } from '@/lib/client-ip';
import { lookupGeo } from '@/lib/geoip';
import { forwardOrderToSheetsWithRetry } from '@/lib/sheets-webhook';
import { sendSnapEvent } from '@/lib/snap-capi';
import { sendTiktokEvent } from '@/lib/tiktok-capi';
import { getStripe, stripeWebhookSecret } from '@/lib/stripe-server';

export const dynamic = 'force-dynamic';

const { market } = businessConfig;

type ParsedStripeItem = {
  sku: string;
  name: string;
  slug: string;
  quantity: number;
  lineTotalAed: number;
};

function parseItems(metadata: Stripe.Metadata): ParsedStripeItem[] {
  try {
    const raw = metadata.itemsJson;
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ParsedStripeItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

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

  if (event.type !== 'checkout.session.completed') {
    return Response.json({ received: true, ignored: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== 'paid') {
    return Response.json({ received: true, ignored: 'not_paid' });
  }

  const metadata = session.metadata || {};
  const items = parseItems(metadata);
  if (items.length === 0) {
    return Response.json({ error: 'missing_items' }, { status: 400 });
  }

  const orderIdsFromMeta = String(metadata.orderIds || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  const orderIds = expandOrderIds(
    orderIdsFromMeta.length ? orderIdsFromMeta : generateLaraOrderIds(items.length),
    items.length,
  );

  const customerName = String(metadata.customerName || '').trim();
  const phone = String(metadata.phone || '').trim();
  const area = String(metadata.area || '').trim();
  const sourceUrl = String(metadata.sourceUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://larabeauty.store');

  const sheetItems = items.map((item) => ({
    product: item.name,
    url: `${sourceUrl.replace(/\/$/, '')}/products/${item.slug}`,
    sku: item.sku,
    quantity: item.quantity,
    totalPrice: item.lineTotalAed,
  }));

  const sheetPayload = {
    customerName,
    phone,
    country: market.countryCode,
    currency: market.currency,
    area,
    sourceUrl,
    items: sheetItems,
    orderIds,
  };

  const sheets = await forwardOrderToSheetsWithRetry(sheetPayload, 2, 150);
  if (!sheets.ok) {
    return Response.json({ error: 'sheet_sync_failed' }, { status: 503 });
  }

  const ip = clientIp(req);
  const geo = await lookupGeo(ip);
  const orderTotal = items.reduce((sum, item) => sum + item.lineTotalAed, 0);
  const eventId = `purchase_${orderIds[0]}`;

  await persistOrdersLocally(
    {
      customerName,
      phone,
      country: market.countryCode,
      currency: market.currency,
      area,
      sourceUrl,
      items: sheetItems,
      clientIp: ip,
      geo,
      userAgent: req.headers.get('user-agent') || '',
    },
    orderIds,
  );
  await markOrdersSynced(orderIds);

  void sendTiktokEvent(
    'Purchase',
    {
      orderId: orderIds[0],
      value: orderTotal,
      currency: market.currency,
      phone,
      sourceUrl,
      contentIds: items.map((item) => item.sku).filter(Boolean),
      eventId,
    },
    { ip, userAgent: req.headers.get('user-agent') ?? '' },
  );

  void sendSnapEvent(
    'Purchase',
    {
      orderId: orderIds[0],
      value: orderTotal,
      currency: market.currency,
      phone,
      sourceUrl,
      contentIds: items.map((item) => item.sku).filter(Boolean),
      eventId,
    },
    { ip, userAgent: req.headers.get('user-agent') ?? '' },
  );

  return Response.json({ received: true, orderId: orderIds[0] });
}
