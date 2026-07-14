/**
 * Canonical display sizes — keep CSS frames aligned with files in public/images/products/.
 *
 * Export guide:
 * - hero.webp (before/after): 1200×1200 (1:1)
 * - problem.webp, ingredients.webp: 960×1200 (4:5)
 * - {slug}.webp (homepage card): 1000×1000 (1:1)
 * - home-hero.webp: 1200×800 (3:2)
 */

export const IMAGE_LAYOUT = {
  /** Product PDP — before/after top */
  productHero: {
    aspect: 'aspect-square',
    frame: 'relative w-full max-w-lg overflow-hidden rounded-3xl border-8 border-white bg-surface-rose shadow-2xl',
    sizes: '(max-width: 512px) 100vw, 512px',
    object: 'object-cover object-center',
  },
  /** Homepage hero */
  homeHero: {
    aspect: 'aspect-[3/2] w-full max-w-lg',
    frame:
      'relative overflow-hidden rounded-[2rem] border-8 border-white bg-surface-rose shadow-xl sm:rounded-[3rem]',
    sizes: '(max-width: 768px) 100vw, 560px',
    object: 'object-cover object-center',
  },
  /** Homepage product cards */
  collection: {
    aspect: 'aspect-square w-full',
    frame: 'relative overflow-hidden rounded-2xl',
    sizes: '(max-width: 640px) 90vw, 400px',
    object: 'object-cover object-center',
  },
  /** PDP sections — problem / ingredients */
  sectionPortrait: {
    aspect: 'aspect-[4/5] w-full',
    frame: 'relative overflow-hidden',
    sizes: '(max-width: 448px) 90vw, 448px',
    object: 'object-cover object-center',
  },
  /** Related products thumbnail */
  thumb: {
    aspect: 'aspect-square w-full',
    frame: 'relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-surface-rose',
    sizes: '112px',
    object: 'object-cover object-center',
  },
} as const;

export type ImageLayoutKey = keyof typeof IMAGE_LAYOUT;
