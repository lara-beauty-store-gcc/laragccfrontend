import type Stripe from 'stripe';
import { businessConfig } from '@/config/business';
import { expandOrderIds, generateLaraOrderIds } from '@/lib/order-ids';
import { markOrdersSynced, persistOrdersLocally } from '@/lib/order-store';
import { lookupGeo } from '@/lib/geoip';
import { forwardOrderToSheetsWithRetry } from '@/lib/sheets-webhook';
import { sendSnapEvent } from '@/lib/snap-capi';
import { sendTiktokEvent } from '@/lib/tiktok-capi';
import { clientIp } from '@/lib/client-ip';
import { parseStripeItems } from '@/lib/stripe-order-metadata';

const { market } = businessConfig;

type ProcessPaidOrderInput = {
  metadata: Stripe.Metadata;
  req: Request;
};

export async function processPaidStripeOrder({ metadata, req }: ProcessPaidOrderInput) {
  const items = parseStripeItems(metadata);
  if (items.length === 0) {
    return { ok: false as const, error: 'missing_items' as const };
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
  const email = String(metadata.email || '').trim().toLowerCase();
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
    email: email || undefined,
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
    return { ok: false as const, error: 'sheet_sync_failed' as const };
  }

  const ip = clientIp(req);
  const geo = await lookupGeo(ip);
  const orderTotal = items.reduce((sum, item) => sum + item.lineTotalAed, 0);
  const eventId = `purchase_${orderIds[0]}`;

  await persistOrdersLocally(
    {
      customerName,
      email: email || undefined,
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

  return { ok: true as const, orderId: orderIds[0] };
}
