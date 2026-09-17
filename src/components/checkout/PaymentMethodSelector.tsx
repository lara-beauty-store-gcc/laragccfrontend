'use client';

import { CreditCard, HandCoins, Lock, ShieldCheck } from 'lucide-react';
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
      className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
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
    <fieldset className="space-y-4" disabled={disabled}>
      <legend className="sr-only">{payment.selectorTitle}</legend>

      <div className="space-y-4" role="radiogroup" aria-label={payment.selectorTitle}>
        {cardEnabled ? (
          <label
            className={`relative block cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200 ${
              cardSelected
                ? 'border-primary bg-[#F0F7F2] shadow-soft'
                : 'border-border bg-white hover:border-primary/25'
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

            <span className="absolute end-4 top-4 rounded-full bg-[#E6F4EA] px-3 py-1 text-[10px] font-bold text-primary">
              {payment.cardPopularBadge}
            </span>

            <div className="flex items-start gap-4">
              <RadioIndicator selected={cardSelected} />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <CreditCard className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                    <span className="font-arabic text-lg font-extrabold text-foreground">{payment.cardTitle}</span>
                  </div>
                  <PaymentLogos size="xs" align="end" className="max-w-[48%] sm:max-w-none" />
                </div>

                <p className="mt-1.5 text-sm font-bold text-emerald-700">{payment.cardSubtitle}</p>
                <p className="mt-0.5 text-xs text-muted">{payment.cardHint}</p>

                <div className="mt-4 flex items-center gap-2 rounded-xl border border-border/60 bg-white px-3 py-2.5">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <p className="text-[11px] leading-relaxed text-muted">
                    دفع آمن 100% — بياناتك محمية
                  </p>
                </div>

                <div className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-muted">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                  <span>{payment.secureStripe} — {payment.noCardStorage}</span>
                </div>
              </div>
            </div>
          </label>
        ) : null}

        <label
          className={`block cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200 ${
            codSelected
              ? 'border-primary/50 bg-[#FAFCFB] shadow-soft'
              : 'border-border bg-white hover:border-primary/25'
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

          <div className="flex items-start gap-4">
            <RadioIndicator selected={codSelected} />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <HandCoins className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                <span className="font-arabic text-lg font-extrabold text-foreground">{payment.codTitle}</span>
              </div>

              <p className="mt-1.5 text-sm font-bold text-amber-800">{payment.codSubtitle}</p>
              <p className="mt-0.5 text-xs text-muted">{payment.codHint}</p>
            </div>
          </div>
        </label>
      </div>
    </fieldset>
  );
}
