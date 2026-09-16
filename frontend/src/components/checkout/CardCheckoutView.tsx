'use client';

import { useMemo, useState } from 'react';
import { CheckoutCTA } from '@/components/checkout/CheckoutCTA';
import { CheckoutError } from '@/components/checkout/CheckoutError';
import { CheckoutShell } from '@/components/checkout/CheckoutShell';
import { CheckoutSidebar } from '@/components/checkout/CheckoutSidebar';
import {
  CardPaymentElement,
  useCardPaymentSubmit,
} from '@/components/checkout/CardPaymentElement';
import { CardStripeProvider, useCardStripe } from '@/components/checkout/CardStripeProvider';
import { PaymentLogos } from '@/components/checkout/PaymentLogos';
import { getStoredLandingUrl } from '@/components/LandingUrlTracker';
import { businessConfig } from '@/config/business';
import { useCart } from '@/lib/cart';
import { calculateCheckoutTotals } from '@/lib/checkout-pricing';
import { createStripePaymentIntent } from '@/lib/create-stripe-payment-intent';
import { formatPhoneForDisplay, formatUaePhoneInput } from '@/lib/phone';
import { saveLastOrder, type LastOrder } from '@/lib/order-session';
import { orderCurrency } from '@/lib/submit-order';
import { trackAddPaymentInfo } from '@/lib/tracking';
import { useCheckoutActions } from '@/lib/use-checkout-actions';

const { checkout, market } = businessConfig;
const FORM_ID = 'card-checkout-form';

export function CardCheckoutView() {
  const { total } = useCart();
  const totals = useMemo(() => calculateCheckoutTotals(total, 'card'), [total]);

  return (
    <CardStripeProvider total={totals.total}>
      <CardCheckoutForm totals={totals} />
    </CardStripeProvider>
  );
}

function CardCheckoutForm({ totals }: { totals: ReturnType<typeof calculateCheckoutTotals> }) {
  const { items } = useCart();
  const { paymentIntentId } = useCardStripe();
  const { confirmCardPayment, isReady: stripeReady } = useCardPaymentSubmit();
  const { loading, error, setError, validateCard } = useCheckoutActions(totals);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [building, setBuilding] = useState('');
  const [paying, setPaying] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);

  const form = { name, phone, area, address, building };
  const isLoading = loading || paying;

  function buildAreaNotes() {
    return [area.trim(), address.trim(), building.trim()].filter(Boolean).join(' — ');
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationError = validateCard(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!stripeReady || !paymentReady) {
      setError('نموذج الدفع لم يكتمل التحميل بعد — انتظري ثانية');
      return;
    }

    setPaying(true);
    setError('');

    try {
      trackAddPaymentInfo({
        value: totals.total,
        currency: market.currency,
        paymentMethod: 'card',
      });

      const intent = await createStripePaymentIntent({
        customerName: name.trim(),
        phone,
        area: buildAreaNotes(),
        items: buildOrderLines(),
        sourceUrl: getStoredLandingUrl(),
        paymentIntentId,
      });

      const phoneDisplay = formatPhoneForDisplay(phone);
      const savedOrder: LastOrder = {
        orderId: intent.orderId,
        orderIds: intent.orderIds,
        customerName: name.trim(),
        phone: phoneDisplay,
        area: buildAreaNotes(),
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
        paymentMethod: 'CARD',
      };

      saveLastOrder(savedOrder);

      const base = window.location.origin;
      await confirmCardPayment({
        returnUrl: `${base}/thank-you?payment=card&order=${intent.orderId}`,
        customerName: name.trim(),
        phone,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('card') || message.includes('بطاق')) {
        setError(message);
      } else if (message.includes('stripe')) {
        setError('تعذّر إتمام الدفع — تأكدي من بيانات البطاقة وجربي مرة ثانية');
      } else {
        setError('صار خطأ — جربي مرة ثانية');
      }
      setPaying(false);
    }
  }

  return (
    <CheckoutShell
      title="الدفع بالبطاقة"
      subtitle="أكملي معلومات التوصيل وأدخلي بيانات البطاقة بأمان"
      backHref="/checkout"
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <p className="mb-3 font-arabic text-sm font-extrabold text-foreground">الدفع السريع</p>
            <PaymentLogos />
            <p className="mt-3 text-center text-[11px] text-muted">
              Visa · Mastercard · Apple Pay
            </p>
          </section>

          <form id={FORM_ID} onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
            <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-arabic text-sm font-extrabold text-foreground">معلومات التواصل</h2>
              <div className="space-y-4">
                <Field label={checkout.nameLabel} id="name" value={name} onChange={setName} placeholder={checkout.namePlaceholder} />
                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm font-bold">{checkout.phoneLabel}</label>
                  <input
                    id="phone"
                    required
                    type="tel"
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(formatUaePhoneInput(e.target.value))}
                    placeholder={checkout.phonePlaceholder}
                    className="w-full rounded-xl border border-border bg-white px-4 py-3.5 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-arabic text-sm font-extrabold text-foreground">عنوان التوصيل</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="area" className="mb-2 block text-sm font-bold">{checkout.areaLabel}</label>
                  <select id="area" required value={area} onChange={(e) => setArea(e.target.value)} className="w-full rounded-xl border border-border bg-white px-4 py-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
                    <option value="">{checkout.areaPlaceholder}</option>
                    {market.emirates.map((emirate) => (
                      <option key={emirate} value={emirate}>{emirate}</option>
                    ))}
                  </select>
                </div>
                <Field label={checkout.addressLabel} id="address" value={address} onChange={setAddress} placeholder={checkout.addressPlaceholder} />
                <Field label="رقم المبنى / الشقة (اختياري)" id="building" value={building} onChange={setBuilding} placeholder="مثال: برج 5، شقة 1204" required={false} />
              </div>
            </section>

            <CardPaymentElement onReadyChange={setPaymentReady} />

            {error ? <CheckoutError message={error} /> : null}

            <div className="lg:hidden">
              <CheckoutCTA method="card" total={totals.total} loading={isLoading} disabled={!paymentReady} formId={FORM_ID} />
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <CheckoutSidebar totals={totals} />
          <div className="hidden lg:block">
            <CheckoutCTA method="card" total={totals.total} loading={isLoading} disabled={!paymentReady} formId={FORM_ID} />
          </div>
        </div>
      </div>
    </CheckoutShell>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  placeholder,
  required = true,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold">{label}</label>
      <input
        id={id}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="field-input w-full rounded-xl border border-border bg-white px-4 py-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
      />
    </div>
  );
}
