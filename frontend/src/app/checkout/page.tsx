'use client';

import { CheckoutEmpty } from '@/components/checkout/CheckoutEmpty';
import { CheckoutGate } from '@/components/checkout/CheckoutGate';
import { CheckoutShell } from '@/components/checkout/CheckoutShell';
import { CheckoutSidebar } from '@/components/checkout/CheckoutSidebar';
import { PaymentMethodStep } from '@/components/checkout/PaymentMethodStep';
import { useCart } from '@/lib/cart';
import { calculateCheckoutTotals } from '@/lib/checkout-pricing';
import { isCardPaymentEnabled } from '@/lib/payment-features';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

export default function CheckoutPage() {
  const { items, total } = useCart();
  const router = useRouter();
  const cardEnabled = isCardPaymentEnabled();

  const totals = useMemo(
    () => calculateCheckoutTotals(total, cardEnabled ? 'card' : 'cod'),
    [total, cardEnabled],
  );

  useEffect(() => {
    if (items.length > 0 && !cardEnabled) {
      router.replace('/checkout/cod');
    }
  }, [items.length, cardEnabled, router]);

  if (items.length === 0) {
    return <CheckoutEmpty />;
  }

  if (!cardEnabled) {
    return null;
  }

  return (
    <CheckoutGate>
      <CheckoutShell title="إتمام الطلب" subtitle="اختاري طريقة الدفع للمتابعة" backHref="/">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
          <PaymentMethodStep />
          <CheckoutSidebar items={items} totals={totals} />
        </div>
      </CheckoutShell>
    </CheckoutGate>
  );
}
