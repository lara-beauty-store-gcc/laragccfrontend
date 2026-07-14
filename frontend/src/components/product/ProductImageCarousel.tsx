import type { ProductConfig } from '@/config/products';
import { MediaFrame } from '@/components/ui/MediaFrame';

/** Single before/after hero — top of product page only (no carousel). */
export function ProductImageCarousel({ product }: { product: ProductConfig }) {
  const src = product.images.heroBeforeAfter;
  const alt = product.imageAlts.heroBeforeAfter ?? product.name;

  if (!src) {
    return (
      <div className="aspect-square w-full max-w-lg rounded-3xl border-8 border-white bg-surface-rose shadow-2xl" />
    );
  }

  return <MediaFrame src={src} alt={alt} layout="productHero" priority />;
}
