'use client';

import { useMemo, useState } from 'react';
import { PhoneCall } from 'lucide-react';
import { CheckoutCTA } from '@/components/checkout/CheckoutCTA';
import { CheckoutError } from '@/components/checkout/CheckoutError';
import { CheckoutLayout } from '@/components/checkout/CheckoutLayout';
import { CheckoutMobileStickyFooter } from '@/components/checkout/CheckoutMobileStickyFooter';
import { CheckoutShell } from '@/components/checkout/CheckoutShell';
import { businessConfig } from '@/config/business';
import { useCart } from '@/lib/cart';
import { calculateCheckoutTotals } from '@/lib/checkout-pricing';
import { formatUaePhoneInput } from '@/lib/phone';
import { useCheckoutActions } from '@/lib/use-checkout-actions';

const { checkout, payment } = businessConfig;
const FORM_ID = 'cod-checkout-form';

export function CodCheckoutView() {
  const { total } = useCart();
  const totals = useMemo(() => calculateCheckoutTotals(total, 'cod'), [total]);
  const { loading, error, submitCod } = useCheckoutActions(totals);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const form = { name, phone, area: '', address: '', building: '' };

  const cta = (compact = false) => (
    <CheckoutCTA
      method="cod"
      total={totals.total}
      loading={loading}
      formId={FORM_ID}
      compact={compact}
    />
  );

  return (
    <CheckoutShell
      title="الدفع عند الاستلام"
      subtitle="الاسم والجوال فقط — فريقنا يتصل بيك لتأكيد العنوان"
      backHref="/checkout"
      progressStep={3}
    >
      <CheckoutLayout
        totals={totals}
        paymentMethod="cod"
        mobileFooter={
          <CheckoutMobileStickyFooter totals={totals}>{cta(true)}</CheckoutMobileStickyFooter>
        }
      >
        <form
          id={FORM_ID}
          onSubmit={(e) => {
            e.preventDefault();
            void submitCod(form);
          }}
          className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-5 flex items-start gap-3 rounded-xl bg-surface-rose px-4 py-3">
            <PhoneCall className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <p className="text-sm leading-relaxed text-muted">{payment.codFormNote}</p>
          </div>

          <h2 className="mb-4 font-arabic text-sm font-extrabold text-foreground">{checkout.codFormTitle}</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="cod-name" className="mb-2 block text-sm font-bold">{checkout.nameLabel}</label>
              <input
                id="cod-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={checkout.namePlaceholder}
                className="w-full rounded-xl border border-border bg-white px-4 py-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div>
              <label htmlFor="cod-phone" className="mb-2 block text-sm font-bold">{checkout.phoneLabel}</label>
              <input
                id="cod-phone"
                required
                type="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(formatUaePhoneInput(e.target.value))}
                placeholder={checkout.phonePlaceholder}
                className="w-full rounded-xl border border-border bg-white px-4 py-3.5 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              <p className="mt-2 text-[11px] text-muted">{checkout.phoneHint}</p>
            </div>
          </div>

          {error ? (
            <div className="mt-4">
              <CheckoutError message={error} />
            </div>
          ) : null}

          <div className="mt-6 hidden lg:block">{cta()}</div>
        </form>
      </CheckoutLayout>
    </CheckoutShell>
  );
}
