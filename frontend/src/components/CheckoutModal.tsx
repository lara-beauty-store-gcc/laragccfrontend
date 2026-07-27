'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  HandCoins,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Truck,
  User,
  X,
} from 'lucide-react';
import { businessConfig } from '@/config/business';
import { useCart } from '@/lib/cart';
import { saveLastOrder, type LastOrder } from '@/lib/order-session';
import { formatPrice } from '@/lib/pricing';
import { isValidUaePhone } from '@/lib/phone';
import { trackEvent } from '@/lib/tracking';
import { Stars } from '@/components/Stars';
import { RoutineCrossSellPanel } from '@/components/cross-sell/RoutineCrossSellPanel';
import { getCrossSellProducts } from '@/lib/cross-sell';

const { market, cod } = businessConfig;

type CheckoutStep = 'form' | 'crosssell';

const trustChips = [
  { icon: HandCoins, text: 'دفع عند الاستلام' },
  { icon: Truck, text: `شحن ${market.countryName}` },
  { icon: ShieldCheck, text: 'ضمان 30 يوم' },
];

export function CheckoutModal() {
  const router = useRouter();
  const { items, isOpen, setOpen, clear, total } = useCart();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [emirate, setEmirate] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<CheckoutStep>('form');
  const [pendingOrder, setPendingOrder] = useState<LastOrder | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep('form');
      setPendingOrder(null);
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!phone.trim()) {
      setError('رقم الجوال مطلوب');
      return;
    }
    if (!isValidUaePhone(phone)) {
      setError('رقم جوال إماراتي غير صحيح — مثال: 501234567');
      return;
    }
    if (!name.trim()) {
      setError('الاسم الكامل مطلوب');
      return;
    }
    if (!emirate) {
      setError('اختاري الإمارة');
      return;
    }

    const area = address.trim() ? `${emirate} — ${address.trim()}` : emirate;

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      let orderId = `LARA-${Date.now()}`;

      if (apiUrl) {
        const res = await fetch(`${apiUrl}/api/v1/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: name.trim(),
            phone: phone.replace(/\D/g, ''),
            area,
            items: items.map((i) => ({
              productId: i.productId,
              sku: i.sku,
              name: i.name,
              bundleId: i.offerId,
              unitPriceAed: i.price,
              quantity: i.offerQuantity * i.qty,
            })),
            sourceUrl: typeof window !== 'undefined' ? window.location.href : '',
            eventId: `purchase_${Date.now()}`,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || data.error || 'order_failed');
        }
        orderId = data.orderNumber || data.orderId || orderId;
      }

      const savedOrder: LastOrder = {
        orderId,
        customerName: name.trim(),
        phone: `${market.phoneCountryCode}${phone.replace(/\D/g, '')}`,
        area,
        productSlug: items[0]?.slug,
        items: items.map((i) => ({
          sku: i.sku,
          name: i.offerLabel,
          qty: i.qty,
          price: i.price,
          offerId: i.offerId,
        })),
        total,
        currency: market.currency,
        paymentMethod: 'COD',
      };

      saveLastOrder(savedOrder);
      trackEvent('Lead', { value: total, currency: market.currency });

      clear();

      if (getCrossSellProducts(savedOrder).length > 0) {
        setPendingOrder(savedOrder);
        setStep('crosssell');
        return;
      }

      setOpen(false);
      router.push(`/thank-you?order=${orderId}`);
    } catch {
      setError('صار خطأ — حاولي مرة ثانية');
    } finally {
      setLoading(false);
    }
  }

  function finishToThankYou() {
    if (!pendingOrder) return;
    setOpen(false);
    router.push(`/thank-you?order=${pendingOrder.orderId}`);
  }

  const stepThreeActive = step === 'crosssell';

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        className="flex max-h-[94vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl"
        role="dialog"
        aria-labelledby="checkout-title"
      >
        {/* Header */}
        <div className="shrink-0 border-b border-border bg-surface-rose px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary/70">
                {step === 'crosssell' ? 'خطوة اختيارية' : 'خطوة أخيرة'}
              </p>
              <h2 id="checkout-title" className="font-arabic text-lg font-extrabold text-primary">
                {step === 'crosssell' ? 'كمّلي روتينك' : 'أكّدي طلبك — بدون دفع أونلاين'}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => (step === 'crosssell' ? finishToThankYou() : setOpen(false))}
              className="rounded-full bg-white p-2 text-muted shadow-sm hover:bg-surface"
              aria-label="إغلاق"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          {/* Progress */}
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold">
            <span className="flex items-center gap-1 text-primary">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] text-white">✓</span>
              العرض
            </span>
            <span className="h-px flex-1 bg-primary/30" />
            <span className="flex items-center gap-1 text-primary">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] text-white">✓</span>
              بياناتك
            </span>
            <span className="h-px flex-1 bg-border" />
            <span className={`flex items-center gap-1 ${stepThreeActive ? 'text-primary' : 'text-muted'}`}>
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] ${
                  stepThreeActive ? 'bg-primary text-white' : 'border border-border'
                }`}
              >
                3
              </span>
              روتينك
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === 'crosssell' && pendingOrder ? (
            <RoutineCrossSellPanel
              order={pendingOrder}
              variant="checkout"
              onSkip={finishToThankYou}
              skipLabel="لا شكراً — كملي لصفحة التأكيد"
            />
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">السلة فاضية</p>
          ) : (
            <>
              {/* Order summary */}
              <div className="rounded-2xl border border-border bg-surface p-4">
                <ul className="space-y-2.5">
                  {items.map((i) => (
                    <li key={`${i.productId}-${i.offerId}`} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-arabic text-sm font-bold text-foreground">{i.offerLabel}</p>
                        <p className="truncate text-[11px] text-muted">{i.name}</p>
                      </div>
                      <span className="shrink-0 tabular-nums font-arabic text-sm font-extrabold text-primary">
                        {formatPrice(i.price * i.qty)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs font-medium text-muted">المجموع — COD</span>
                  <span className="font-arabic text-xl font-extrabold tabular-nums text-primary">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Trust strip */}
              <div className="mt-3 flex flex-wrap gap-2">
                {trustChips.map((chip) => (
                  <span
                    key={chip.text}
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800"
                  >
                    <chip.icon className="h-3 w-3" aria-hidden />
                    {chip.text}
                  </span>
                ))}
              </div>

              {/* Form — phone first (COD best practice) */}
              <form id="cod-checkout-form" onSubmit={submit} className="mt-5 space-y-3">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Phone className="h-3.5 w-3.5 text-primary" aria-hidden />
                    رقم الجوال
                  </label>
                  <div className="flex gap-2" dir="ltr">
                    <span className="flex items-center rounded-xl border-2 border-border bg-surface px-3 text-sm font-semibold text-primary">
                      {market.phoneCountryCode}
                    </span>
                    <input
                      required
                      autoFocus
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex-1 rounded-xl border-2 border-border bg-white px-4 py-3.5 text-base text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                      placeholder={market.phoneExample}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-muted">نستخدمه للتأكيد والتوصيل فقط</p>
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <User className="h-3.5 w-3.5 text-primary" aria-hidden />
                    الاسم الكامل
                  </label>
                  <input
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border-2 border-border bg-white px-4 py-3.5 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="مثال: نورة العتيبي"
                  />
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden />
                    الإمارة
                  </label>
                  <select
                    required
                    value={emirate}
                    onChange={(e) => setEmirate(e.target.value)}
                    className="w-full rounded-xl border-2 border-border bg-white px-4 py-3.5 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="">اختاري إمارتك</option>
                    {market.emirates.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-muted">
                    العنوان التفصيلي <span className="font-normal">(اختياري — نأكده معك بالاتصال)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full resize-none rounded-xl border-2 border-border bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="الحي، الشارع، رقم المبنى..."
                  />
                </div>

                {error ? (
                  <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>
                ) : null}
              </form>

              {/* Social proof */}
              <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-surface-rose px-3 py-2.5">
                <Stars rating={4.9} count={186} />
                <span className="text-[10px] font-medium text-muted">· مشتريات مؤكدة</span>
                <Star className="h-3.5 w-3.5 fill-secondary text-secondary" aria-hidden />
              </div>
            </>
          )}
        </div>

        {/* Sticky CTA — form step only */}
        {items.length > 0 && step === 'form' ? (
          <div className="shrink-0 border-t border-border bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <p className="mb-2 text-center text-[10px] text-muted">{cod.paymentLabel}</p>
            <button
              type="submit"
              form="cod-checkout-form"
              disabled={loading}
              className="flex w-full flex-col items-center rounded-2xl bg-primary py-4 font-arabic text-white shadow-lg transition hover:bg-primary/90 active:scale-[0.99] disabled:opacity-60"
            >
              <span className="text-sm font-extrabold">
                {loading ? 'جاري الإرسال...' : 'أطلبي الآن — دفع عند الاستلام'}
              </span>
              <span className="mt-0.5 text-lg font-extrabold tabular-nums">{formatPrice(total)}</span>
            </button>
            <p className="mt-2 text-center text-[10px] leading-relaxed text-muted">
              ما في دفع أونلاين · تدفعين لما يوصلك الطلب · {cod.returnGuarantee.split('—')[0]}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
