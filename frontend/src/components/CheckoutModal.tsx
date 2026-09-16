'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ShoppingBag, X } from 'lucide-react';
import { CheckoutCTA } from '@/components/checkout/CheckoutCTA';
import { CheckoutError } from '@/components/checkout/CheckoutError';
import { CheckoutFormFields } from '@/components/checkout/CheckoutFormFields';
import { CheckoutTrustFooter } from '@/components/checkout/CheckoutTrustFooter';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import { RoutineCrossSellPanel } from '@/components/cross-sell/RoutineCrossSellPanel';
import { businessConfig } from '@/config/business';
import { getCrossSellProducts } from '@/lib/cross-sell';
import { useCart } from '@/lib/cart';
import {
  calculateCheckoutTotals,
  type PaymentMethod,
} from '@/lib/checkout-pricing';
import { createStripeCheckout } from '@/lib/create-stripe-checkout';
import { saveLastOrder, type LastOrder } from '@/lib/order-session';
import {
  formatUaePhoneInput,
  formatPhoneForDisplay,
  isValidUaePhone,
  normalizeUaePhone,
  uaePhoneErrorMessage,
} from '@/lib/phone';
import { getStoredLandingUrl } from '@/components/LandingUrlTracker';
import { orderCurrency, submitOrder } from '@/lib/submit-order';
import { defaultPaymentMethod, isCardPaymentEnabled } from '@/lib/payment-features';
import { trackAddPaymentInfo, trackInitiateCheckout, trackEvent } from '@/lib/tracking';

const { market, checkout } = businessConfig;
const FORM_ID = 'checkout-form';
const cardPaymentEnabled = isCardPaymentEnabled();

