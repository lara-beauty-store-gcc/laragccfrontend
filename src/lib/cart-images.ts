import { collectionImageFor, PRODUCT_COLLECTION_IMAGES } from '@/config/product-images';

export function cartLineImage(slug: string): string {
  if (slug in PRODUCT_COLLECTION_IMAGES) {
    return collectionImageFor(slug as keyof typeof PRODUCT_COLLECTION_IMAGES);
  }
  return '/images/products/home-hero.webp';
}
