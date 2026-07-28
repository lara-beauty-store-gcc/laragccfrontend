'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartLine } from '@/lib/cart';
import { formatPrice } from '@/lib/pricing';
import { cartLineImage } from '@/lib/cart-images';

type CartLineItemProps = {
  line: CartLine;
  onRemove: () => void;
  onUpdateQty: (qty: number) => void;
  compact?: boolean;
};

export function CartLineItem({ line, onRemove, onUpdateQty, compact = false }: CartLineItemProps) {
  const image = cartLineImage(line.slug);
  const lineTotal = line.price * line.qty;

  return (
    <article
      className={`group flex min-w-0 max-w-full gap-3 rounded-2xl border border-border bg-white transition ${
        compact ? 'p-3' : 'p-3.5 shadow-sm'
      }`}
    >
      <Link
        href={`/products/${line.slug}`}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-rose"
      >
        <Image src={image} alt={line.offerLabel} fill className="object-cover" sizes="80px" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/products/${line.slug}`}
              className="line-clamp-1 font-arabic text-sm font-extrabold text-foreground hover:text-primary"
            >
              {line.offerLabel}
            </Link>
            <p className="mt-0.5 line-clamp-1 text-[11px] text-muted">{line.name}</p>
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-red-50 hover:text-red-600"
            aria-label={`حذف ${line.offerLabel}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div className="inline-flex items-center rounded-xl border border-border bg-surface">
            <button
              type="button"
              onClick={() => onUpdateQty(line.qty - 1)}
              disabled={line.qty <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-r-xl text-foreground transition hover:bg-white disabled:opacity-40"
              aria-label="نقصي الكمية"
            >
              <Minus className="h-3.5 w-3.5" aria-hidden />
            </button>
            <span className="min-w-[2rem] text-center text-sm font-bold tabular-nums text-foreground">
              {line.qty}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQty(line.qty + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-l-xl text-foreground transition hover:bg-white"
              aria-label="زيدي الكمية"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>

          <div className="text-left">
            <p className="font-arabic text-sm font-extrabold tabular-nums text-primary">
              {formatPrice(lineTotal)}
            </p>
            {line.qty > 1 ? (
              <p className="text-[10px] tabular-nums text-muted">{formatPrice(line.price)} / وحدة</p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
