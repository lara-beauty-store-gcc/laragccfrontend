import { businessConfig } from '@/config/business';
import type { PaymentMethod } from '@/lib/checkout-pricing';

export function isCardPaymentEnabled(): boolean {
  return businessConfig.payment.cardEnabled;
}

export function defaultPaymentMethod(): PaymentMethod {
  return isCardPaymentEnabled() ? 'card' : 'cod';
}
