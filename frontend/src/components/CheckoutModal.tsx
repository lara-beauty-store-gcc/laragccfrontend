'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { businessConfig } from '@/config/business';
import { getProductBySlug, products } from '@/config/products';
import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/pricing';
import { trackEvent } from '@/lib/tracking';
import { isValidUaePhone } from '@/lib/phone';

const { market } = businessConfig;

export function CheckoutModal() {
  const router = useRouter();
  const { items, isOpen, setOpen, clear, total, addOffer } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [upsellVisible, setUpsellVisible] = useState(false);
  const [upsellProductSlug, setUpsellProductSlug] = useState<string | null>(null);

  const upsellProduct = useMemo(
    () => (upsellProductSlug ? getProductBySlug(upsellProductSlug) : undefined),
    [upsellProductSlug],
  );

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim() || !phone.trim()) {
      setError('الاسم ورقم الجوال مطلوبين');
      return;
    }
    if (!isValidUaePhone(phone)) {
      setError('رقم جوال إماراتي غير صحيح — مثال: 501234567');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const payload = {
        eventName: 'Purchase',
        customerName: name.trim(),
        phone: `${market.phoneCountryCode}${phone.replace(/\D/g, '')}`,
        area: area.trim(),
        items: items.map((i) => ({
          sku: i.sku,
          name: i.name,
          qty: i.qty,
          price: i.price,
          offerId: i.offerId,
        })),
        total,
        currency: market.currency,
        paymentMethod: 'COD',
      };

      let orderId = `LARA-${Date.now()}`;

      if (apiUrl) {
        const res = await fetch(`${apiUrl}/api/v1/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: name.trim(),
            phone: phone.replace(/\D/g, ''),
            area: area.trim(),
            items: items.map((i) => ({
              productId: i.productId,
              sku: i.sku,
              name: i.name,
              bundleId: i.offerId,
              unitPriceAed: i.price,
              quantity: i.offerQuantity * i.qty,
            })),
            sourceUrl: typeof window !== 'undefined' ? window.location.href : '',
            eventId: `purchase_${Date.now()}`,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || data.error || 'order_failed');
        }
        orderId = data.orderNumber || data.orderId || orderId;
      }

      sessionStorage.setItem('lara-last-order', JSON.stringify({ ...payload, orderId }));

      const firstSlug = items[0]?.slug;
      const prod = firstSlug ? getProductBySlug(firstSlug) : products[0];
      if (prod?.upsell.enabled) {
        setUpsellProductSlug(prod.slug);
        setUpsellVisible(true);
        trackEvent('UpsellView', { product_id: prod.id, value: prod.upsell.price });
        setTimeout(() => {
          setUpsellVisible(false);
          clear();
          setOpen(false);
          router.push(`/thank-you?order=${orderId}`);
        }, 12000);
        return;
      }

      clear();
      setOpen(false);
      router.push(`/thank-you?order=${orderId}`);
    } catch {
      setError('صار خطأ — حاولي مرة ثانية');
    } finally {
      setLoading(false);
    }
  }

  function acceptUpsell() {
    if (!upsellProduct) return;
    const extra = upsellProduct.offers[0];
    if (extra) {
      addOffer(upsellProduct, { ...extra, price: upsellProduct.upsell.price, label: upsellProduct.upsell.label });
      trackEvent('UpsellAccepted', { value: upsellProduct.upsell.price });
    }
    finishAfterUpsell();
  }

  function skipUpsell() {
    trackEvent('UpsellSkipped');
    finishAfterUpsell();
  }

  function finishAfterUpsell() {
    const raw = sessionStorage.getItem('lara-last-order');
    const orderId = raw ? JSON.parse(raw).orderId : '';
    setUpsellVisible(false);
    clear();
    setOpen(false);
    router.push(`/thank-you?order=${orderId}`);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-6 shadow-2xl sm:rounded-2xl"
        role="dialog"
        aria-labelledby="checkout-title"
      >
        {upsellVisible && upsellProduct ? (
          <div className="text-center">
            <h2 className="font-arabic text-lg font-bold text-primary">عرض خاص — ثواني بس!</h2>
            <p className="mt-2 text-sm text-muted">{upsellProduct.upsell.subtitle}</p>
            <p className="mt-4 font-arabic text-2xl font-bold text-accent">
              {formatPrice(upsellProduct.upsell.price)}
            </p>
            <p className="text-sm font-semibold text-primary">{upsellProduct.upsell.label}</p>
            <button
              type="button"
              onClick={acceptUpsell}
              className="mt-6 w-full rounded-xl bg-primary py-4 font-arabic text-sm font-bold text-white"
            >
              نعم، أضيفي العرض
            </button>
            <button
              type="button"
              onClick={skipUpsell}
              className="mt-3 w-full py-2 text-sm text-muted"
            >
              لا شكراً
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 id="checkout-title" className="font-arabic text-lg font-bold text-primary">
                تأكيد الطلب — دفع عند الاستلام
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-muted hover:bg-surface"
                aria-label="إغلاق"
              >
                ✕
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-center text-sm text-muted">السلة فاضية</p>
            ) : (
              <>
                <ul className="mb-4 space-y-2 border-b border-border pb-4 text-sm">
                  {items.map((i) => (
                    <li key={`${i.productId}-${i.offerId}`} className="flex justify-between gap-2">
                      <span className="font-arabic text-primary">
                        {i.offerLabel} × {i.qty}
                      </span>
                      <span className="font-semibold text-primary">
                        {formatPrice(i.price * i.qty)}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mb-4 text-left font-arabic text-base font-bold text-primary">
                  المجموع: {formatPrice(total)}
                </p>

                <form onSubmit={submit} className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">الاسم الكامل</label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-primary"
                      placeholder="مثال: نورة العتيبي"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">رقم الجوال</label>
                    <div className="flex gap-2" dir="ltr">
                      <span className="flex items-center rounded-xl border border-border bg-surface px-3 text-sm text-muted">
                        {market.phoneCountryCode}
                      </span>
                      <input
                        required
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-primary"
                        placeholder={market.phoneExample}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">المنطقة / العنوان</label>
                    <input
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-primary"
                      placeholder="مثال: دبي، الشارقة، أبوظبي..."
                    />
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-primary py-4 font-arabic text-sm font-bold text-white disabled:opacity-60"
                  >
                    {loading ? 'جاري الإرسال...' : 'أكّدي الطلب — COD'}
                  </button>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
