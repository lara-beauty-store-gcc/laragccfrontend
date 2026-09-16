'use client';

import { CreditCard, HandCoins, Lock, Package, ShieldCheck } from 'lucide-react';
import { PaymentLogos } from '@/components/checkout/PaymentLogos';
import { businessConfig } from '@/config/business';
import type { PaymentMethod } from '@/lib/checkout-pricing';
import { isCardPaymentEnabled } from '@/lib/payment-features';

const { payment } = businessConfig;

type PaymentMethodSelectorProps = {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  disabled?: boolean;
};

function RadioIndicator({ selected }: { selected: boolean }) {
  return (
    <span
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        selected ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
      }`}
      aria-hidden
    >
      {selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
    </span>
  );
}

export function PaymentMethodSelector({ value, onChange, disabled }: PaymentMethodSelectorProps) {
  const cardEnabled = isCardPaymentEnabled();
  const cardSelected = value === 'card';
  const codSelected = value === 'cod';

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="sr-only">{payment.selectorTitle}</legend>

      <div className="space-y-3" role="radiogroup" aria-label={payment.selectorTitle}>
        {cardEnabled ? (
          <label
            className={`relative block cursor-pointer rounded-2xl border-2 p-4 pe-4 ps-4 transition-all duration-200 ${
              cardSelected
                ? 'border-[#E8B4B8] bg-[#FFF5F5] shadow-soft'
                : 'border-border bg-white hover:border-primary/20'
            } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
          >
            <input
              type="radio"
              name="payment-method"
              value="card"
              checked={cardSelected}
              onChange={() => onChange('card')}
              className="sr-only"
            />

            <span className="absolute start-3 top-3 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-primary-dark">
              {payment.cardPopularBadge}
            </span>

            <div className="flex items-start gap-3 pt-7">
              <RadioIndicator selected={cardSelected} />

              <div className="min-w-0 flex-1 text-right">
                <div className="flex items-center justify-end gap-2">
                  <CreditCard className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <span className="font-arabic text-base font-extrabold text-foreground">{payment.cardTitle}</span>
                </div>

                <p className="mt-1.5 text-sm font-bold text-emerald-700">{payment.cardSubtitle}</p>
                <p className="text-xs text-muted">{payment.cardHint}</p>

                <div className="mt-3">
                  <PaymentLogos size="sm" align="start" showDisclaimer />
                </div>

                <div className="mt-3 flex items-start justify-end gap-2 rounded-xl bg-white/70 px-3 py-2">
                  <p className="text-[11px] leading-relaxed text-muted">
                    <Lock className="mb-0.5 inline h-3.5 w-3.5 text-primary" aria-hidden />
                    {' '}
                    {payment.secureStripe} — {payment.noCardStorage}
                  </p>
                </div>
              </div>
            </div>
          </label>
        ) : null}

        <label
          className={`block cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 ${
            codSelected
              ? 'border-primary/40 bg-primary/5 shadow-soft'
              : 'border-border bg-white hover:border-primary/20'
          } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
        >
          <input
            type="radio"
            name="payment-method"
            value="cod"
            checked={codSelected}
            onChange={() => onChange('cod')}
            className="sr-only"
          />

          <div className="flex items-start gap-3">
            <RadioIndicator selected={codSelected} />

            <div className="min-w-0 flex-1 text-right">
              <div className="flex items-center justify-end gap-2">
                <HandCoins className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                <span className="font-arabic text-base font-extrabold text-foreground">{payment.codTitle}</span>
              </div>

              <p className="mt-1.5 text-sm font-bold text-amber-800">{payment.codSubtitle}</p>
              <p className="text-xs text-muted">{payment.codHint}</p>

              <div className="mt-3 flex items-start justify-end gap-2 rounded-xl bg-surface-rose px-3 py-2">
                <p className="text-[11px] leading-relaxed text-muted">
                  <Package className="mb-0.5 inline h-3.5 w-3.5 text-primary" aria-hidden />
                  {' '}
                  سهولة وراحة — متوفر في كل إمارات الدولة
                </p>
              </div>
            </div>
          </div>
        </label>
      </div>
    </fieldset>
  );
}
