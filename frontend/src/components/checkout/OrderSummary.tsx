'use client';

import type { CartLine } from '@/lib/cart';
import { businessConfig } from '@/config/business';
import type { CheckoutTotals } from '@/lib/checkout-pricing';
import { formatPrice } from '@/lib/pricing';

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

          return (
            <li key={`${line.productId}-${line.offerId}`} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="line-clamp-2 font-arabic text-sm font-bold leading-snug text-foreground">
                  {line.name}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {line.offerLabel} · الكمية × {units}
                </p>
              </div>
              <p className="shrink-0 font-arabic text-sm font-extrabold tabular-nums text-primary">
                {formatPrice(lineTotal)}
              </p>
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
          <dd
            className={`font-semibold tabular-nums ${
              totals.isDeliveryFree ? 'text-emerald-700' : 'text-foreground'
            }`}
          >
            {totals.deliveryLabel}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-3">
          <dt className="font-arabic text-base font-extrabold text-foreground">{checkout.totalLabel}</dt>
          <dd className="font-arabic text-xl font-extrabold tabular-nums text-primary">
            {formatPrice(totals.total)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
