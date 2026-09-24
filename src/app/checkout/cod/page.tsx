'use client';

import { CodCheckoutView } from '@/components/checkout/CodCheckoutView';
import { CheckoutEmpty } from '@/components/checkout/CheckoutEmpty';
import { CheckoutGate } from '@/components/checkout/CheckoutGate';
import { useCart } from '@/lib/cart';

export default function CodCheckoutPage() {
  const { items } = useCart();

  if (items.length === 0) return <CheckoutEmpty />;

  return (
    <CheckoutGate>
      <CodCheckoutView />
    </CheckoutGate>
  );
}
