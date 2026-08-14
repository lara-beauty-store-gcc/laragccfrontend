import { businessConfig } from '@/config/business';
import { expandOrderIds, generateLaraOrderIds } from '@/lib/order-ids';
import { markOrdersSynced, persistOrdersLocally } from '@/lib/order-store';
import { apiBaseUrl, runtimeEnv } from '@/lib/runtime-env';
import {
  flattenRawItems,
  normalizeSheetItem,
  pickProductName,
  pickQuantity,
  type RawSheetItem,
} from '@/lib/sheets-export';
import { forwardOrderToSheetsWithRetry } from '@/lib/sheets-webhook';
import { sendSnapEvent } from '@/lib/snap-capi';
import { sendTiktokEvent } from '@/lib/tiktok-capi';
import { normalizeCustomerName, normalizeUaePhone, formatPhoneForSheet, uaePhoneErrorMessage } from '@/lib/phone';

export const dynamic = 'force-dynamic';

const API_TIMEOUT_MS = 2500;

type IncomingBody = {
  customerName?: string;
  phone?: string;
  area?: string;
  items?: RawSheetItem[];
  sourceUrl?: string;
};

const { market } = businessConfig;

function siteBaseUrl() {
  return runtimeEnv('NEXT_PUBLIC_SITE_URL', 'https://larabeauty.store').replace(/\/$/, '');
}

function clientIp(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? '';
  return req.headers.get('x-real-ip') ?? '';
}

function normalizeOrderItems(items: RawSheetItem[]) {
  const ctx = { siteBaseUrl: siteBaseUrl() };

  return flattenRawItems(items)
    .map((raw) => {
      const sheet = normalizeSheetItem(raw, ctx);
      const quantity = pickQuantity(raw);
      const slug = String(raw.slug || raw.productId || '').trim();
      const lineTotal = sheet.totalPrice;

      return {
        product: pickProductName(raw) || sheet.product,
        url: sheet.url,
        sku: sheet.sku,
        quantity,
        totalPrice: lineTotal,
        slug,
        unitPriceAed: quantity > 0 ? lineTotal / quantity : 0,
      };
    })
    .filter((item) => item.product || item.sku);
}

type ApiOrderResult = {
  orderId: string;
  orderIds: string[];
  source: 'api';
  apiSheets: string;
};

async function forwardToBackendApi(
  body: IncomingBody,
  customerName: string,
  phoneE164: string,
  normalizedItems: ReturnType<typeof normalizeOrderItems>,
) {
  const apiUrl = apiBaseUrl();
  if (!apiUrl) return null;

  const localDigits = phoneE164.replace(/\D/g, '').replace(/^971/, '');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const res = await fetch(`${apiUrl.replace(/\/$/, '')}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        customerName,
        customer_name: customerName,
        full_name: customerName,
        phone: localDigits,
        area: body.area,
        country: market.countryCode,
        currency: market.currency,
        skipSheets: true,
        sheetSyncedBy: 'frontend',
        items: normalizedItems.map((item) => ({
          sku: item.sku,
          name: item.product,
          productName: item.product,
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
    if (!res.ok) return null;

    const orderIds = Array.isArray(data.orderIds)
      ? data.orderIds.map(String)
      : data.orderId || data.orderNumber
        ? [String(data.orderId || data.orderNumber)]
        : [];

    if (orderIds.length === 0) return null;

    return {
      orderId: orderIds[0],
      orderIds,
      source: 'api' as const,
      apiSheets: String(data.sheets || data.sheetStatus || ''),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req: Request) {
  const started = Date.now();

  try {
    const body = (await req.json()) as IncomingBody;
    const customerName = normalizeCustomerName(String(body.customerName || ''));
    const phoneRaw = String(body.phone || '').trim();
    const phoneE164 = normalizeUaePhone(phoneRaw);
    const phoneForSheet = formatPhoneForSheet(phoneRaw);

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

    const normalizedItems = normalizeOrderItems(items);
    const localOrderIds = generateLaraOrderIds(normalizedItems.length);

    const payload = {
      customerName,
      phone: phoneForSheet,
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

    const sheetPayload = {
      customerName,
      phone: phoneRaw,
      country: market.countryCode,
      currency: market.currency,
      area: payload.area,
      sourceUrl: payload.sourceUrl,
      items: payload.items,
      orderIds: localOrderIds,
    };

    // Sheets first — only path when successful (API also writes to sheet → duplicates).
    const sheets = await forwardOrderToSheetsWithRetry(sheetPayload, 2, 150);

    let orderIds = localOrderIds;
    let source: 'sheets' | 'api' | 'local' = 'local';
    let sheetSynced = sheets.ok;
    let sheetError: string | undefined;
    let sheetDetail: string | undefined;
    const sheetLatencyMs = sheets.latencyMs;

    if (sheets.ok) {
      orderIds = sheets.orderIds;
      source = 'sheets';
    } else {
      const api = await forwardToBackendApi(body, customerName, phoneE164, normalizedItems);
      if (api?.apiSheets === 'synced') {
        orderIds = api.orderIds;
        source = 'api';
        sheetSynced = true;
      } else if (api) {
        orderIds = api.orderIds;
        source = 'api';
        sheetError = sheets.reason;
        sheetDetail = sheets.detail;
      } else {
        sheetError = sheets.reason;
        sheetDetail = sheets.detail;
      }
    }

    if (!sheetSynced) {
      return Response.json(
        {
          error: 'sheet_sync_failed',
          message: 'ما قدرنا نسجّل الطلب في الشيت — جربي مرة ثانية',
          orderId: orderIds[0],
          sheetError,
          sheetDetail,
          totalMs: Date.now() - started,
        },
        { status: 503 },
      );
    }

    const local = await persistOrdersLocally(payload, expandOrderIds(orderIds, payload.items.length));
    await markOrdersSynced(local.orderIds);

    const orderTotal = normalizedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const eventId = `purchase_${orderIds[0]}`;

    void sendTiktokEvent(
      'Purchase',
      {
        orderId: orderIds[0],
        value: orderTotal,
        currency: market.currency,
        phone: phoneE164,
        sourceUrl: payload.sourceUrl,
        contentIds: normalizedItems.map((item) => item.sku).filter(Boolean),
        eventId,
      },
      {
        ip: clientIp(req),
        userAgent: req.headers.get('user-agent') ?? '',
      },
    );

    void sendSnapEvent(
      'Purchase',
      {
        orderId: orderIds[0],
        value: orderTotal,
        currency: market.currency,
        phone: phoneE164,
        sourceUrl: payload.sourceUrl,
        contentIds: normalizedItems.map((item) => item.sku).filter(Boolean),
        eventId,
      },
      {
        ip: clientIp(req),
        userAgent: req.headers.get('user-agent') ?? '',
      },
    );

    return Response.json({
      success: true,
      orderId: orderIds[0],
      orderIds,
      source,
      sheetSynced: true,
      sheetLatencyMs,
      totalMs: Date.now() - started,
      eventId,
    });
  } catch {
    return Response.json(
      { error: 'internal_error', message: 'صار خطأ — جربي مرة ثانية' },
      { status: 500 },
    );
  }
}
