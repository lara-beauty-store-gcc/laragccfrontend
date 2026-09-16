import { businessConfig } from '@/config/business';
import {
  createStripePaymentIntent,
  updateStripePaymentIntent,
} from '@/lib/stripe-payment-intent';
import { normalizeCustomerName, normalizeUaePhone } from '@/lib/phone';
import { runtimeEnv } from '@/lib/runtime-env';
import { stripeConfigured } from '@/lib/stripe-server';

export const dynamic = 'force-dynamic';

type IncomingBody = {
  customerName?: string;
  phone?: string;
  area?: string;
  paymentIntentId?: string;
  items?: Array<{
    sku?: string;
    name?: string;
    productName?: string;
    slug?: string;
    quantity?: number;
    lineTotal?: number;
  }>;
  sourceUrl?: string;
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

export async function POST(req: Request) {
  try {
    if (!stripeConfigured()) {
      return Response.json(
        {
          error: 'stripe_not_configured',
          message: 'الدفع بالبطاقة غير مفعّل حالياً — اختاري الدفع عند الاستلام',
        },
        { status: 503 },
      );
    }

    const body = (await req.json()) as IncomingBody;
    const normalizedItems = normalizeItems(body.items);

    if (normalizedItems.length === 0) {
      return Response.json({ error: 'empty_cart', message: 'السلة فارغة' }, { status: 400 });
    }

    const customerName = body.customerName ? normalizeCustomerName(String(body.customerName)) : '';
    const phoneRaw = String(body.phone || '').trim();
    const phoneE164 = phoneRaw ? normalizeUaePhone(phoneRaw) : null;

    if (phoneRaw && !phoneE164) {
      return Response.json(
        { error: 'invalid_phone', message: 'رقم الجوال غير صحيح — تأكدي من الرقم' },
        { status: 400 },
      );
    }

    const base = siteBaseUrl();
    const input = {
      customerName,
      phone: phoneRaw,
      area: body.area || '',
      items: normalizedItems,
      sourceUrl: body.sourceUrl || base,
    };

    const paymentIntentId = String(body.paymentIntentId || '').trim();
    const result = paymentIntentId
      ? await updateStripePaymentIntent(paymentIntentId, input)
      : await createStripePaymentIntent(input);

    return Response.json({ success: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    return Response.json(
      {
        error: 'stripe_payment_intent_failed',
        message:
          message === 'stripe_not_configured'
            ? 'الدفع بالبطاقة غير مفعّل حالياً — اختاري الدفع عند الاستلام'
            : 'تعذّر تجهيز الدفع — جرّبي مرة ثانية',
      },
      { status: 500 },
    );
  }
}
