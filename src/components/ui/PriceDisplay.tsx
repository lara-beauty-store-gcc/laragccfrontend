import { formatPrice, formatSavings, offerSavings, perUnitPrice } from '@/lib/pricing';
import type { ProductOffer } from '@/config/types';

/** Aligned price block for offer cards and checkout — tabular nums, consistent layout */
export function PriceDisplay({
  offer,
  size = 'md',
}: {
  offer: Pick<ProductOffer, 'price' | 'compareAtPrice' | 'quantity'>;
  size?: 'sm' | 'md' | 'lg';
}) {
  const savings = offerSavings(offer as ProductOffer);
  const hasCompare = savings != null && savings > 0;
  const unit = perUnitPrice(offer);

  const priceClass =
    size === 'lg'
      ? 'text-2xl'
      : size === 'sm'
        ? 'text-base'
        : 'text-xl';

  return (
    <div className="flex min-w-[5.5rem] flex-col items-end gap-0.5 tabular-nums">
      {hasCompare ? (
        <span className="text-xs font-medium text-muted line-through decoration-muted/70">
          {formatPrice(offer.compareAtPrice!)}
        </span>
      ) : null}
      <span className={`whitespace-nowrap font-arabic font-extrabold leading-none text-primary ${priceClass}`}>
        {formatPrice(offer.price)}
      </span>
      {offer.quantity > 1 ? (
        <span className="whitespace-nowrap text-[10px] font-medium text-muted">
          {formatPrice(unit)} / علبة
        </span>
      ) : null}
      {formatSavings(offer as ProductOffer) ? (
        <span className="whitespace-nowrap rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
          {formatSavings(offer as ProductOffer)}
        </span>
      ) : null}
    </div>
  );
}
