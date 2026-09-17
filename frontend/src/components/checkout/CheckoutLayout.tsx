'use client';

import { CheckoutSidebar } from '@/components/checkout/CheckoutSidebar';
import type { CheckoutTotals, PaymentMethod } from '@/lib/checkout-pricing';

type CheckoutLayoutProps = {
  totals: CheckoutTotals;
  paymentMethod?: PaymentMethod;
  /** Main column: forms, payment selector, card element, etc. */
  children: React.ReactNode;
  /** Optional sticky mobile footer (CTA slot) */
  mobileFooter?: React.ReactNode;
};

/**
 * Smooche-style checkout grid — mobile-first:
 * 1. Order summary (basket) at the TOP on phone
 * 2. Main content below
 * 3. Sticky total + CTA bar at bottom (when mobileFooter provided)
 *
 * Desktop: form column + sticky sidebar (like reference mockup).
 */
export function CheckoutLayout({
  totals,
  paymentMethod,
  children,
  mobileFooter,
}: CheckoutLayoutProps) {
  return (
    <>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
        {/* Mobile order-1: basket always visible first */}
        <div className="order-1 lg:order-2">
          <CheckoutSidebar totals={totals} paymentMethod={paymentMethod} />
        </div>

        {/* Mobile order-2: payment / forms */}
        <div className={`order-2 min-w-0 space-y-6 lg:order-1 ${mobileFooter ? 'pb-24 lg:pb-0' : ''}`}>
          {children}
        </div>
      </div>

      {mobileFooter}
    </>
  );
}
