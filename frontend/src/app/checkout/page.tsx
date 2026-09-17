'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { CheckoutCTA } from '@/components/checkout/CheckoutCTA';
import { CheckoutEmpty } from '@/components/checkout/CheckoutEmpty';
import { CheckoutGate } from '@/components/checkout/CheckoutGate';
import { CheckoutHeroPanel } from '@/components/checkout/CheckoutHeroPanel';
import { CheckoutShell } from '@/components/checkout/CheckoutShell';
import { CheckoutSidebar } from '@/components/checkout/CheckoutSidebar';
import { CheckoutTrustFooter } from '@/components/checkout/CheckoutTrustFooter';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import type { PaymentMethod } from '@/lib/checkout-pricing';
import { calculateCheckoutTotals } from '@/lib/checkout-pricing';
import { useCart } from '@/lib/cart';
import { isCardPaymentEnabled, preferredPaymentMethod } from '@/lib/payment-features';

export default function CheckoutPage() {
  const { items, total } = useCart();
  const router = useRouter();
  const cardEnabled = isCardPaymentEnabled();
  const [method, setMethod] = useState<PaymentMethod>(preferredPaymentMethod());

  const totals = useMemo(() => calculateCheckoutTotals(total, method), [total, method]);
  const firstSlug = items[0]?.slug;

  useEffect(() => {
    if (items.length > 0 && !cardEnabled) {
      router.replace('/checkout/cod');
    }
  }, [items.length, cardEnabled, router]);

  useEffect(() => {
    if (!cardEnabled && method === 'card') {
      setMethod('cod');
    }
  }, [cardEnabled, method]);

  if (items.length === 0) {
    return <CheckoutEmpty />;
  }

  if (!cardEnabled) {
    return null;
  }

  function continueCheckout() {
    router.push(method === 'card' ? '/checkout/card' : '/checkout/cod');
  }

  return (
    <CheckoutGate>
      <CheckoutShell
        title="اختر طريقة الدفع المناسبة لك"
        subtitle="جميع المعاملات آمنة ومشفّرة"
        backHref="/"
        progressStep={2}
      >
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px_260px] lg:gap-8">
          {/* RTL: col 3 = left — order summary */}
          <div className="order-1 lg:col-start-3 lg:row-start-1">
            <CheckoutSidebar totals={totals} paymentMethod={method} />
          </div>

          {/* RTL: col 2 = center — payment */}
          <div className="order-2 space-y-6 lg:col-start-2 lg:row-start-1">
            <PaymentMethodSelector value={method} onChange={setMethod} />
            <CheckoutCTA
              method={method}
              total={totals.total}
              loading={false}
              onClick={continueCheckout}
            />
            <CheckoutTrustFooter />
          </div>

          {/* RTL: col 1 = right — hero */}
          <div className="order-3 hidden lg:col-start-1 lg:row-start-1 lg:block">
            <CheckoutHeroPanel productSlug={firstSlug} />
          </div>
        </div>
      </CheckoutShell>
    </CheckoutGate>
  );
}
