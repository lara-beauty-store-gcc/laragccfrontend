/** Product images in public/images/products/ — WebP for fast EasyPanel deploy */
const BASE = '/images/products';

/** User upload — first hero slide on every product page (add second in heroGallery per slug) */
export const PRODUCT_GALLERY_PRIMARY_FILENAME = 'ChatGPT Image Sep 24, 2026, 07_16_34 PM.png';

export const PRODUCT_GALLERY_PRIMARY = `${BASE}/${PRODUCT_GALLERY_PRIMARY_FILENAME}`;

export const PRODUCT_COLLECTION_IMAGES = {
  'magnesium-sleep': `${BASE}/magnesium-sleep.webp`,
  'epimedium-energy': `${BASE}/epimedium-energy.webp`,
  'focus-clarity': `${BASE}/focus-clarity.webp`,
} as const;

export const homeHeroImagePath = `${BASE}/home-hero.webp`;

export function collectionImageFor(slug: keyof typeof PRODUCT_COLLECTION_IMAGES) {
  return PRODUCT_COLLECTION_IMAGES[slug];
}

export type ProductPageSlug = keyof typeof PRODUCT_COLLECTION_IMAGES;

/** Encode filename for Next/Image when path contains spaces */
export function publicProductImageSrc(path: string): string {
  if (!path.startsWith('/')) return path;
  const slash = path.lastIndexOf('/');
  if (slash < 0) return path;
  const dir = path.slice(0, slash + 1);
  const file = path.slice(slash + 1);
  return `${dir}${encodeURIComponent(file)}`;
}

export function productPageImagesFull(slug: ProductPageSlug) {
  const dir = `${BASE}/${slug}`;
  return {
    heroBeforeAfter: `${dir}/hero.webp`,
    heroProduct: `${dir}/hero.webp`,
    problemImage: `${dir}/problem.webp`,
    ingredientImage: `${dir}/ingredients.webp`,
    authorityImage: '',
    lifestyleImage: '',
    testimonialImage: '',
    comparisonImage: '',
  };
}

/** Hero carousel: [1] user PNG, [2] existing hero — add more paths here when ready */
export function productHeroGallery(slug: ProductPageSlug): string[] {
  const secondary = `${BASE}/${slug}/hero.webp`;
  return [PRODUCT_GALLERY_PRIMARY, secondary];
}
