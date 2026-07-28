'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
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
import { CartStep } from '@/components/cart/CartStep';
import { CartLineItem } from '@/components/cart/CartLineItem';
import { useCart } from '@/lib/cart';
import { saveLastOrder, type LastOrder } from '@/lib/order-session';
import { formatPrice } from '@/lib/pricing';
import {
  formatUaePhoneInput,
  isValidUaePhone,
  normalizeUaePhone,
  UAE_PHONE_DIGITS,
  UAE_PHONE_EXAMPLE,
  uaePhoneErrorMessage,
} from '@/lib/phone';
import { orderCurrency, submitOrder } from '@/lib/submit-order';
import { trackEvent } from '@/lib/tracking';
import { Stars } from '@/components/Stars';
import { RoutineCrossSellPanel } from '@/components/cross-sell/RoutineCrossSellPanel';
import { getCrossSellProducts } from '@/lib/cross-sell';

const { market, cod, support } = businessConfig;

const trustChips = [
  { icon: HandCoins, text: 'دفع عند الاستلام' },
  { icon: Truck, text: `شحن ${market.countryName}` },
  { icon: ShieldCheck, text: 'ضمان 30 يوم' },
];

export function CheckoutModal() {
  const router = useRouter();
  const {
    items,
    isOpen,
    view,
    setView,
    close,
    clear,
    total,
    count,
    remove,
    updateQty,
    openCheckout,
  } = useCart();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [emirate, setEmirate] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingOrder, setPendingOrder] = useState<LastOrder | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setView('cart');
      setPendingOrder(null);
      setError('');
    }
  }, [isOpen, setView]);

  useEffect(() => {
    if (isOpen && items.length === 0 && view !== 'crosssell') {
      setView('cart');
    }
  }, [isOpen, items.length, view, setView]);

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
      setError(uaePhoneErrorMessage(phone));
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
      const phoneE164 = normalizeUaePhone(phone);
      if (!phoneE164) {
        setError(uaePhoneErrorMessage(phone));
        return;
      }

      const { orderId, orderIds } = await submitOrder({
        customerName: name.trim(),
        phone,
        area,
        sourceUrl: typeof window !== 'undefined' ? window.location.href : '',
        items: items.map((i) => ({
          sku: i.sku,
          name: i.offerLabel,
          slug: i.slug,
          quantity: i.offerQuantity * i.qty,
          lineTotal: i.price * i.qty,
        })),
      });

      const savedOrder: LastOrder = {
        orderId,
        orderIds,
        customerName: name.trim(),
        phone: phoneE164,
        area,
        productSlug: items[0]?.slug,
        items: items.map((i) => ({
          sku: i.sku,
          name: i.offerLabel,
          slug: i.slug,
          qty: i.qty,
          price: i.price,
          offerId: i.offerId,
        })),
        total,
        currency: orderCurrency,
        paymentMethod: 'COD',
      };

      saveLastOrder(savedOrder);
      trackEvent('Lead', { value: total, currency: market.currency });

      clear();

      if (getCrossSellProducts(savedOrder).length > 0) {
        setPendingOrder(savedOrder);
        setView('crosssell');
        return;
      }

      close();
      router.push(`/thank-you?order=${orderId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('invalid_phone') || message.includes('جوال')) {
        setError(uaePhoneErrorMessage(phone));
      } else if (message.includes('orders_not_configured') || message.includes('السيرفر')) {
        setError(message);
      } else {
        setError('صار خطأ — حاولي مرة ثانية');
      }
    } finally {
      setLoading(false);
    }
  }

  function finishToThankYou() {
    if (!pendingOrder) return;
    close();
    router.push(`/thank-you?order=${pendingOrder.orderId}`);
  }

  const titles = {
    cart: { kicker: 'سلتك', title: count > 0 ? `${count} منتج في السلة` : 'سلتك' },
    checkout: { kicker: 'خطوة أخيرة', title: 'أكّدي طلبك — بدون دفع أونلاين' },
    crosssell: { kicker: 'خطوة اختيارية', title: 'كمّلي روتينك' },
  }[view];

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        className="flex max-h-[94vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl"
        role="dialog"
        aria-labelledby="checkout-title"
      >
        <div className="shrink-0 border-b border-border bg-surface-rose px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              {view === 'checkout' ? (
                <button
                  type="button"
                  onClick={() => setView('cart')}
                  className="mt-0.5 rounded-full bg-white p-2 text-muted shadow-sm hover:bg-surface"
                  aria-label="رجوع للسلة"
                >
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              ) : null}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary/70">
                  {titles.kicker}
                </p>
                <h2 id="checkout-title" className="font-arabic text-lg font-extrabold text-primary">
                  {titles.title}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => (view === 'crosssell' ? finishToThankYou() : close())}
              className="rounded-full bg-white p-2 text-muted shadow-sm hover:bg-surface"
              aria-label="إغلاق"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          {view !== 'cart' ? (
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-primary">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] text-white">
                  ✓
                </span>
                العرض
              </span>
              <span className="h-px flex-1 bg-primary/30" />
              <span className={`flex items-center gap-1 ${view === 'checkout' ? 'text-primary' : 'text-muted'}`}>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] ${
                    view === 'checkout' ? 'bg-primary text-white' : 'border border-border'
                  }`}
                >
                  2
                </span>
                بياناتك
              </span>
              <span className="h-px flex-1 bg-border" />
              <span className={`flex items-center gap-1 ${view === 'crosssell' ? 'text-primary' : 'text-muted'}`}>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] ${
                    view === 'crosssell' ? 'bg-primary text-white' : 'border border-border'
                  }`}
                >
                  3
                </span>
                روتينك
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {view === 'crosssell' && pendingOrder ? (
            <RoutineCrossSellPanel
              order={pendingOrder}
              variant="checkout"
              onOrderUpdate={(updated) => setPendingOrder(updated)}
              onSkip={finishToThankYou}
              skipLabel="لا شكراً — كمّلي للتأكيد"
            />
          ) : view === 'cart' ? (
            <CartStep
              items={items}
              onRemove={remove}
              onUpdateQty={updateQty}
              onClose={close}
            />
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">السلة فاضية</p>
          ) : (
            <>
              <div className="space-y-2.5">
                {items.map((line) => (
                  <CartLineItem
                    key={`${line.productId}-${line.offerId}`}
                    line={line}
                    compact
                    onRemove={() => remove(line.productId, line.offerId)}
                    onUpdateQty={(qty) => updateQty(line.productId, line.offerId, qty)}
                  />
                ))}
              </div>

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
                      autoComplete="tel-national"
                      value={phone}
                      onChange={(e) => setPhone(formatUaePhoneInput(e.target.value))}
                      className="flex-1 rounded-xl border-2 border-border bg-white px-4 py-3.5 text-base text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                      placeholder={market.phoneExample}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-muted">
                    <span>9 أرقام — مثال: {UAE_PHONE_EXAMPLE} أو 05{UAE_PHONE_EXAMPLE.slice(1)}</span>
                    <span
                      className={`font-mono tabular-nums ${
                        phone.length === UAE_PHONE_DIGITS ? 'font-bold text-primary' : ''
                      }`}
                    >
                      {phone.length}/{UAE_PHONE_DIGITS}
                    </span>
                  </div>
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
                    العنوان التفصيلي <span className="font-normal">(اختياري)</span>
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

              <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-surface-rose px-3 py-2.5">
                <Stars rating={4.9} count={186} />
                <span className="text-[10px] font-medium text-muted">· مشتريات مؤكدة</span>
                <Star className="h-3.5 w-3.5 fill-secondary text-secondary" aria-hidden />
              </div>
            </>
          )}
        </div>

        {view === 'cart' && items.length > 0 ? (
          <div className="shrink-0 border-t border-border bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-muted">المجموع</span>
              <span className="font-arabic text-2xl font-extrabold tabular-nums text-primary">
                {formatPrice(total)}
              </span>
            </div>
            <button
              type="button"
              onClick={openCheckout}
              className="flex w-full flex-col items-center rounded-2xl bg-primary py-4 font-arabic text-white shadow-lg transition hover:bg-primary/90 active:scale-[0.99]"
            >
              <span className="text-sm font-extrabold">أكّدي الطلب — دفع عند الاستلام</span>
              <span className="mt-0.5 text-lg font-extrabold tabular-nums">{formatPrice(total)}</span>
            </button>
            <p className="mt-2 text-center text-[10px] text-muted">{cod.paymentLabel}</p>
          </div>
        ) : null}

        {items.length > 0 && view === 'checkout' ? (
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
              ما في دفع أونلاين · تدفعين لما يوصلك الطلب
              <br />
              <a href={`mailto:${support.email}`} className="text-primary hover:underline">
                {support.email}
              </a>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
