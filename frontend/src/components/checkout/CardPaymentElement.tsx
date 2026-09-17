'use client';

import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Loader2, Lock } from 'lucide-react';
import { useState } from 'react';
import { PaymentLogos } from '@/components/checkout/PaymentLogos';
import { businessConfig } from '@/config/business';

const { payment } = businessConfig;

type CardPaymentElementProps = {
  onReadyChange?: (ready: boolean) => void;
};

/** Smooche-style payment block: header + bordered card form with brand logos */
export function CardPaymentElement({ onReadyChange }: CardPaymentElementProps) {
  const [ready, setReady] = useState(false);

  return (
    <section>
      <div className="mb-3">
        <h2 className="font-arabic text-base font-extrabold text-foreground">الدفع</h2>
        <p className="mt-0.5 text-sm text-muted">جميع المعاملات آمنة ومشفّرة</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#d9d9d9] bg-white">
        {/* Title first on mobile; compact logos on the side / below */}
        <div className="border-b border-[#d9d9d9] bg-[#fafafa] px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <label className="flex min-w-0 cursor-default items-center gap-2">
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[4px] border-[#1773b0] bg-white sm:h-[18px] sm:w-[18px] sm:border-[5px]"
                aria-hidden
              />
              <span className="font-arabic text-sm font-bold text-foreground sm:text-[15px]">
                الدفع بالبطاقة
              </span>
            </label>
            <PaymentLogos size="xs" align="end" className="sm:shrink-0" />
          </div>
        </div>

        {/* Card fields */}
        <div className="bg-white p-4 sm:p-5">
          {!ready ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              <span>جارٍ تحميل نموذج الدفع...</span>
            </div>
          ) : null}

          <div className={ready ? '' : 'sr-only'}>
            <PaymentElement
              id="card-payment-element"
              options={{
                layout: 'tabs',
                wallets: { applePay: 'auto', googlePay: 'auto' },
                fields: { billingDetails: { address: 'never' } },
                terms: { card: 'never' },
              }}
              onReady={() => {
                setReady(true);
                onReadyChange?.(true);
              }}
              onLoadError={() => {
                setReady(false);
                onReadyChange?.(false);
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted">
        <Lock className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />
        <span>{payment.secureStripe}. {payment.noCardStorage}</span>
      </div>
    </section>
  );
}

export function useCardPaymentSubmit() {
  const stripe = useStripe();
  const elements = useElements();

  async function confirmCardPayment(params: {
    returnUrl: string;
    customerName: string;
    email: string;
    phone: string;
  }) {
    if (!stripe || !elements) {
      throw new Error('stripe_not_ready');
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: params.returnUrl,
        payment_method_data: {
          billing_details: {
            name: params.customerName,
            email: params.email,
            phone: params.phone,
          },
        },
      },
    });

    if (error) {
      throw new Error(error.message || 'stripe_payment_failed');
    }
  }

  return { stripe, elements, confirmCardPayment, isReady: Boolean(stripe && elements) };
}

export function CardPaymentLoading() {
  return (
    <section>
      <div className="mb-3">
        <h2 className="font-arabic text-base font-extrabold text-foreground">الدفع</h2>
      </div>
      <div className="flex items-center justify-center gap-2 rounded-lg border border-[#d9d9d9] py-12 text-sm text-muted">
        <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden />
        <span>جارٍ تجهيز الدفع الآمن...</span>
      </div>
    </section>
  );
}

export function CardPaymentUnavailable() {
  return (
    <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
      <p className="font-bold">الدفع بالبطاقة غير متاح حالياً</p>
      <p className="mt-2 text-xs leading-relaxed">
        تأكدي من إضافة مفتاح Stripe العام في EasyPanel ثم أعيدي تشغيل الحاوية:
      </p>
      <p className="mt-2 rounded-lg bg-white/80 px-3 py-2 font-mono text-[11px] leading-relaxed" dir="ltr">
        STRIPE_PUBLISHABLE_KEY=pk_live_...
      </p>
    </section>
  );
}
