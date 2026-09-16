'use client';

import { useRouter } from 'next/navigation';
import { CreditCard, HandCoins, Package, ShieldCheck } from 'lucide-react';
import { businessConfig } from '@/config/business';
import { PaymentLogos } from '@/components/checkout/PaymentLogos';
import { isCardPaymentEnabled } from '@/lib/payment-features';

const { payment, checkout } = businessConfig;

export function PaymentMethodStep() {
  const router = useRouter();
  const cardEnabled = isCardPaymentEnabled();

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <p className="text-center text-sm text-muted">{checkout.pageSubtitle}</p>

      {cardEnabled ? (
        <button
          type="button"
          onClick={() => router.push('/checkout/card')}
          className="w-full rounded-2xl border-2 border-[#E8B4B8] bg-[#FFF5F5] p-5 text-right shadow-soft transition hover:border-primary/40 active:scale-[0.99]"
        >
          <span className="mb-3 inline-block rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-primary-dark">
            {payment.cardPopularBadge}
          </span>

          <div className="flex items-start gap-3">
            <CreditCard className="mt-1 h-6 w-6 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-arabic text-lg font-extrabold text-foreground">{payment.cardTitle}</p>
              <p className="mt-1 text-sm font-bold text-emerald-700">{payment.cardSubtitle}</p>
              <p className="mt-1 text-xs text-muted">{payment.cardHint}</p>
            </div>
          </div>

          <div className="mt-4 border-t border-[#E8B4B8]/40 pt-4">
            <PaymentLogos size="md" align="start" />
          </div>

          <div className="mt-3 flex items-center gap-2 text-[11px] text-muted">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>{payment.secureStripe}</span>
          </div>
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => router.push('/checkout/cod')}
        className="w-full rounded-2xl border-2 border-border bg-white p-5 text-right transition hover:border-primary/30 active:scale-[0.99]"
      >
        <div className="flex items-start gap-3">
          <HandCoins className="mt-1 h-6 w-6 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-arabic text-lg font-extrabold text-foreground">{payment.codTitle}</p>
            <p className="mt-1 text-sm font-bold text-amber-800">{payment.codSubtitle}</p>
            <p className="mt-1 text-xs text-muted">{payment.codHint}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface-rose px-3 py-2 text-[11px] text-muted">
          <Package className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span>الاسم والجوال فقط — نتصل بيك لتأكيد العنوان</span>
        </div>
      </button>
    </div>
  );
}
