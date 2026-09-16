'use client';

import { HandCoins, ShieldCheck } from 'lucide-react';
import { businessConfig } from '@/config/business';
import type { PaymentMethod } from '@/lib/checkout-pricing';

const { payment, checkout } = businessConfig;

export function PaymentTrustNote({ method }: { method: PaymentMethod }) {
  if (method === 'card') {
    return (
      <div className="rounded-xl border border-primary/15 bg-primary/5 px-3.5 py-3">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <div className="space-y-1 text-[11px] leading-relaxed text-muted">
            <p className="font-bold text-foreground">{payment.securePayment}</p>
            <p>{payment.secureStripe}</p>
            <p>{payment.noCardStorage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      <div className="rounded-xl bg-white px-2 py-3">
        <HandCoins className="mx-auto h-4 w-4 text-primary" aria-hidden />
        <p className="mt-1.5 text-[10px] font-bold leading-snug text-foreground">{payment.codTitle}</p>
      </div>
      <div className="rounded-xl bg-white px-2 py-3">
        <ShieldCheck className="mx-auto h-4 w-4 text-primary" aria-hidden />
        <p className="mt-1.5 text-[10px] font-bold leading-snug text-foreground">{checkout.trustSecure}</p>
      </div>
      <div className="rounded-xl bg-white px-2 py-3">
        <HandCoins className="mx-auto h-4 w-4 text-primary" aria-hidden />
        <p className="mt-1.5 text-[10px] font-bold leading-snug text-foreground">{checkout.trustDelivery}</p>
      </div>
    </div>
  );
}
