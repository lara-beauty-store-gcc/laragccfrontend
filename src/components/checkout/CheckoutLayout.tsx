'use client';

import { CheckoutSidebar } from '@/components/checkout/CheckoutSidebar';
import type { CheckoutTotals, PaymentMethod } from '@/lib/checkout-pricing';

export type CheckoutSummaryMode = 'hidden' | 'smooche';

type CheckoutLayoutProps = {
  totals: CheckoutTotals;
  paymentMethod?: PaymentMethod;
  /** hidden = no basket (payment method page). smooche = sidebar desktop / bottom mobile */
  summaryMode?: CheckoutSummaryMode;
  children: React.ReactNode;
  mobileFooter?: React.ReactNode;
};

/**
 * Smooche-style checkout layout:
 * - Payment method page: no basket, sticky total only
 * - Card/COD page: forms first on mobile, basket at bottom; desktop = form + sticky sidebar
 */
export function CheckoutLayout({
  totals,
  paymentMethod,
  summaryMode = 'smooche',
  children,
  mobileFooter,
}: CheckoutLayoutProps) {
  const showSummary = summaryMode === 'smooche';
  const padBottom = mobileFooter ? 'pb-24 lg:pb-0' : '';

  if (!showSummary) {
    return (
      <>
        <div className={`mx-auto max-w-xl space-y-6 ${padBottom}`}>{children}</div>
        {mobileFooter}
      </>
    );
  }

  return (
    <>
      <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* Mobile: forms first. Desktop: form column (RTL start) */}
        <div className={`order-1 min-w-0 space-y-5 ${padBottom}`}>{children}</div>

        {/* Mobile: basket at bottom. Desktop: sticky sidebar like Smooche */}
        <div className="order-2 lg:sticky lg:top-6 lg:self-start">
          <CheckoutSidebar totals={totals} paymentMethod={paymentMethod} />
        </div>
      </div>
      {mobileFooter}
    </>
  );
}
