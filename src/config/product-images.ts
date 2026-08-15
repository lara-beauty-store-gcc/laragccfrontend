/** Product images in public/images/products/ — WebP for fast EasyPanel deploy */
const BASE = '/images/products';

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
