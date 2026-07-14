import { businessConfig } from '@/config/business';
import type { ProductConfig } from '@/config/products';
import type { ProductOffer } from '@/config/types';

const { market } = businessConfig;

/** e.g. 189 د.إ */
export function formatPrice(amount: number): string {
  const decimals = market.currency === 'AED' ? 2 : 3;
  const fixed = amount.toFixed(decimals);
  const trimmed = fixed.replace(/\.?0+$/, '');
  return `${trimmed} ${market.currencySymbol}`;
}

/** e.g. 189 درهم إماراتي */
export function formatPriceLong(amount: number): string {
  const decimals = market.currency === 'AED' ? 2 : 3;
  const fixed = amount.toFixed(decimals);
  const trimmed = fixed.replace(/\.?0+$/, '');
  return `${trimmed} ${market.currencyName}`;
}

/** e.g. 189 د.إ — درهم إماراتي */
export function formatPriceFull(amount: number): string {
  return `${formatPrice(amount)} — ${market.currencyName}`;
}

export function formatPriceFrom(amount: number): string {
  return `يبدأ من ${formatPrice(amount)}`;
}

export function formatPriceFromLong(amount: number): string {
  return `يبدأ من ${formatPriceLong(amount)}`;
}

export function offerSavings(offer: ProductOffer): number | null {
  if (!offer.compareAtPrice || offer.compareAtPrice <= offer.price) return null;
  return offer.compareAtPrice - offer.price;
}

export function formatSavings(offer: ProductOffer): string | null {
  const s = offerSavings(offer);
  if (!s) return null;
  return `وفّري ${formatPrice(s)}`;
}

export function ctaLabel(product: ProductConfig, offer: ProductOffer): string {
  return `ابدئي ${product.shortName} الآن · ${formatPrice(offer.price)}`;
}

export function stickyCtaLabel(product: ProductConfig): string {
  return `ابدئي ${product.shortName} الآن`;
}
