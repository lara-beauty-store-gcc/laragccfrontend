'use client';

import { Elements } from '@stripe/react-stripe-js';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CardPaymentLoading, CardPaymentUnavailable } from '@/components/checkout/CardPaymentElement';
import { getStoredLandingUrl } from '@/components/LandingUrlTracker';
import { useCart } from '@/lib/cart';
import { createStripePaymentIntent } from '@/lib/create-stripe-payment-intent';
import { getStripeBrowser, stripeElementsReady } from '@/lib/stripe-client';

type CardStripeContextValue = {
  paymentIntentId: string;
  clientSecret: string;
};

const CardStripeCtx = createContext<CardStripeContextValue>({ paymentIntentId: '', clientSecret: '' });

type CardStripeProviderProps = {
  children: React.ReactNode;
  total: number;
};

export function CardStripeProvider({ children, total }: CardStripeProviderProps) {
  const { items } = useCart();
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const paymentIntentRef = useRef('');

  const orderLines = useMemo(
    () =>
      items.map((i) => ({
        sku: i.sku,
        name: i.name,
        productName: i.name,
        slug: i.slug,
        quantity: i.offerQuantity * i.qty,
        lineTotal: i.price * i.qty,
      })),
    [items],
  );

  const cartSignature = useMemo(
    () => orderLines.map((line) => `${line.sku}:${line.quantity}:${line.lineTotal}`).join('|'),
    [orderLines],
  );

  useEffect(() => {
    if (!stripeElementsReady()) {
      setLoading(false);
      setError('stripe_publishable_missing');
      return;
    }

    let cancelled = false;

    async function ensurePaymentIntent() {
      setLoading(true);
      setError('');

      try {
        const result = await createStripePaymentIntent({
          items: orderLines,
          sourceUrl: getStoredLandingUrl(),
          paymentIntentId: paymentIntentRef.current || undefined,
        });

        if (cancelled) return;

        paymentIntentRef.current = result.paymentIntentId;
        setPaymentIntentId(result.paymentIntentId);
        setClientSecret(result.clientSecret);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : '';
        setError(message || 'stripe_payment_intent_failed');
        setClientSecret('');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void ensurePaymentIntent();

    return () => {
      cancelled = true;
    };
  }, [cartSignature, total, orderLines]);

  if (!stripeElementsReady()) {
    return (
      <>
        <CardPaymentUnavailable />
        {children}
      </>
    );
  }

  if (loading && !clientSecret) {
    return (
      <>
        <CardPaymentLoading />
        {children}
      </>
    );
  }

  if (error || !clientSecret) {
    return (
      <>
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          تعذّر تجهيز الدفع — جرّبي تحديث الصفحة أو اختاري الدفع عند الاستلام.
        </section>
        {children}
      </>
    );
  }

  return (
    <Elements
      key={clientSecret}
      stripe={getStripeBrowser()}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#C2185B',
            colorText: '#1a1a1a',
            borderRadius: '12px',
            fontFamily: 'system-ui, sans-serif',
          },
          rules: {
            '.Input': {
              border: '1px solid #e5e7eb',
              boxShadow: 'none',
            },
            '.Input:focus': {
              border: '1px solid #C2185B',
              boxShadow: '0 0 0 2px rgba(194, 24, 91, 0.1)',
            },
          },
        },
      }}
    >
      <CardStripeCtx.Provider value={{ paymentIntentId, clientSecret }}>
        {children}
      </CardStripeCtx.Provider>
    </Elements>
  );
}

export function useCardStripe() {
  return useContext(CardStripeCtx);
}
