'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductConfig } from '@/config/products';
import { publicProductImageSrc } from '@/config/product-images';
import { IMAGE_LAYOUT } from '@/config/image-layout';

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

function HeroSlide({
  src,
  alt,
  priority,
  onMissing,
}: {
  src: string;
  alt: string;
  priority: boolean;
  onMissing: () => void;
}) {
  const preset = IMAGE_LAYOUT.productHero;

  return (
    <div className={preset.frame}>
      <div className={`relative ${preset.aspect}`}>
        <Image
          src={src}
          alt={alt}
          fill
          className={preset.object}
          sizes={preset.sizes}
          priority={priority}
          unoptimized
          onError={onMissing}
        />
      </div>
    </div>
  );
}

/** Hero gallery — first image default; skips missing files; swipe / dots when 2+ */
export function ProductImageCarousel({ product }: { product: ProductConfig }) {
  const allSlides = useMemo(() => slidesFor(product), [product]);
  const [broken, setBroken] = useState<Set<string>>(() => new Set());

  const markBroken = useCallback((src: string) => {
    setBroken((prev) => {
      if (prev.has(src)) return prev;
      const next = new Set(prev);
      next.add(src);
      return next;
    });
  }, []);

  const slides = allSlides.filter((s) => !broken.has(s.src));
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= slides.length && slides.length > 0) {
      setIndex(0);
    }
  }, [index, slides.length]);

  if (slides.length === 0) {
    return (
      <div className="aspect-square w-full max-w-lg rounded-3xl border-8 border-white bg-surface-rose shadow-2xl" />
    );
  }

  const safeIndex = Math.min(index, slides.length - 1);
  const current = slides[safeIndex];
  const go = (next: number) => setIndex((next + slides.length) % slides.length);

  if (slides.length === 1) {
    return (
      <HeroSlide
        src={current.src}
        alt={current.alt}
        priority
        onMissing={() => markBroken(current.src)}
      />
    );
  }

  return (
    <div className="relative w-full max-w-lg">
      <HeroSlide
        key={current.src}
        src={current.src}
        alt={current.alt}
        priority={safeIndex === 0}
        onMissing={() => markBroken(current.src)}
      />

      <button
        type="button"
        onClick={() => go(safeIndex - 1)}
        className="absolute start-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-foreground shadow-md backdrop-blur-sm transition hover:bg-white"
        aria-label="الصورة السابقة"
      >
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => go(safeIndex + 1)}
        className="absolute end-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-foreground shadow-md backdrop-blur-sm transition hover:bg-white"
        aria-label="الصورة التالية"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>

      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
        {slides.map((_, i) => (
          <button
            key={slides[i].src}
            type="button"
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${
              i === safeIndex ? 'w-6 bg-primary' : 'w-2 bg-white/80'
            }`}
            aria-label={`صورة ${i + 1}`}
            aria-current={i === safeIndex}
          />
        ))}
      </div>
    </div>
  );
}
