'use client';

import Image from 'next/image';
import type { CartLine } from '@/lib/cart';
import { formatPrice } from '@/lib/pricing';
import { cartLineImage } from '@/lib/cart-images';

type CheckoutProductSummaryProps = {
  items: CartLine[];
};

export function CheckoutProductSummary({ items }: CheckoutProductSummaryProps) {
  return (
    <div className="space-y-3">
      {items.map((line) => {
        const image = cartLineImage(line.slug);
        const lineTotal = line.price * line.qty;

        return (
          <article
            key={`${line.productId}-${line.offerId}`}
            className="flex min-w-0 items-center gap-3 rounded-2xl border border-border/80 bg-white p-3"
          >
            <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-surface-rose">
              <Image
                src={image}
                alt={line.offerLabel}
                fill
                className="object-cover"
                sizes="72px"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 font-arabic text-sm font-extrabold leading-snug text-foreground">
                {line.name}
              </p>
              <p className="mt-1 line-clamp-1 text-xs text-muted">{line.offerLabel}</p>
            </div>

            <p className="shrink-0 font-arabic text-base font-extrabold tabular-nums text-primary">
              {formatPrice(lineTotal)}
            </p>
          </article>
        );
      })}
    </div>
  );
}
