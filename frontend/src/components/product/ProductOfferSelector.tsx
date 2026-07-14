'use client';

import { CircleCheckBig } from 'lucide-react';
import type { ProductConfig } from '@/config/products';
import type { ProductOffer } from '@/config/types';
import { formatPrice, formatSavings, offerSavings } from '@/lib/pricing';

export function ProductOfferSelector({
  product,
  selectedId,
  onSelect,
}: {
  product: ProductConfig;
  selectedId: string;
  onSelect: (offer: ProductOffer) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-arabic text-sm font-extrabold text-foreground">اختاري العرض:</p>
        <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-bold text-primary">
          نتيجة من العلبة الأولى
        </span>
      </div>
      {product.offers.map((offer) => {
        const selected = offer.id === selectedId;
        const savings = formatSavings(offer);
        const hasCompare =
          offer.compareAtPrice != null &&
          offer.compareAtPrice > offer.price &&
          offerSavings(offer) != null;

        return (
          <button
            key={offer.id}
            type="button"
            onClick={() => onSelect(offer)}
            className={`flex w-full flex-col gap-3 rounded-2xl border-2 p-4 text-right transition-all duration-200 ${
              selected
                ? 'border-primary bg-primary/5 shadow-soft'
                : 'border-border bg-white hover:border-primary/30'
            }`}
          >
            {offer.badge ? (
              <span className="w-fit self-end rounded-full bg-secondary px-3 py-1 text-[10px] font-bold leading-none text-primary-dark">
                {offer.badge}
              </span>
            ) : null}

            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    selected ? 'border-primary bg-primary text-white' : 'border-border bg-white'
                  }`}
                >
                  {selected ? <CircleCheckBig className="h-3 w-3" aria-hidden /> : null}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-arabic text-sm font-extrabold leading-snug text-foreground">
                    {offer.label}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{offer.subtitle}</p>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-start gap-1 border-s border-border/60 ps-4">
                {hasCompare ? (
                  <span className="whitespace-nowrap text-xs text-muted line-through decoration-muted/80">
                    {formatPrice(offer.compareAtPrice!)}
                  </span>
                ) : null}
                <span className="whitespace-nowrap font-arabic text-lg font-extrabold leading-none text-primary">
                  {formatPrice(offer.price)}
                </span>
                {savings ? (
                  <span className="whitespace-nowrap text-[11px] font-bold text-emerald-700">{savings}</span>
                ) : null}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
