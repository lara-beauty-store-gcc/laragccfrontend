'use client';

import { businessConfig } from '@/config/business';
import type { CheckoutTotals } from '@/lib/checkout-pricing';
import { formatPrice } from '@/lib/pricing';

const { checkout } = businessConfig;

type CheckoutMobileStickyFooterProps = {
  totals: CheckoutTotals;
  children: React.ReactNode;
};

/** Fixed pay/continue bar on mobile — total always visible while scrolling forms */
export function CheckoutMobileStickyFooter({ totals, children }: CheckoutMobileStickyFooterProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-white/95 px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm lg:hidden"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <div className="min-w-0 shrink-0">
          <p className="text-[10px] font-medium text-muted">{checkout.grandTotalLabel}</p>
          <p className="font-arabic text-lg font-extrabold tabular-nums text-primary">
            {formatPrice(totals.total)}
          </p>
        </div>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
