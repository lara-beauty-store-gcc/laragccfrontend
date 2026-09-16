'use client';

import { PhoneCall } from 'lucide-react';
import { businessConfig } from '@/config/business';
import type { PaymentMethod } from '@/lib/checkout-pricing';
import { formatUaePhoneInput } from '@/lib/phone';

const { checkout, payment, market } = businessConfig;

type CheckoutFormFieldsProps = {
  method: PaymentMethod;
  name: string;
  phone: string;
  area: string;
  address: string;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onAreaChange: (value: string) => void;
  onAddressChange: (value: string) => void;
};

export function CheckoutFormFields({
  method,
  name,
  phone,
  area,
  address,
  onNameChange,
  onPhoneChange,
  onAreaChange,
  onAddressChange,
}: CheckoutFormFieldsProps) {
  const isCard = method === 'card';

  return (
    <section className="space-y-4 rounded-2xl border border-border/80 bg-white p-4 shadow-card">
      <h3 className="font-arabic text-sm font-extrabold text-foreground">
        {isCard ? checkout.cardFormTitle : checkout.codFormTitle}
      </h3>

      {!isCard ? (
        <div className="flex items-start gap-2 rounded-xl bg-surface-rose px-3 py-2.5">
          <PhoneCall className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <p className="text-[11px] leading-relaxed text-muted">{payment.codFormNote}</p>
        </div>
      ) : null}

      <div>
        <label htmlFor="checkout-name" className="mb-2 block text-sm font-bold text-foreground">
          {checkout.nameLabel}
        </label>
        <input
          id="checkout-name"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
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
          onChange={(e) => onPhoneChange(formatUaePhoneInput(e.target.value))}
          className="w-full rounded-xl border border-border bg-white px-4 py-3.5 text-base text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          placeholder={checkout.phonePlaceholder}
        />
        <p className="mt-2 text-[11px] leading-relaxed text-muted">{checkout.phoneHint}</p>
      </div>

      {isCard ? (
        <>
          <div>
            <label htmlFor="checkout-area" className="mb-2 block text-sm font-bold text-foreground">
              {checkout.areaLabel}
            </label>
            <select
              id="checkout-area"
              required
              value={area}
              onChange={(e) => onAreaChange(e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-4 py-3.5 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value="">{checkout.areaPlaceholder}</option>
              {market.emirates.map((emirate) => (
                <option key={emirate} value={emirate}>
                  {emirate}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="checkout-address" className="mb-2 block text-sm font-bold text-foreground">
              {checkout.addressLabel}
            </label>
            <textarea
              id="checkout-address"
              required
              rows={3}
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
              className="w-full resize-none rounded-xl border border-border bg-white px-4 py-3.5 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              placeholder={checkout.addressPlaceholder}
            />
          </div>
        </>
      ) : null}
    </section>
  );
}
