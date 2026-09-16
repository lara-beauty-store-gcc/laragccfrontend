import { businessConfig } from '@/config/business';
import { createStripeCheckoutSession } from '@/lib/stripe-checkout-session';
import { normalizeCustomerName, normalizeUaePhone, uaePhoneErrorMessage } from '@/lib/phone';
import { apiBaseUrl, runtimeEnv } from '@/lib/runtime-env';
import { stripeConfigured } from '@/lib/stripe-server';

export const dynamic = 'force-dynamic';

const API_TIMEOUT_MS = 15000;

type IncomingBody = {
  customerName?: string;
  phone?: string;
  area?: string;
  items?: Array<{
    sku?: string;
    name?: string;
    productName?: string;
    slug?: string;
    quantity?: number;
    lineTotal?: number;
  }>;
  sourceUrl?: string;
  paymentMethod?: string;
};

const { market } = businessConfig;

function siteBaseUrl() {
  return runtimeEnv('NEXT_PUBLIC_SITE_URL', 'https://larabeauty.store').replace(/\/$/, '');
}

function normalizeItems(items: IncomingBody['items']) {
  return (Array.isArray(items) ? items : []).map((item) => {
    const quantity = Number(item.quantity) || 1;
    const lineTotal = Number(item.lineTotal) || 0;
    return {
      sku: String(item.sku || ''),
      name: String(item.name || item.productName || ''),
      slug: String(item.slug || ''),
      quantity,
      lineTotalAed: lineTotal,
    };
  });
}

async function forwardToBackendApi(body: IncomingBody, normalizedItems: ReturnType<typeof normalizeItems>) {
  const apiUrl = apiBaseUrl();
  if (!apiUrl) return null;

  const customerName = normalizeCustomerName(String(body.customerName || ''));
  const phoneRaw = String(body.phone || '').trim();
  const phoneE164 = normalizeUaePhone(phoneRaw);
  if (!phoneE164) return null;

  const localDigits = phoneE164.replace(/\D/g, '').replace(/^971/, '');
  const base = siteBaseUrl();
  const successUrl = `${base}/thank-you?payment=card&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${base}/?checkout=cancelled`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const res = await fetch(`${apiUrl.replace(/\/$/, '')}/api/v1/stripe/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        customerName,
        customer_name: customerName,
        full_name: customerName,
        phone: localDigits,
        area: body.area || '',
        country: market.countryCode,
        currency: market.currency,
        paymentMethod: 'card',
        items: normalizedItems,
        sourceUrl: body.sourceUrl || base,
        successUrl,
        cancelUrl,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return null;

    const checkoutUrl = String(data.checkoutUrl || data.url || '');
    if (!checkoutUrl) return null;

    return {
      checkoutUrl,
      sessionId: data.sessionId || data.id,
      orderId: data.orderId || data.orderNumber,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as IncomingBody;
    const customerName = normalizeCustomerName(String(body.customerName || ''));
    const phoneRaw = String(body.phone || '').trim();
    const phoneE164 = normalizeUaePhone(phoneRaw);

    if (!customerName || customerName.length < 2) {
      return Response.json({ error: 'invalid_name', message: 'الاسم الكامل مطلوب' }, { status: 400 });
    }

    if (!phoneE164) {
      return Response.json(
        { error: 'invalid_phone', message: uaePhoneErrorMessage(phoneRaw) },
        { status: 400 },
      );
    }

    const normalizedItems = normalizeItems(body.items);
    if (normalizedItems.length === 0) {
      return Response.json({ error: 'empty_cart', message: 'السلة فارغة' }, { status: 400 });
    }

    const base = siteBaseUrl();
    const successUrl = `${base}/thank-you?payment=card&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${base}/?checkout=cancelled`;

    if (stripeConfigured()) {
      const result = await createStripeCheckoutSession({
        customerName,
        phone: phoneRaw,
        area: body.area || '',
        items: normalizedItems,
        sourceUrl: body.sourceUrl || base,
        successUrl,
        cancelUrl,
      });

      return Response.json({ success: true, ...result });
    }

    const backend = await forwardToBackendApi(body, normalizedItems);
    if (backend) {
      return Response.json({ success: true, ...backend });
    }

    return Response.json(
      {
        error: 'stripe_not_configured',
        message: 'الدفع بالبطاقة غير مفعّل حالياً — اختاري الدفع عند الاستلام',
      },
      { status: 503 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    return Response.json(
      {
        error: 'stripe_checkout_failed',
        message:
          message === 'stripe_not_configured'
            ? 'الدفع بالبطاقة غير مفعّل حالياً — اختاري الدفع عند الاستلام'
            : 'تعذّر إنشاء جلسة الدفع — جرّبي مرة ثانية',
      },
      { status: 500 },
    );
  }
}
