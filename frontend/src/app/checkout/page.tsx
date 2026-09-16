'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { CheckoutCTA } from '@/components/checkout/CheckoutCTA';
import { CheckoutEmpty } from '@/components/checkout/CheckoutEmpty';
import { CheckoutGate } from '@/components/checkout/CheckoutGate';
import { CheckoutShell } from '@/components/checkout/CheckoutShell';
import { CheckoutSidebar } from '@/components/checkout/CheckoutSidebar';
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

  return (
    <CheckoutGate>
      <CheckoutShell title="إتمام الطلب" subtitle="اختاري طريقة الدفع للمتابعة" backHref="/">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
          <div className="mx-auto w-full max-w-lg space-y-6">
            <PaymentMethodSelector value={method} onChange={setMethod} />
            <CheckoutCTA
              method={method}
              total={totals.total}
              loading={false}
              onClick={continueCheckout}
            />
          </div>
          <CheckoutSidebar totals={totals} />
        </div>
      </CheckoutShell>
    </CheckoutGate>
  );
}
