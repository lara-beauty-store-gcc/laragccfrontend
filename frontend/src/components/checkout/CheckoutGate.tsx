'use client';

import { useEffect, useRef } from 'react';
import { useCart } from '@/lib/cart';
import { businessConfig } from '@/config/business';
import { trackInitiateCheckout } from '@/lib/tracking';

const { market } = businessConfig;

export function CheckoutGate({ children }: { children: React.ReactNode }) {
  const { items, total } = useCart();
  const tracked = useRef(false);

  useEffect(() => {
    if (items.length === 0 || tracked.current) return;
    tracked.current = true;
    trackInitiateCheckout({
      value: total,
      currency: market.currency,
      items: items.map((i) => ({ sku: i.sku, qty: i.qty, price: i.price })),
    });
  }, [items.length, total]);

  return <>{children}</>;
}
