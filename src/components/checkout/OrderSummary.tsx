'use client';

import Image from 'next/image';
import type { CartLine } from '@/lib/cart';
import { businessConfig } from '@/config/business';
import type { CheckoutTotals } from '@/lib/checkout-pricing';
import { formatPrice } from '@/lib/pricing';
import { cartLineImage } from '@/lib/cart-images';

const { checkout } = businessConfig;

type OrderSummaryProps = {
  items: CartLine[];
  totals: CheckoutTotals;
};

export function OrderSummary({ items, totals }: OrderSummaryProps) {
  return (
    <section
      className="rounded-2xl border border-border/80 bg-white p-4 shadow-card"
      aria-label={checkout.summaryTitle}
    >
      <h3 className="mb-3 font-arabic text-sm font-extrabold text-foreground">{checkout.summaryTitle}</h3>

      <ul className="space-y-3 border-b border-border/70 pb-3">
        {items.map((line) => {
          const lineTotal = line.price * line.qty;
          const units = line.offerQuantity * line.qty;
          const image = cartLineImage(line.slug);

          return (
            <li key={`${line.productId}-${line.offerId}`} className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-rose">
                <Image src={image} alt={line.name} fill className="object-cover" sizes="56px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 font-arabic text-sm font-bold leading-snug text-foreground">
                  {line.name}
                </p>
                <p className="mt-0.5 text-xs text-muted">{line.offerLabel}</p>
              </div>
              <div className="shrink-0 text-left">
                <p className="font-arabic text-sm font-extrabold tabular-nums text-primary">
                  {formatPrice(lineTotal)}
                </p>
                <p className="text-[10px] text-muted">× {units}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3 text-muted">
          <dt>{checkout.subtotalLabel}</dt>
          <dd className="font-semibold tabular-nums text-foreground">{formatPrice(totals.subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 text-muted">
          <dt>{checkout.deliveryLabel}</dt>
          <dd className="flex items-center gap-2">
            {totals.isDeliveryFree ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                {totals.deliveryLabel}
              </span>
            ) : null}
            <span className="font-semibold tabular-nums text-foreground">
              {totals.isDeliveryFree ? formatPrice(0) : totals.deliveryLabel}
            </span>
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-[#FFF0F0] px-4 py-3">
        <dt className="font-arabic text-sm font-extrabold text-foreground">{checkout.grandTotalLabel}</dt>
        <dd className="font-arabic text-2xl font-extrabold tabular-nums text-primary">
          {formatPrice(totals.total)}
        </dd>
      </div>
    </section>
  );
}
