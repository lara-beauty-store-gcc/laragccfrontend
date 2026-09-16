import { businessConfig } from '@/config/business';
import { apiBaseUrl } from '@/lib/runtime-env';
import { normalizeCustomerName, normalizeUaePhone, uaePhoneErrorMessage } from '@/lib/phone';

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
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://larabeauty.store').replace(/\/$/, '');
}

export async function POST(req: Request) {
  const apiUrl = apiBaseUrl();
  if (!apiUrl) {
    return Response.json(
      { error: 'api_unavailable', message: 'خدمة الدفع غير متاحة حالياً — جرّبي لاحقاً أو اختاري الدفع عند الاستلام' },
      { status: 503 },
    );
  }

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

    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      return Response.json({ error: 'empty_cart', message: 'السلة فارغة' }, { status: 400 });
    }

    const localDigits = phoneE164.replace(/\D/g, '').replace(/^971/, '');
    const base = siteBaseUrl();
    const successUrl = `${base}/thank-you?payment=card&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${base}/?checkout=cancelled`;

    const normalizedItems = items.map((item) => {
      const quantity = Number(item.quantity) || 1;
      const lineTotal = Number(item.lineTotal) || 0;
      return {
        sku: String(item.sku || ''),
        name: String(item.name || item.productName || ''),
        productName: String(item.productName || item.name || ''),
        slug: String(item.slug || ''),
        quantity,
        lineTotalAed: lineTotal,
        unitPriceAed: quantity > 0 ? lineTotal / quantity : lineTotal,
      };
    });

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

      if (!res.ok) {
        const message =
          data.message ||
          (res.status === 404
            ? 'خدمة الدفع بالبطاقة قيد التفعيل — جرّبي الدفع عند الاستلام أو حاولي لاحقاً'
            : 'تعذّر إنشاء جلسة الدفع — جرّبي مرة ثانية');
        return Response.json({ error: data.error || 'stripe_checkout_failed', message }, { status: res.status });
      }

      const checkoutUrl = String(data.checkoutUrl || data.url || '');
      if (!checkoutUrl) {
        return Response.json(
          { error: 'stripe_checkout_missing_url', message: 'تعذّر تحويلك للدفع — جرّبي مرة ثانية' },
          { status: 502 },
        );
      }

      return Response.json({
        success: true,
        checkoutUrl,
        sessionId: data.sessionId || data.id,
        orderId: data.orderId || data.orderNumber,
      });
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    return Response.json(
      {
        error: isTimeout ? 'timeout' : 'internal_error',
        message: isTimeout
          ? 'انتهت مهلة الاتصال — تحققي من الإنترنت وجربي مرة ثانية'
          : 'صار خطأ — جرّبي مرة ثانية',
      },
      { status: isTimeout ? 504 : 500 },
    );
  }
}
