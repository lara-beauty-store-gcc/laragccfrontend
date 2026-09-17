'use client';

import { ArrowLeft, Loader2, Lock } from 'lucide-react';
import { businessConfig } from '@/config/business';
import type { PaymentMethod } from '@/lib/checkout-pricing';
import { checkoutCtaLabel, checkoutLoadingLabel } from '@/lib/checkout-pricing';

const { payment } = businessConfig;

type CheckoutCTAProps = {
  method: PaymentMethod;
  total: number;
  loading: boolean;
  disabled?: boolean;
  formId?: string;
  onClick?: () => void;
  /** Shorter button for mobile sticky footer (total shown separately) */
  compact?: boolean;
};

export function CheckoutCTA({
  method,
  total,
  loading,
  disabled,
  formId,
  onClick,
  compact = false,
}: CheckoutCTAProps) {
  const label = loading
    ? checkoutLoadingLabel(method)
    : compact
      ? method === 'card'
        ? payment.cardCtaPrefix
        : payment.codCtaPrefix
      : checkoutCtaLabel(method, total);

  return (
    <div className={compact ? '' : 'space-y-2.5'}>
      <button
        type={onClick ? 'button' : 'submit'}
        form={onClick ? undefined : formId}
        onClick={onClick}
        disabled={loading || disabled}
        className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-primary font-arabic font-extrabold text-white shadow-lg transition hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${
          compact ? 'min-h-[2.75rem] px-4 py-2.5 text-sm' : 'min-h-[3.5rem] gap-3 px-5 py-4 text-base'
        }`}
        aria-busy={loading}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        ) : (
          <>
            <ArrowLeft className="h-5 w-5 shrink-0" aria-hidden />
            <span className="flex-1 text-center">{label}</span>
            {method === 'card' ? <Lock className="h-4 w-4 shrink-0" aria-hidden /> : null}
          </>
        )}
      </button>

      {!compact ? (
        <p className="text-center text-[11px] leading-relaxed text-muted">
          {method === 'card' ? payment.cardRedirectNote : payment.codDeliveryNote}
        </p>
      ) : null}
    </div>
  );
}
