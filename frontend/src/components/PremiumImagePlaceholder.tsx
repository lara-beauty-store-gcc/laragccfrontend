import Image from 'next/image';
import type { ProductConfig } from '@/config/products';
import { businessInputs } from '@/config/business';

const { brand } = businessInputs;
import { businessInputs } from '@/config/business';

const { brand } = businessInputs;

const hues: Record<ProductConfig['placeholderHue'], string> = {
  teal: 'from-teal-100 via-emerald-50 to-teal-200',
  amber: 'from-amber-100 via-orange-50 to-amber-200',
  indigo: 'from-indigo-100 via-violet-50 to-indigo-200',
};

export function PremiumImagePlaceholder({
  product,
  className = '',
  variant = 'product',
}: {
  product?: Pick<ProductConfig, 'placeholderHue' | 'shortName' | 'name'>;
  className?: string;
  variant?: 'hero' | 'product';
}) {
  const hue = product?.placeholderHue ?? 'teal';
  const label = product?.shortName ?? 'لارا';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${hues[hue]} ${className}`}
      role="img"
      aria-label={product?.name ?? 'صورة المنتج'}
    >
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
      <div className="relative flex h-full min-h-[220px] flex-col items-center justify-center p-6 text-center">
        {variant === 'hero' ? (
          <>
            <div className="mb-4 flex gap-3">
              {(['teal', 'amber', 'indigo'] as const).map((h) => (
                <div
                  key={h}
                  className={`h-24 w-14 rounded-xl border border-white/60 bg-gradient-to-b ${hues[h]} shadow-soft`}
                />
              ))}
            </div>
            <p className="text-sm font-medium text-primary/80">صورة قريباً</p>
          </>
        ) : (
          <>
            <div
              className={`mb-4 h-40 w-24 rounded-2xl border-2 border-white/70 bg-gradient-to-b ${hues[hue]} shadow-card`}
            />
            <p className="text-sm font-semibold text-primary">{label}</p>
            <p className="mt-1 text-xs text-muted">صورة قريباً</p>
          </>
        )}
      </div>
    </div>
  );
}

export function BrandLogo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 36 : 44;
  return (
    <Image
      src="/images/logo.svg"
      alt="لارا للجمال"
      width={dim}
      height={dim}
      className="shrink-0 object-contain"
    />
  );
}
