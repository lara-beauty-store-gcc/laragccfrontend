'use client';

import { CardCheckoutView } from '@/components/checkout/CardCheckoutView';
import { CheckoutEmpty } from '@/components/checkout/CheckoutEmpty';
import { CheckoutGate } from '@/components/checkout/CheckoutGate';
import { useCart } from '@/lib/cart';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { isCardPaymentEnabled } from '@/lib/payment-features';

export default function CardCheckoutPage() {
  const { items } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (!isCardPaymentEnabled()) {
      router.replace(items.length ? '/checkout/cod' : '/checkout');
    }
  }, [items.length, router]);

  if (items.length === 0) return <CheckoutEmpty />;
  if (!isCardPaymentEnabled()) return null;

  return (
    <CheckoutGate>
      <CardCheckoutView />
    </CheckoutGate>
  );
}
