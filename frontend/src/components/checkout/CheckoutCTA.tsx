'use client';

import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import { businessConfig } from '@/config/business';
import type { PaymentMethod } from '@/lib/checkout-pricing';
import { checkoutCtaLabel, checkoutLoadingLabel } from '@/lib/checkout-pricing';

const { payment } = businessConfig;

type CheckoutCTAProps = {
  method: PaymentMethod;
  total: number;
  loading: boolean;
  disabled?: boolean;
  formId: string;
};

export function CheckoutCTA({ method, total, loading, disabled, formId }: CheckoutCTAProps) {
  const label = loading ? checkoutLoadingLabel(method) : checkoutCtaLabel(method, total);

  return (
    <div className="space-y-2">
      <button
        type="submit"
        form={formId}
        disabled={loading || disabled}
        className="flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 font-arabic text-base font-extrabold text-white shadow-lg transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        aria-busy={loading}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        ) : method === 'card' ? (
          <Lock className="h-4 w-4 shrink-0" aria-hidden />
        ) : null}
        <span>{label}</span>
      </button>

      {method === 'card' ? (
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
          <span>{payment.securePayment} · {payment.noCardStorage}</span>
        </div>
      ) : (
        <p className="text-center text-[10px] text-muted">{payment.codDeliveryNote}</p>
      )}
    </div>
  );
}
