import { businessConfig } from '@/config/business';
import { markOrdersSynced, persistOrdersLocally } from '@/lib/order-store';
import { forwardOrderToSheets } from '@/lib/sheets-webhook';
import { syncUnsyncedOrdersToSheets } from '@/lib/sheets-sync';
import { normalizeUaePhone, uaePhoneErrorMessage } from '@/lib/phone';

type IncomingItem = {
  sku?: string;
  name?: string;
  slug?: string;
  quantity?: number;
  lineTotal?: number;
};

type IncomingBody = {
  customerName?: string;
  phone?: string;
  area?: string;
  items?: IncomingItem[];
  sourceUrl?: string;
};

const { market } = businessConfig;

function siteBaseUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://larabeauty.store').replace(/\/$/, '');
}

function normalizeItems(items: IncomingItem[]) {
  return items.map((item) => {
    const slug = String(item.slug || '').trim();
    const quantity = Math.max(1, Number(item.quantity) || 1);
    const lineTotal = Number(item.lineTotal) || 0;

    return {
      product: String(item.name || '').trim(),
      url: slug ? `${siteBaseUrl()}/products/${slug}` : siteBaseUrl(),
      sku: String(item.sku || '').trim(),
      quantity,
      totalPrice: lineTotal,
      slug,
      unitPriceAed: lineTotal / quantity,
    };
  });
}

async function forwardToLegacyApi(
  body: IncomingBody,
  phoneE164: string,
  normalizedItems: ReturnType<typeof normalizeItems>,
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  const phoneCandidates = [
    phoneE164.replace(/\D/g, '').replace(/^971/, ''),
    phoneE164.replace(/\D/g, ''),
    phoneE164,
  ].filter((value, index, all) => value && all.indexOf(value) === index);

  for (const phone of phoneCandidates) {
    try {
      const res = await fetch(`${apiUrl}/api/v1/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: body.customerName,
          phone,
          area: body.area,
          country: market.countryCode,
          currency: market.currency,
          items: normalizedItems.map((item) => ({
            sku: item.sku,
            name: item.product,
            productId: item.slug,
            slug: item.slug,
            quantity: item.quantity,
            unitPriceAed: item.unitPriceAed,
            lineTotalAed: item.totalPrice,
          })),
          sourceUrl: body.sourceUrl || siteBaseUrl(),
          eventId: `purchase_${Date.now()}`,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) continue;

      const orderIds = Array.isArray(data.orderIds)
        ? data.orderIds.map(String)
        : data.orderId || data.orderNumber
          ? [String(data.orderId || data.orderNumber)]
          : [];

      if (orderIds.length === 0) continue;

      return { orderId: orderIds[0], orderIds, source: 'api' as const };
    } catch {
      // try next format
    }
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as IncomingBody;
    const customerName = String(body.customerName || '').trim();
    const phoneE164 = normalizeUaePhone(String(body.phone || ''));

    if (!customerName || customerName.length < 2) {
      return Response.json({ error: 'invalid_name', message: 'الاسم الكامل مطلوب' }, { status: 400 });
    }

    if (!phoneE164) {
      return Response.json(
        { error: 'invalid_phone', message: uaePhoneErrorMessage(String(body.phone || '')) },
        { status: 400 },
      );
    }

    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      return Response.json({ error: 'empty_cart', message: 'السلة فارغة' }, { status: 400 });
    }

    const normalizedItems = normalizeItems(items);
    const payload = {
      customerName,
      phone: phoneE164,
      country: market.countryCode,
      currency: market.currency,
      area: String(body.area || ''),
      sourceUrl: body.sourceUrl || siteBaseUrl(),
      items: normalizedItems.map(({ product, url, sku, quantity, totalPrice }) => ({
        product,
        url,
        sku,
        quantity,
        totalPrice,
      })),
    };

    const local = await persistOrdersLocally(payload);

    const sheets = await forwardOrderToSheets({
      customerName,
      phone: phoneE164,
      country: market.countryCode,
      currency: market.currency,
      area: payload.area,
      sourceUrl: payload.sourceUrl,
      items: payload.items,
      orderIds: local.orderIds,
    });

    if (sheets.ok) {
      await markOrdersSynced(sheets.orderIds);
      void syncUnsyncedOrdersToSheets();
      return Response.json({ success: true, orderId: sheets.orderIds[0], orderIds: sheets.orderIds, source: 'sheets' });
    }

    const legacy = await forwardToLegacyApi(body, phoneE164, normalizedItems);
    if (legacy) {
      await markOrdersSynced(local.orderIds);
      return Response.json({ success: true, ...legacy });
    }

    void syncUnsyncedOrdersToSheets();

    return Response.json({
      success: true,
      orderId: local.orderIds[0],
      orderIds: local.orderIds,
      source: 'local',
      sheetSynced: false,
      sheetError: sheets.reason,
      sheetDetail: sheets.detail,
    });
  } catch {
    return Response.json(
      { error: 'internal_error', message: 'صار خطأ — جربي مرة ثانية' },
      { status: 500 },
    );
  }
}
