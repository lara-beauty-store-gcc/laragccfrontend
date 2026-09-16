'use client';

import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { PaymentLogos } from '@/components/checkout/PaymentLogos';
import { businessConfig } from '@/config/business';

const { payment } = businessConfig;

type CardPaymentElementProps = {
  onReadyChange?: (ready: boolean) => void;
};

export function CardPaymentElement({ onReadyChange }: CardPaymentElementProps) {
  const [ready, setReady] = useState(false);

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-arabic text-sm font-extrabold text-foreground">الدفع</h2>
          <p className="mt-1 text-xs text-muted">جميع المعاملات آمنة ومشفّرة</p>
        </div>
        <PaymentLogos size="sm" />
      </div>

      <div className="rounded-xl border border-border bg-[#FAFAFA] p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary">
            <span className="h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-sm font-bold text-foreground">الدفع بالبطاقة</span>
        </div>

        {!ready ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted">
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

      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted">
        <Lock className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden />
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
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
        <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden />
        <span>جارٍ تجهيز الدفع الآمن...</span>
      </div>
    </section>
  );
}

export function CardPaymentUnavailable() {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
      <p className="font-bold">الدفع بالبطاقة غير متاح حالياً</p>
      <p className="mt-2 text-xs leading-relaxed">
        يرجى إضافة مفتاح Stripe العام (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) في EasyPanel ثم إعادة النشر.
      </p>
    </section>
  );
}
