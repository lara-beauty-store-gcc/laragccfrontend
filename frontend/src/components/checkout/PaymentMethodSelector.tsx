'use client';

import { CreditCard, HandCoins } from 'lucide-react';
import { businessConfig } from '@/config/business';
import type { PaymentMethod } from '@/lib/checkout-pricing';

const { payment } = businessConfig;

type PaymentMethodSelectorProps = {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  disabled?: boolean;
};

const options: Array<{
  id: PaymentMethod;
  icon: typeof CreditCard;
  title: string;
  subtitle: string;
  hint: string;
}> = [
  {
    id: 'card',
    icon: CreditCard,
    title: payment.cardTitle,
    subtitle: payment.cardSubtitle,
    hint: payment.cardHint,
  },
  {
    id: 'cod',
    icon: HandCoins,
    title: payment.codTitle,
    subtitle: payment.codSubtitle,
    hint: payment.codHint,
  },
];

export function PaymentMethodSelector({ value, onChange, disabled }: PaymentMethodSelectorProps) {
  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="mb-1 font-arabic text-sm font-extrabold text-foreground">
        {payment.selectorTitle}
      </legend>

      <div className="space-y-2.5" role="radiogroup" aria-label={payment.selectorTitle}>
        {options.map((option) => {
          const selected = value === option.id;
          const Icon = option.icon;

          return (
            <label
              key={option.id}
              className={`flex min-h-[4.75rem] cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition-all duration-200 ${
                selected
                  ? 'border-primary bg-primary/5 shadow-soft'
                  : 'border-border bg-white hover:border-primary/25'
              } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
            >
              <input
                type="radio"
                name="payment-method"
                value={option.id}
                checked={selected}
                onChange={() => onChange(option.id)}
                className="sr-only"
              />

              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  selected ? 'border-primary bg-primary' : 'border-border bg-white'
                }`}
                aria-hidden
              >
                {selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
              </span>

              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span className="font-arabic text-sm font-extrabold text-foreground">{option.title}</span>
                </span>
                <span className="text-xs font-semibold text-primary">{option.subtitle}</span>
                <span className="text-[11px] leading-relaxed text-muted">{option.hint}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
