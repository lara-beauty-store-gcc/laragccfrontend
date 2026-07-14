import type { ProductConfig } from '@/config/products';
import type { ProductImages } from '@/config/types';
import { MediaFrame } from '@/components/ui/MediaFrame';
import type { ImageLayoutKey } from '@/config/image-layout';

const hues: Record<ProductConfig['placeholderHue'], string> = {
  teal: 'from-teal-100 via-emerald-50 to-teal-200',
  amber: 'from-amber-100 via-orange-50 to-amber-200',
  indigo: 'from-indigo-100 via-violet-50 to-indigo-200',
};

type MediaKey = keyof ProductImages;

const layoutByVariant: Record<'hero' | 'card' | 'square' | 'section', ImageLayoutKey> = {
  hero: 'productHero',
  square: 'sectionPortrait',
  section: 'sectionPortrait',
  card: 'sectionPortrait',
};

export function ProductMedia({
  product,
  imageKey,
  alt,
  className = '',
  frameClassName = '',
  variant = 'section',
}: {
  product: ProductConfig;
  imageKey: MediaKey;
  alt: string;
  className?: string;
  frameClassName?: string;
  variant?: 'hero' | 'card' | 'square' | 'section';
}) {
  const src = product.images[imageKey] || '';
  const layout = layoutByVariant[variant];
  const hue = product.placeholderHue;

  if (src) {
    return (
      <MediaFrame
        src={src}
        alt={alt}
        layout={layout}
        priority={variant === 'hero'}
        className={className}
        frameClassName={frameClassName}
      />
    );
  }

  const aspectClass =
    layout === 'productHero' ? 'aspect-square' : layout === 'sectionPortrait' ? 'aspect-[4/5]' : 'aspect-square';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${hues[hue]} ${aspectClass} min-h-[240px] w-full ${className}`}
      role="img"
      aria-label={alt}
    >
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_70%_30%,white,transparent_55%)]" />
      <div className="relative flex h-full min-h-[240px] flex-col items-center justify-center p-6 text-center">
        <div
          className={`mb-3 h-32 w-20 rounded-2xl border-2 border-white/70 bg-gradient-to-b ${hues[hue]} shadow-card`}
        />
        <p className="text-sm font-semibold text-primary">{product.shortName}</p>
        <p className="mt-1 text-xs text-muted">صورة قريباً</p>
      </div>
    </div>
  );
}
