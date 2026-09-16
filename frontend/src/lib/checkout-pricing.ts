import { businessConfig } from '@/config/business';
import { formatPrice } from '@/lib/pricing';

const { payment } = businessConfig;

export type PaymentMethod = 'card' | 'cod';

export type CheckoutTotals = {
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryLabel: string;
  isDeliveryFree: boolean;
};

/** Single source of truth for checkout delivery + totals. */
export function calculateCheckoutTotals(subtotal: number, method: PaymentMethod): CheckoutTotals {
  const deliveryFee = method === 'cod' ? payment.codDeliveryFeeAed : 0;
  const total = subtotal + deliveryFee;

  return {
    subtotal,
    deliveryFee,
    total,
    deliveryLabel: deliveryFee === 0 ? payment.freeDeliveryLabel : formatPrice(deliveryFee),
    isDeliveryFree: deliveryFee === 0,
  };
}

export function checkoutCtaLabel(method: PaymentMethod, total: number): string {
  if (method === 'card') {
    return `${payment.cardCtaPrefix} — ${formatPrice(total)}`;
  }
  return `${payment.codCtaPrefix} — ${formatPrice(total)}`;
}

export function checkoutLoadingLabel(method: PaymentMethod): string {
  return method === 'card' ? payment.cardLoadingLabel : payment.codLoadingLabel;
}
