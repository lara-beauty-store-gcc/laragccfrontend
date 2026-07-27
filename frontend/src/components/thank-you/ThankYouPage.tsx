'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  BellRing,
  CircleCheckBig,
  HandCoins,
  MessageCircle,
  Package,
  Phone,
  ShieldCheck,
  Smartphone,
  Truck,
} from 'lucide-react';
import { businessConfig } from '@/config/business';
import { buildWhatsAppConfirmUrl, getLastOrder, type LastOrder } from '@/lib/order-session';
import { formatPrice } from '@/lib/pricing';
import { trackPurchase } from '@/lib/tracking';
import { RoutineCrossSell } from '@/components/thank-you/RoutineCrossSell';

const { brand, cod, market, support } = businessConfig;

function OrderSummary({ order }: { order: LastOrder }) {
  return (
    <div className="rounded-3xl border border-border bg-white p-5 shadow-card sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" aria-hidden />
          <p className="font-arabic text-sm font-extrabold text-foreground">ملخص طلبك</p>
        </div>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-800">
          بانتظار التأكيد
        </span>
      </div>

      <ul className="space-y-3 border-b border-border pb-4">
        {order.items.map((item) => (
          <li key={`${item.sku}-${item.offerId ?? item.name}`} className="flex justify-between gap-3 text-sm">
            <span className="font-arabic text-foreground">
              {item.name} <span className="text-muted">× {item.qty}</span>
            </span>
            <span className="shrink-0 font-semibold text-primary">{formatPrice(item.price * item.qty)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-2 text-sm">
        {order.area ? (
          <p className="flex justify-between gap-2 text-muted">
            <span>المنطقة</span>
            <span className="font-arabic text-foreground">{order.area}</span>
          </p>
        ) : null}
        <p className="flex justify-between gap-2 text-muted" dir="ltr">
          <span>الجوال</span>
          <span className="font-mono text-foreground">{order.phone}</span>
        </p>
        <p className="flex justify-between gap-2 border-t border-border pt-3 font-arabic text-base font-extrabold text-primary">
          <span>المجموع (COD)</span>
          <span>{formatPrice(order.total)}</span>
        </p>
      </div>
    </div>
  );
}

function NextSteps() {
  const steps = [
    {
      icon: MessageCircle,
      title: 'تأكيد سريع عبر واتساب',
      body: `أرسلي رسالة تأكيد الآن — أو انتظري اتصالنا ${cod.confirmationWindow}.`,
      highlight: true,
    },
    {
      icon: Phone,
      title: 'خلّي جوالك قريب',
      body: 'نحتاج نأكد العنوان والكمية. المكالمات الفائتة تؤخر الشحن.',
    },
    {
      icon: Truck,
      title: cod.deliveryPromise,
      body: cod.cashReminder,
    },
  ];

  return (
    <div className="rounded-3xl border border-border bg-surface-rose p-5 sm:p-6">
      <p className="font-arabic text-sm font-extrabold text-foreground">وش يصير الحين؟</p>
      <ol className="mt-4 space-y-4">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                step.highlight ? 'bg-[#25D366] text-white' : 'bg-primary text-white'
              }`}
            >
              <step.icon className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="font-arabic text-sm font-bold text-foreground">
                <span className="ml-1 text-secondary">{i + 1}.</span> {step.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function TrustRow() {
  const items = [
    { icon: ShieldCheck, label: 'ضمان 30 يوم' },
    { icon: HandCoins, label: 'دفع عند الاستلام' },
    { icon: BadgeCheck, label: 'حلال 100%' },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-border bg-white px-2 py-3 text-center shadow-sm"
        >
          <item.icon className="mx-auto h-4 w-4 text-primary" aria-hidden />
          <p className="mt-1.5 font-arabic text-[10px] font-bold leading-tight text-foreground sm:text-[11px]">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function ThankYouInner() {
  const params = useSearchParams();
  const orderIdParam = params.get('order') ?? '';
  const [order, setOrder] = useState<LastOrder | null>(null);

  useEffect(() => {
    const stored = getLastOrder();
    if (stored) {
      setOrder(stored);
      trackPurchase({
        orderId: stored.orderId,
        value: stored.total,
        currency: stored.currency,
        items: stored.items.map((i) => ({ sku: i.sku, qty: i.qty, price: i.price })),
      });
    }
  }, []);

  const orderId = order?.orderId || orderIdParam;
  const whatsappUrl = useMemo(() => {
    if (!order) return null;
    return buildWhatsAppConfirmUrl(order, support.whatsappNumber);
  }, [order]);

  return (
    <section className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-12">
      {/* Success header */}
      <div className="text-center">
        <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-200/60" />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
            <CircleCheckBig className="h-10 w-10" strokeWidth={2.5} aria-hidden />
          </span>
        </div>
        <h1 className="font-arabic text-2xl font-extrabold text-primary sm:text-3xl">تم استلام طلبك!</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          شكراً {order?.customerName ? `${order.customerName.split(' ')[0]} ` : ''}
          — خطوة واحدة بسيطة وتأكدين طلبك مع {brand.nameLocal}.
        </p>
        {orderId ? (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs text-muted shadow-sm">
            رقم الطلب:
            <span className="font-mono font-bold text-primary">{orderId}</span>
          </p>
        ) : null}
      </div>

      {/* Phone alert — top stores keep this prominent */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
        <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
        <div>
          <p className="font-arabic text-sm font-bold text-amber-900">خلّي جوالك مفتوح</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-800">
            {cod.confirmationPromise}. الطلبات اللي ما تتأكد خلال 24 ساعة ممكن تُلغى تلقائياً.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {order ? <OrderSummary order={order} /> : null}
        <NextSteps />
        <TrustRow />
      </div>

      {/* Primary CTA — WhatsApp confirmation first */}
      {whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-6 py-4 font-arabic text-sm font-bold text-white shadow-lg transition hover:bg-[#1ebe5d] active:scale-[0.99]"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          أكّدي طلبك عبر واتساب الآن
        </a>
      ) : null}

      {/* Cross-sell: other gummies — after confirm, optional, no fake total */}
      {order ? <div className="mt-6"><RoutineCrossSell order={order} /></div> : null}

      <p className="mt-3 text-center text-[11px] text-muted">
        أو اتصلي بنا:{' '}
        <a href={`tel:${support.phoneDisplay.replace(/\s/g, '')}`} className="font-semibold text-primary">
          {support.phoneDisplay}
        </a>{' '}
        — {support.hours}
      </p>

      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted">
        <Smartphone className="h-3.5 w-3.5" aria-hidden />
        <span>الدفع عند الاستلام فقط — {market.countryName}</span>
      </div>

      <Link
        href="/"
        className="mt-6 block w-full rounded-2xl border border-border bg-white py-3 text-center font-arabic text-sm font-semibold text-primary transition hover:bg-surface"
      >
        رجوع للرئيسية
      </Link>

      <p className="mt-4 text-center text-[10px] leading-relaxed text-muted">{cod.returnGuarantee}</p>
    </section>
  );
}

export function ThankYouPageContent() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted">جاري التحميل...</p>}>
      <ThankYouInner />
    </Suspense>
  );
}
