'use client';

import Image from 'next/image';
import { Headphones, Leaf, ShieldCheck, Trash2, Truck } from 'lucide-react';
import { CartQuantityControl } from '@/components/cart/CartQuantityControl';
import { businessConfig } from '@/config/business';
import type { CheckoutTotals } from '@/lib/checkout-pricing';
import type { PaymentMethod } from '@/lib/checkout-pricing';
import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/pricing';
import { cartLineImage } from '@/lib/cart-images';

const { checkout, brand } = businessConfig;

type CheckoutSidebarProps = {
  totals: CheckoutTotals;
  paymentMethod?: PaymentMethod;
};

const TRUST_ITEMS = [
  { icon: Leaf, label: 'منتج أصلي 100%' },
  { icon: Truck, label: 'توصيل سريع في الإمارات' },
  { icon: ShieldCheck, label: 'دفع آمن عبر Stripe' },
  { icon: Headphones, label: 'دعم عملاء متواصل' },
] as const;

export function CheckoutSidebar({ totals, paymentMethod = 'card' }: CheckoutSidebarProps) {
  const { items, updateQty, remove } = useCart();

  return (
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <div className="rounded-2xl border border-border/70 bg-white p-5 shadow-card">
        <h2 className="mb-4 font-arabic text-base font-extrabold text-foreground">{checkout.summaryTitle}</h2>

        <ul className="space-y-4">
          {items.map((line) => {
            const lineTotal = line.price * line.qty;
            const units = line.offerQuantity * line.qty;

            return (
              <li
                key={`${line.productId}-${line.offerId}`}
                className="flex gap-3 border-b border-border/40 pb-4 last:border-0 last:pb-0"
              >
                <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl border border-border bg-[#FAF8F5]">
                  <Image src={cartLineImage(line.slug)} alt={line.name} fill className="object-cover" sizes="72px" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="line-clamp-2 font-arabic text-sm font-bold leading-snug text-foreground">
                        {line.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">{line.offerLabel}</p>
                      <p className="mt-0.5 text-[10px] text-muted">× {units} علبة</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(line.productId, line.offerId)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-red-50 hover:text-red-600"
                      aria-label={`حذف ${line.offerLabel}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <CartQuantityControl
                      qty={line.qty}
                      size="sm"
                      onDecrease={() => updateQty(line.productId, line.offerId, line.qty - 1)}
                      onIncrease={() => updateQty(line.productId, line.offerId, line.qty + 1)}
                    />
                    <p className="shrink-0 font-arabic text-sm font-extrabold tabular-nums text-primary">
                      {formatPrice(lineTotal)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <dl className="mt-5 space-y-2.5 border-t border-border/60 pt-4 text-sm">
          <div className="flex justify-between text-muted">
            <dt>{checkout.subtotalLabel}</dt>
            <dd className="tabular-nums text-foreground">{formatPrice(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between text-muted">
            <dt>{checkout.deliveryLabel}</dt>
            <dd className="tabular-nums">
              {totals.isDeliveryFree ? (
                <span className="font-bold text-emerald-700">{totals.deliveryLabel}</span>
              ) : (
                <span className="text-foreground">{totals.deliveryLabel}</span>
              )}
            </dd>
          </div>
          <div className="flex justify-between border-t border-border/60 pt-3">
            <dt className="font-arabic font-extrabold text-foreground">{checkout.grandTotalLabel}</dt>
            <dd className="font-arabic text-xl font-extrabold tabular-nums text-primary">
              {formatPrice(totals.total)}
            </dd>
          </div>
        </dl>

        {paymentMethod === 'card' && totals.isDeliveryFree ? (
          <p className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#E6F4EA] px-3 py-2.5 text-center text-xs font-bold text-emerald-800">
            <Truck className="h-4 w-4 shrink-0" aria-hidden />
            شحن مجاني مع الدفع بالبطاقة
          </p>
        ) : null}
      </div>

      <div className="mt-4 rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
        <p className="font-arabic text-sm font-extrabold text-foreground">لماذا {brand.nameLocal}؟</p>
        <ul className="mt-3 space-y-2.5">
          {TRUST_ITEMS.map((item) => (
            <li key={item.label} className="flex items-center gap-2.5 text-[11px] text-muted">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <item.icon className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="font-arabic font-medium">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
