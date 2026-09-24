'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductConfig } from '@/config/products';
import { publicProductImageSrc } from '@/config/product-images';
import { MediaFrame } from '@/components/ui/MediaFrame';

function slidesFor(product: ProductConfig): { src: string; alt: string }[] {
  const baseAlt = product.imageAlts.heroBeforeAfter ?? product.name;
  const paths =
    product.heroGallery?.filter(Boolean) ??
    (product.images.heroBeforeAfter ? [product.images.heroBeforeAfter] : []);

  return paths.map((src, index) => ({
    src: publicProductImageSrc(src),
    alt: index === 0 ? baseAlt : `${baseAlt} — ${index + 1}`,
  }));
}

/** Hero gallery — first image is default; swipe / dots when multiple slides */
export function ProductImageCarousel({ product }: { product: ProductConfig }) {
  const slides = slidesFor(product);
  const [index, setIndex] = useState(0);

  if (slides.length === 0) {
    return (
      <div className="aspect-square w-full max-w-lg rounded-3xl border-8 border-white bg-surface-rose shadow-2xl" />
    );
  }

  if (slides.length === 1) {
    return (
      <MediaFrame src={slides[0].src} alt={slides[0].alt} layout="productHero" priority />
    );
  }

  const current = slides[index];
  const go = (next: number) => setIndex((next + slides.length) % slides.length);

  return (
    <div className="relative w-full max-w-lg">
      <MediaFrame
        src={current.src}
        alt={current.alt}
        layout="productHero"
        priority={index === 0}
        key={current.src}
      />

      <button
        type="button"
        onClick={() => go(index - 1)}
        className="absolute start-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-foreground shadow-md backdrop-blur-sm transition hover:bg-white"
        aria-label="الصورة السابقة"
      >
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => go(index + 1)}
        className="absolute end-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-foreground shadow-md backdrop-blur-sm transition hover:bg-white"
        aria-label="الصورة التالية"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>

      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${
              i === index ? 'w-6 bg-primary' : 'w-2 bg-white/80'
            }`}
            aria-label={`صورة ${i + 1}`}
            aria-current={i === index}
          />
        ))}
      </div>
    </div>
  );
}
