'use client';

import { useMemo, useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { CheckoutCTA } from '@/components/checkout/CheckoutCTA';
import { CheckoutError } from '@/components/checkout/CheckoutError';
import { CheckoutShell } from '@/components/checkout/CheckoutShell';
import { CheckoutSidebar } from '@/components/checkout/CheckoutSidebar';
import { PaymentLogos } from '@/components/checkout/PaymentLogos';
import { businessConfig } from '@/config/business';
import { useCart } from '@/lib/cart';
import { calculateCheckoutTotals } from '@/lib/checkout-pricing';
import { formatUaePhoneInput } from '@/lib/phone';
import { useCheckoutActions } from '@/lib/use-checkout-actions';

const { checkout, market, payment } = businessConfig;
const FORM_ID = 'card-checkout-form';

export function CardCheckoutView() {
  const { items, total } = useCart();
  const totals = useMemo(() => calculateCheckoutTotals(total, 'card'), [total]);
  const { loading, error, submitCard } = useCheckoutActions(totals);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [building, setBuilding] = useState('');

  const form = { name, phone, area, address, building };

  return (
    <CheckoutShell
      title="الدفع بالبطاقة"
      subtitle="أكملي معلومات التوصيل ثم ادفعي بأمان عبر Stripe"
      backHref="/checkout"
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <p className="mb-3 font-arabic text-sm font-extrabold text-foreground">الدفع السريع</p>
            <PaymentLogos />
            <p className="mt-3 text-center text-[11px] text-muted">
              Visa · Mastercard · Apple Pay — متوفر عبر Stripe
            </p>
          </section>

          <form
            id={FORM_ID}
            onSubmit={(e) => {
              e.preventDefault();
              void submitCard(form);
            }}
            className="space-y-6"
          >
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
                    {market.emirates.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
                <Field label={checkout.addressLabel} id="address" value={address} onChange={setAddress} placeholder={checkout.addressPlaceholder} />
                <Field label="رقم المبنى / الشقة (اختياري)" id="building" value={building} onChange={setBuilding} placeholder="مثال: برج 5، شقة 1204" required={false} />
              </div>
            </section>

            <section className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="font-arabic text-sm font-extrabold text-foreground">الدفع</h2>
                <PaymentLogos size="sm" />
              </div>
              <p className="text-sm font-bold text-foreground">الدفع بالبطاقة</p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {payment.secureStripe}. {payment.noCardStorage}. سيتم تحويلك لصفحة Stripe الآمنة لإدخال بيانات البطاقة أو Apple Pay.
              </p>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-muted">
                <Lock className="h-4 w-4 text-primary" aria-hidden />
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
                <span>دفع مشفّر — لا نخزّن بيانات البطاقة</span>
              </div>
            </section>

            {error ? <CheckoutError message={error} /> : null}

            <div className="lg:hidden">
              <CheckoutCTA method="card" total={totals.total} loading={loading} formId={FORM_ID} />
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <CheckoutSidebar items={items} totals={totals} />
          <div className="hidden lg:block">
            <CheckoutCTA method="card" total={totals.total} loading={loading} formId={FORM_ID} />
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
