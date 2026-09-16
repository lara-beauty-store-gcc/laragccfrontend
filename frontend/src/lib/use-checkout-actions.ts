'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { getCrossSellProducts } from '@/lib/cross-sell';
import { useCart } from '@/lib/cart';
import type { CheckoutTotals } from '@/lib/checkout-pricing';
import { createStripeCheckout } from '@/lib/create-stripe-checkout';
import { getStoredLandingUrl } from '@/components/LandingUrlTracker';
import { saveLastOrder, type LastOrder } from '@/lib/order-session';
import {
  formatPhoneForDisplay,
  isValidUaePhone,
  normalizeUaePhone,
  uaePhoneErrorMessage,
} from '@/lib/phone';
import { orderCurrency, submitOrder } from '@/lib/submit-order';
import { businessConfig } from '@/config/business';
import { trackAddPaymentInfo, trackEvent } from '@/lib/tracking';

const { market } = businessConfig;

export type CheckoutFormState = {
  name: string;
  phone: string;
  area: string;
  address: string;
  building: string;
};

export function useCheckoutActions(totals: CheckoutTotals) {
  const router = useRouter();
  const { items, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submittingRef = useRef(false);

  function buildOrderLines() {
    return items.map((i) => ({
      sku: i.sku,
      name: i.name,
      productName: i.name,
      slug: i.slug,
      quantity: i.offerQuantity * i.qty,
      lineTotal: i.price * i.qty,
    }));
  }

  function buildAreaNotes(form: CheckoutFormState) {
    const parts = [form.area.trim(), form.address.trim(), form.building.trim()].filter(Boolean);
    return parts.join(' — ');
  }

  function validateCod(form: CheckoutFormState): string | null {
    if (!form.name.trim()) return 'الاسم الكامل مطلوب';
    if (!form.phone.trim()) return 'رقم الهاتف مطلوب';
    if (!isValidUaePhone(form.phone)) return uaePhoneErrorMessage(form.phone);
    return null;
  }

  function validateCard(form: CheckoutFormState): string | null {
    const base = validateCod(form);
    if (base) return base;
    if (!form.area.trim()) return 'الإمارة مطلوبة';
    if (!form.address.trim()) return 'العنوان مطلوب';
    return null;
  }

  async function submitCod(form: CheckoutFormState) {
    const validationError = validateCod(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    const phoneE164 = normalizeUaePhone(form.phone);
    if (!phoneE164) {
      setError(uaePhoneErrorMessage(form.phone));
      return;
    }

    setLoading(true);
    submittingRef.current = true;
    setError('');

    try {
      const phoneDisplay = formatPhoneForDisplay(form.phone);
      const { orderId, orderIds } = await submitOrder({
        customerName: form.name.trim(),
        phone: form.phone,
        area: buildAreaNotes(form),
        paymentMethod: 'COD',
        deliveryFeeAed: totals.deliveryFee,
        sourceUrl: getStoredLandingUrl(),
        items: buildOrderLines(),
      });

      const savedOrder: LastOrder = {
        orderId,
        orderIds,
        customerName: form.name.trim(),
        phone: phoneDisplay,
        productSlug: items[0]?.slug,
        items: items.map((i) => ({
          sku: i.sku,
          name: i.name,
          slug: i.slug,
          qty: i.qty,
          price: i.price,
          offerId: i.offerId,
          offerLabel: i.offerLabel,
        })),
        subtotal: totals.subtotal,
        deliveryFee: totals.deliveryFee,
        total: totals.total,
        currency: orderCurrency,
        paymentMethod: 'COD',
      };

      saveLastOrder(savedOrder);
      trackEvent('Lead', { value: totals.total, currency: market.currency });
      clear();

      if (getCrossSellProducts(savedOrder).length > 0) {
        router.push(`/thank-you?order=${orderId}&crosssell=1`);
        return;
      }

      router.push(`/thank-you?order=${orderId}`);
    } catch (err) {
      handleError(err);
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  async function submitCard(form: CheckoutFormState) {
    const validationError = validateCard(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (submittingRef.current || loading) return;

    setLoading(true);
    submittingRef.current = true;
    setError('');

    try {
      trackAddPaymentInfo({
        value: totals.total,
        currency: market.currency,
        paymentMethod: 'card',
      });

      const result = await createStripeCheckout({
        customerName: form.name.trim(),
        phone: form.phone,
        area: buildAreaNotes(form),
        paymentMethod: 'card',
        sourceUrl: getStoredLandingUrl(),
        items: buildOrderLines(),
      });

      window.location.href = result.checkoutUrl;
    } catch (err) {
      handleError(err);
      submittingRef.current = false;
      setLoading(false);
    }
  }

  function handleError(err: unknown) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('invalid_phone') || message.includes('جوال')) {
      setError('رقم الجوال غير صحيح — تأكدي من الرقم');
    } else if (message.includes('sheet_sync') || message.includes('الشيت')) {
      setError('ما قدرنا نسجّل الطلب — جربي مرة ثانية');
    } else if (message.includes('stripe') || message.includes('الدفع')) {
      setError(message.includes('—') ? message : 'تعذّر إنشاء جلسة الدفع — جرّبي مرة ثانية');
    } else {
      setError('صار خطأ — جربي مرة ثانية');
    }
  }

  return { loading, error, setError, submitCod, submitCard, validateCod, validateCard };
}