export function CheckoutModal() {
  const router = useRouter();
  const { items, isOpen, view, setView, close, clear, total, close: closeCart } = useCart();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(defaultPaymentMethod());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingOrder, setPendingOrder] = useState<LastOrder | null>(null);
  const submittingRef = useRef(false);

  const effectivePaymentMethod: PaymentMethod = cardPaymentEnabled ? paymentMethod : 'cod';

  const totals = useMemo(
    () => calculateCheckoutTotals(total, effectivePaymentMethod),
    [total, effectivePaymentMethod],
  );

  useEffect(() => {
    if (!isOpen) {
      setView('checkout');
      setPendingOrder(null);
      setError('');
    }
  }, [isOpen, setView]);

  const checkoutTrackedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      checkoutTrackedRef.current = false;
      return;
    }
    if (items.length === 0 || checkoutTrackedRef.current) return;
    checkoutTrackedRef.current = true;
    trackInitiateCheckout({
      value: totals.total,
      currency: market.currency,
      items: items.map((i) => ({ sku: i.sku, qty: i.qty, price: i.price })),
    });
  }, [isOpen, items.length, totals.total]);

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

  function validateForm(): string | null {
    if (!name.trim()) return 'الاسم الكامل مطلوب';
    if (!phone.trim()) return 'رقم الهاتف مطلوب';
    if (!isValidUaePhone(phone)) return uaePhoneErrorMessage(phone);

    if (effectivePaymentMethod === 'card') {
      if (!area.trim()) return 'المنطقة / الإمارة مطلوبة للتوصيل';
      if (!address.trim()) return 'العنوان / تفاصيل التوصيل مطلوبة';
    }

    return null;
  }

  function buildOrderLines() {
    return items.map((i) => ({
      sku: i.sku,
      name: i.name,
      productName: i.name,
      slug: i.slug,
      quantity: i.offerQuantity * i.qty,
      lineTotal: i.price * i.qty,
    }));
  }

  function buildAreaNotes() {
    const emirate = area.trim();
    const details = address.trim();
    if (emirate && details) return `${emirate} — ${details}`;
    return emirate || details;
  }

  async function submitCod(phoneE164: string, phoneDisplay: string) {
    const { orderId, orderIds } = await submitOrder({
      customerName: name.trim(),
      phone,
      area: buildAreaNotes(),
      paymentMethod: 'COD',
      deliveryFeeAed: totals.deliveryFee,
      sourceUrl: getStoredLandingUrl(),
      items: buildOrderLines(),
    });

    const savedOrder: LastOrder = {
      orderId,
      orderIds,
      customerName: name.trim(),
      phone: phoneDisplay,
      area: buildAreaNotes() || undefined,
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
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      total: totals.total,
      currency: orderCurrency,
      paymentMethod: 'COD',
    };

    saveLastOrder(savedOrder);
    trackEvent('Lead', { value: totals.total, currency: market.currency });
    clear();

    if (getCrossSellProducts(savedOrder).length > 0) {
      setPendingOrder(savedOrder);
      setView('crosssell');
      return;
    }

    close();
    router.push(`/thank-you?order=${orderId}`);
  }

  async function submitCard() {
    trackAddPaymentInfo({
      value: totals.total,
      currency: market.currency,
      paymentMethod: 'card',
    });

    const result = await createStripeCheckout({
      customerName: name.trim(),
      phone,
      area: buildAreaNotes(),
      paymentMethod: 'card',
      sourceUrl: getStoredLandingUrl(),
      items: buildOrderLines(),
    });

    window.location.href = result.checkoutUrl;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current || loading) return;
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const phoneE164 = normalizeUaePhone(phone);
    if (!phoneE164) {
      setError(uaePhoneErrorMessage(phone));
      return;
    }
    const phoneDisplay = formatPhoneForDisplay(phone);

    setLoading(true);
    submittingRef.current = true;

    try {
      if (effectivePaymentMethod === 'cod') {
        await submitCod(phoneE164, phoneDisplay);
        return;
      }

      await submitCard();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('invalid_phone') || message.includes('جوال')) {
        setError(uaePhoneErrorMessage(phone));
      } else if (message.includes('sheet_sync') || message.includes('الشيت')) {
        setError('ما قدرنا نسجّل الطلب — جربي مرة ثانية');
      } else if (message.includes('stripe') || message.includes('الدفع')) {
        setError(
          message.includes('—')
            ? message
            : 'تعذّر إنشاء جلسة الدفع — تحققي من البيانات وجربي مرة ثانية',
        );
      } else if (message.includes('timeout') || message.includes('مهلة')) {
        setError('انتهت مهلة الاتصال — تحققي من الإنترنت وجربي مرة ثانية');
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

  if (!isOpen) return null;

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
        <div className="shrink-0 border-b border-border/50 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => (isCrosssell ? finishToThankYou() : close())}
              className="rounded-full p-2 text-muted transition hover:bg-surface hover:text-foreground"
              aria-label="رجوع"
            >
              <ArrowRight className="h-5 w-5" aria-hidden />
            </button>
            <div className="min-w-0 flex-1 text-center">
              <h2 id="checkout-title" className="font-arabic text-lg font-extrabold text-foreground">
                {isCrosssell ? 'كمّلي روتينك' : 'إتمام الطلب'}
              </h2>
              {!isCrosssell && !isEmpty ? (
                <p className="mt-0.5 text-xs text-muted">{checkout.pageSubtitle}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => (isCrosssell ? finishToThankYou() : close())}
              className="rounded-full p-2 text-muted transition hover:bg-surface hover:text-foreground"
              aria-label="إغلاق"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        <div className="checkout-modal-scroll min-h-0 flex-1 overflow-y-auto overflow-x-clip px-5 py-4">
          {isCrosssell ? (
            <RoutineCrossSellPanel
              order={pendingOrder}
              variant="checkout"
              onOrderUpdate={(updated) => setPendingOrder(updated)}
              onSkip={finishToThankYou}
              skipLabel="لا شكراً — كمّلي للتأكيد"
            />
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
            <div className="space-y-4">
              {cardPaymentEnabled ? (
                <PaymentMethodSelector
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  disabled={loading}
                />
              ) : null}

              <OrderSummary items={items} totals={totals} />

              <form id={FORM_ID} onSubmit={submit} className="space-y-4">
                <CheckoutFormFields
                  method={effectivePaymentMethod}
                  name={name}
                  phone={phone}
                  area={area}
                  address={address}
                  onNameChange={setName}
                  onPhoneChange={setPhone}
                  onAreaChange={setArea}
                  onAddressChange={setAddress}
                />

                {error ? <CheckoutError message={error} /> : null}
              </form>

              <CheckoutTrustFooter />

              <p className="text-center text-[10px] leading-relaxed text-muted">{checkout.termsNote}</p>
            </div>
          )}
        </div>

        {!isEmpty && !isCrosssell ? (
          <div className="shrink-0 border-t border-border/60 bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <CheckoutCTA
              method={effectivePaymentMethod}
              total={totals.total}
              loading={loading}
              formId={FORM_ID}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
