'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { CheckoutCTA } from '@/components/checkout/CheckoutCTA';
import { CheckoutEmpty } from '@/components/checkout/CheckoutEmpty';
import { CheckoutGate } from '@/components/checkout/CheckoutGate';
import { CheckoutLayout } from '@/components/checkout/CheckoutLayout';
import { CheckoutMobileStickyFooter } from '@/components/checkout/CheckoutMobileStickyFooter';
import { CheckoutShell } from '@/components/checkout/CheckoutShell';
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

  const cta = (compact = false) => (
    <CheckoutCTA
      method={method}
      total={totals.total}
      loading={false}
      onClick={continueCheckout}
      compact={compact}
    />
  );

  return (
    <CheckoutGate>
      <CheckoutShell
        title="اختر طريقة الدفع"
        subtitle="جميع المعاملات آمنة ومشفّرة"
        backHref="/"
        progressStep={2}
        layout="form"
      >
        {/* No basket here — only payment choice + sticky total */}
        <CheckoutLayout
          totals={totals}
          paymentMethod={method}
          summaryMode="hidden"
          mobileFooter={
            <CheckoutMobileStickyFooter totals={totals}>{cta(true)}</CheckoutMobileStickyFooter>
          }
        >
          <PaymentMethodSelector value={method} onChange={setMethod} />
          <div className="hidden lg:block">{cta()}</div>
          <CheckoutTrustFooter />
        </CheckoutLayout>
      </CheckoutShell>
    </CheckoutGate>
  );
}
