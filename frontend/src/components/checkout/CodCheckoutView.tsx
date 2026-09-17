'use client';

import { useMemo, useState } from 'react';
import { PhoneCall } from 'lucide-react';
import { CheckoutCTA } from '@/components/checkout/CheckoutCTA';
import { CheckoutError } from '@/components/checkout/CheckoutError';
import { CheckoutFormSection } from '@/components/checkout/CheckoutFormSection';
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

const INPUT_CLASS =
  'w-full rounded-md border border-[#d9d9d9] bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#1773b0] focus:ring-1 focus:ring-[#1773b0]/20';

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
      title="إتمام الطلب"
      subtitle="الاسم والجوال فقط — فريقنا يتصل بيك لتأكيد العنوان"
      backHref="/checkout"
      progressStep={3}
      layout="form"
    >
      <CheckoutLayout
        totals={totals}
        paymentMethod="cod"
        summaryMode="smooche"
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
        >
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-primary/20 bg-[#f0f7f2] px-4 py-3">
            <PhoneCall className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <p className="text-sm leading-relaxed text-muted">{payment.codFormNote}</p>
          </div>

          <CheckoutFormSection title={checkout.codFormTitle}>
            <div>
              <label htmlFor="cod-name" className="mb-1.5 block text-sm font-medium text-foreground">
                {checkout.nameLabel}
              </label>
              <input
                id="cod-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={checkout.namePlaceholder}
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label htmlFor="cod-phone" className="mb-1.5 block text-sm font-medium text-foreground">
                {checkout.phoneLabel}
              </label>
              <input
                id="cod-phone"
                required
                type="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(formatUaePhoneInput(e.target.value))}
                placeholder={checkout.phonePlaceholder}
                className={INPUT_CLASS}
              />
              <p className="mt-1.5 text-[11px] text-muted">{checkout.phoneHint}</p>
            </div>
          </CheckoutFormSection>

          {error ? (
            <div className="mt-4">
              <CheckoutError message={error} />
            </div>
          ) : null}

          <div className="mt-6 hidden border-t border-border/60 pt-6 lg:block">{cta()}</div>
        </form>
      </CheckoutLayout>
    </CheckoutShell>
  );
}
