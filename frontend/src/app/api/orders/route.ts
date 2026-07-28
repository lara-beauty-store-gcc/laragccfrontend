import { businessConfig } from '@/config/business';
import { normalizeUaePhone } from '@/lib/phone';

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

async function forwardToLegacyApi(body: IncomingBody, phoneDigits: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  try {
    const res = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: body.customerName,
        phone: phoneDigits,
        area: body.area,
        country: market.countryCode,
        currency: market.currency,
        items: (body.items || []).map((item) => ({
          sku: item.sku,
          name: item.name,
          productId: item.slug,
          quantity: item.quantity,
          unitPriceAed: item.lineTotal,
        })),
        sourceUrl: body.sourceUrl || siteBaseUrl(),
        eventId: `purchase_${Date.now()}`,
      }),
    });
    if (!res.ok) return null;
    return res.json().catch(() => null);
  } catch {
    return null;
  }
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
        { error: 'invalid_phone', message: 'رقم جوال إماراتي غير صحيح — مثال: 501234567' },
        { status: 400 },
      );
    }

    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      return Response.json({ error: 'empty_cart', message: 'السلة فاضية' }, { status: 400 });
    }

    const normalizedItems = items.map((item) => {
      const slug = String(item.slug || '').trim();
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const lineTotal = Number(item.lineTotal) || 0;

      return {
        product: String(item.name || '').trim(),
        url: slug ? `${siteBaseUrl()}/products/${slug}` : siteBaseUrl(),
        sku: String(item.sku || '').trim(),
        quantity,
        totalPrice: lineTotal,
      };
    });

    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    const webhookSecret = process.env.SHEETS_WEBHOOK_SECRET || '';

    if (!webhookUrl) {
      const legacy = await forwardToLegacyApi(body, phoneE164.replace(/\D/g, ''));
      if (legacy?.orderId || legacy?.orderNumber) {
        const orderId = String(legacy.orderNumber || legacy.orderId);
        return Response.json({ success: true, orderId, orderIds: [orderId] });
      }

      return Response.json(
        {
          error: 'orders_not_configured',
          message: 'خدمة الطلبات غير مفعّلة — تواصل مع الدعم',
        },
        { status: 503 },
      );
    }

    const sheetsRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: webhookSecret,
        date: new Date().toISOString(),
        customer_name: customerName,
        phone: phoneE164,
        country: market.countryCode,
        currency: market.currency,
        area: body.area || '',
        items: normalizedItems,
        source_url: body.sourceUrl || siteBaseUrl(),
      }),
    });

    const sheetsData = await sheetsRes.json().catch(() => ({}));

    if (!sheetsRes.ok || sheetsData.ok === false) {
      return Response.json(
        {
          error: 'sheet_sync_failed',
          message: 'صار خطأ في حفظ الطلب — حاولي مرة ثانية',
        },
        { status: 502 },
      );
    }

    const orderIds: string[] = Array.isArray(sheetsData.order_ids)
      ? sheetsData.order_ids.map(String)
      : sheetsData.order_id
        ? [String(sheetsData.order_id)]
        : [];

    if (orderIds.length === 0) {
      return Response.json(
        { error: 'sheet_sync_failed', message: 'صار خطأ في حفظ الطلب — حاولي مرة ثانية' },
        { status: 502 },
      );
    }

    // Best-effort CAPI relay — legacy API may still reject UAE phones.
    void forwardToLegacyApi(body, phoneE164.replace(/\D/g, ''));

    return Response.json({
      success: true,
      orderId: orderIds[0],
      orderIds,
    });
  } catch {
    return Response.json(
      { error: 'internal_error', message: 'صار خطأ — حاولي مرة ثانية' },
      { status: 500 },
    );
  }
}
