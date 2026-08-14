'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { HandCoins, PhoneCall, ShieldCheck, ShoppingBag, X } from 'lucide-react';
import { CheckoutProductSummary } from '@/components/checkout/CheckoutProductSummary';
import { RoutineCrossSellPanel } from '@/components/cross-sell/RoutineCrossSellPanel';
import { Stars } from '@/components/Stars';
import { businessConfig } from '@/config/business';
import { getCrossSellProducts } from '@/lib/cross-sell';
import { useCart } from '@/lib/cart';
import { saveLastOrder, type LastOrder } from '@/lib/order-session';
import { formatPrice } from '@/lib/pricing';
import {
  formatUaePhoneInput,
  formatPhoneForDisplay,
  isValidUaePhone,
  normalizeUaePhone,
  uaePhoneErrorMessage,
} from '@/lib/phone';
import { getStoredLandingUrl } from '@/components/LandingUrlTracker';
import { orderCurrency, submitOrder } from '@/lib/submit-order';
import { trackEvent } from '@/lib/tracking';

const { market, cod, checkout } = businessConfig;

export function CheckoutModal() {
  const router = useRouter();
  const { items, isOpen, view, setView, close, clear, total, remove, updateQty, close: closeCart } = useCart();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingOrder, setPendingOrder] = useState<LastOrder | null>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      setView('checkout');
      setPendingOrder(null);
      setError('');
    }
  }, [isOpen, setView]);

  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    const { style } = document.body;
    const prev = {
      position: style.position,
      top: style.top,
      left: style.left,
      right: style.right,
      width: style.width,
      overflow: style.overflow,
    };

    style.position = 'fixed';
    style.top = `-${scrollY}px`;
    style.left = '0';
    style.right = '0';
    style.width = '100%';
    style.overflow = 'hidden';

    return () => {
      style.position = prev.position;
      style.top = prev.top;
      style.left = prev.left;
      style.right = prev.right;
      style.width = prev.width;
      style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current || loading) return;
    setError('');

    if (!name.trim()) {
      setError('الاسم الكامل مطلوب');
      return;
    }
    if (!phone.trim()) {
      setError('رقم الجوال مطلوب');
      return;
    }
    if (!isValidUaePhone(phone)) {
      setError(uaePhoneErrorMessage(phone));
      return;
    }

    setLoading(true);
    submittingRef.current = true;
    try {
      const phoneE164 = normalizeUaePhone(phone);
      if (!phoneE164) {
        setError(uaePhoneErrorMessage(phone));
        return;
      }
      const phoneDisplay = formatPhoneForDisplay(phone);

      const { orderId, orderIds } = await submitOrder({
        customerName: name.trim(),
        phone,
        sourceUrl: getStoredLandingUrl(),
        items: items.map((i) => ({
          sku: i.sku,
          name: i.name,
          productName: i.name,
          slug: i.slug,
          quantity: i.offerQuantity * i.qty,
          lineTotal: i.price * i.qty,
        })),
      });

      const savedOrder: LastOrder = {
        orderId,
        orderIds,
        customerName: name.trim(),
        phone: phoneDisplay,
        productSlug: items[0]?.slug,
        items: items.map((i) => ({
          sku: i.sku,
          name: i.name,
          slug: i.slug,
          qty: i.qty,
          price: i.price,
          offerId: i.offerId,
          offerLabel: i.offerLabel,
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
      } else if (message.includes('sheet_sync') || message.includes('الشيت')) {
        setError('ما قدرنا نسجّل الطلب — جربي مرة ثانية');
      } else {
        setError('صار خطأ — جربي مرة ثانية');
      }
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  function finishToThankYou() {
    if (!pendingOrder) return;
    close();
    router.push(`/thank-you?order=${pendingOrder.orderId}`);
  }

  const isCrosssell = view === 'crosssell' && pendingOrder;
  const isEmpty = items.length === 0 && !isCrosssell;

  return (
    <div className="checkout-modal-root fixed inset-0 z-[100] flex items-end justify-center overflow-hidden bg-black/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
      <div
        className="checkout-modal-panel flex h-[min(94dvh,100%)] max-h-[94dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[1.75rem] bg-[#FAFAF8] shadow-2xl sm:h-auto sm:max-h-[min(92dvh,100%)] sm:rounded-[1.75rem]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
      >
        <div className="shrink-0 px-5 pt-4">
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => (isCrosssell ? finishToThankYou() : close())}
              className="rounded-full p-2 text-muted transition hover:bg-white hover:text-foreground"
              aria-label="إغلاق"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        <div className="checkout-modal-scroll min-h-0 flex-1 overflow-y-auto overflow-x-clip px-5 pb-4">
          {isCrosssell ? (
            <>
              <h2 id="checkout-title" className="mb-4 text-center font-arabic text-lg font-extrabold text-primary">
                كمّلي روتينك
              </h2>
              <RoutineCrossSellPanel
                order={pendingOrder}
                variant="checkout"
                onOrderUpdate={(updated) => setPendingOrder(updated)}
                onSkip={finishToThankYou}
                skipLabel="لا شكراً — كمّلي للتأكيد"
              />
            </>
          ) : isEmpty ? (
            <div className="flex flex-col items-center py-12 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-rose">
                <ShoppingBag className="h-7 w-7 text-primary/70" aria-hidden />
              </span>
              <p className="mt-4 font-arabic text-lg font-extrabold text-foreground">سلتك فارغة</p>
              <Link
                href="/#products"
                onClick={closeCart}
                className="mt-6 inline-flex rounded-2xl bg-primary px-6 py-3 font-arabic text-sm font-bold text-white"
              >
                تصفّحي العلكات
              </Link>
            </div>
          ) : (
            <>
              <p className="text-center text-sm font-bold text-red-600">{checkout.urgencyBanner}</p>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-muted">
                <Stars rating={checkout.rating} />
                <span className="font-bold text-foreground">{checkout.rating}</span>
                <span>({checkout.ratingCount} تقييم · مؤكدة)</span>
                <span>·</span>
                <span className="font-semibold text-foreground">{checkout.socialProof}</span>
              </div>

              <div className="mt-5">
                <CheckoutProductSummary
                  items={items}
                  onUpdateQty={updateQty}
                  onRemove={remove}
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-white px-4 py-3">
                <div>
                  <p className="text-xs font-bold text-muted">{checkout.totalLabel}</p>
                  <p className="font-arabic text-2xl font-extrabold tabular-nums text-primary">
                    {formatPrice(total)}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold leading-snug text-emerald-800">
                  {checkout.codBadge}
                </span>
              </div>

              <form id="cod-checkout-form" onSubmit={submit} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="checkout-name" className="mb-2 block text-sm font-bold text-foreground">
                    {checkout.nameLabel}
                  </label>
                  <input
                    id="checkout-name"
                    required
                    autoFocus
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-4 py-3.5 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder={checkout.namePlaceholder}
                  />
                </div>

                <div>
                  <label htmlFor="checkout-phone" className="mb-2 block text-sm font-bold text-foreground">
                    {checkout.phoneLabel}
                  </label>
                  <input
                    id="checkout-phone"
                    required
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(formatUaePhoneInput(e.target.value))}
                    className="w-full rounded-xl border border-border bg-white px-4 py-3.5 text-base text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder={checkout.phonePlaceholder}
                  />
                  <p className="mt-2 text-[11px] leading-relaxed text-muted">{checkout.phoneHint}</p>
                </div>

                {error ? (
                  <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>
                ) : null}
              </form>

              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-white px-2 py-3">
                  <HandCoins className="mx-auto h-4 w-4 text-primary" aria-hidden />
                  <p className="mt-1.5 text-[10px] font-bold leading-snug text-foreground">
                    {checkout.trustNoPay}
                  </p>
                </div>
                <div className="rounded-xl bg-white px-2 py-3">
                  <PhoneCall className="mx-auto h-4 w-4 text-primary" aria-hidden />
                  <p className="mt-1.5 text-[10px] font-bold leading-snug text-foreground">
                    {checkout.trustCallConfirm}
                  </p>
                </div>
                <div className="rounded-xl bg-white px-2 py-3">
                  <ShieldCheck className="mx-auto h-4 w-4 text-primary" aria-hidden />
                  <p className="mt-1.5 text-[10px] font-bold leading-snug text-foreground">
                    {checkout.trustRefuseFree}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-center text-[10px] leading-relaxed text-muted">{checkout.termsNote}</p>
            </>
          )}
        </div>

        {!isEmpty && !isCrosssell ? (
          <div className="shrink-0 border-t border-border/60 bg-[#FAFAF8] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button
              type="submit"
              form="cod-checkout-form"
              disabled={loading}
              className="w-full rounded-2xl bg-primary py-4 font-arabic text-base font-extrabold text-white shadow-lg transition hover:bg-primary/90 active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? 'جاري الإرسال...' : checkout.submitLabel}
            </button>
            <p className="mt-2 text-center text-[10px] text-muted">{cod.paymentLabel}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
