'use client';

import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { CartQuantityControl } from '@/components/cart/CartQuantityControl';
import type { CartLine } from '@/lib/cart';
import { formatPrice } from '@/lib/pricing';
import { cartLineImage } from '@/lib/cart-images';

type CheckoutProductSummaryProps = {
  items: CartLine[];
  onUpdateQty: (productId: string, offerId: string, qty: number) => void;
  onRemove: (productId: string, offerId: string) => void;
};

export function CheckoutProductSummary({ items, onUpdateQty, onRemove }: CheckoutProductSummaryProps) {
  return (
    <div className="space-y-3">
      {items.map((line) => {
        const image = cartLineImage(line.slug);
        const lineTotal = line.price * line.qty;

        return (
          <article
            key={`${line.productId}-${line.offerId}`}
            className="rounded-2xl border border-border/80 bg-white p-3"
          >
            <div className="flex min-w-0 items-start gap-3">
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
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="line-clamp-2 font-arabic text-sm font-extrabold leading-snug text-foreground">
                      {line.name}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-muted">{line.offerLabel}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemove(line.productId, line.offerId)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-red-50 hover:text-red-600"
                    aria-label={`حذف ${line.offerLabel}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <CartQuantityControl
                    qty={line.qty}
                    size="sm"
                    onDecrease={() => onUpdateQty(line.productId, line.offerId, line.qty - 1)}
                    onIncrease={() => onUpdateQty(line.productId, line.offerId, line.qty + 1)}
                  />

                  <div className="text-left">
                    <p className="font-arabic text-base font-extrabold tabular-nums text-primary">
                      {formatPrice(lineTotal)}
                    </p>
                    {line.qty > 1 ? (
                      <p className="text-[10px] tabular-nums text-muted">{formatPrice(line.price)} / وحدة</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
