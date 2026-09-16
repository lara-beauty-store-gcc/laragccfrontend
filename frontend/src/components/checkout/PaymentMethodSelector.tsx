'use client';

import { CreditCard, HandCoins, Package, ShieldCheck } from 'lucide-react';
import { businessConfig } from '@/config/business';
import type { PaymentMethod } from '@/lib/checkout-pricing';

const { payment } = businessConfig;

type PaymentMethodSelectorProps = {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  disabled?: boolean;
};

export function PaymentMethodSelector({ value, onChange, disabled }: PaymentMethodSelectorProps) {
  const cardSelected = value === 'card';
  const codSelected = value === 'cod';

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="sr-only">{payment.selectorTitle}</legend>

      <div className="space-y-3" role="radiogroup" aria-label={payment.selectorTitle}>
        <label
          className={`relative block cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 ${
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

          <span className="absolute left-3 top-3 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-primary-dark">
            {payment.cardPopularBadge}
          </span>

          <div className="flex items-start gap-3 pt-6">
            <span
              className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                cardSelected ? 'border-primary bg-primary' : 'border-border bg-white'
              }`}
              aria-hidden
            >
              {cardSelected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" aria-hidden />
                  <span className="font-arabic text-base font-extrabold text-foreground">{payment.cardTitle}</span>
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-muted" dir="ltr">
                  <span className="rounded border border-border bg-white px-1.5 py-0.5">VISA</span>
                  <span className="rounded border border-border bg-white px-1.5 py-0.5">MC</span>
                </span>
              </div>

              <p className="mt-1.5 text-sm font-bold text-emerald-700">{payment.cardSubtitle}</p>
              <p className="text-xs text-muted">{payment.cardHint}</p>

              <div className="mt-3 flex items-start gap-2 rounded-xl bg-white/80 px-3 py-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <p className="text-[11px] leading-relaxed text-muted">
                  {payment.secureStripe} — {payment.noCardStorage}
                </p>
              </div>
            </div>
          </div>
        </label>

        <label
          className={`block cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 ${
            codSelected
              ? 'border-primary bg-primary/5 shadow-soft'
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
            <span
              className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                codSelected ? 'border-primary bg-primary' : 'border-border bg-white'
              }`}
              aria-hidden
            >
              {codSelected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
            </span>

            <div className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <HandCoins className="h-5 w-5 text-primary" aria-hidden />
                <span className="font-arabic text-base font-extrabold text-foreground">{payment.codTitle}</span>
              </span>

              <p className="mt-1.5 text-sm font-bold text-amber-800">{payment.codSubtitle}</p>
              <p className="text-xs text-muted">{payment.codHint}</p>

              <div className="mt-3 flex items-start gap-2 rounded-xl bg-surface-rose px-3 py-2">
                <Package className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <p className="text-[11px] leading-relaxed text-muted">
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
