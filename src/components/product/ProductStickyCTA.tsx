'use client';

import { ArrowLeft } from 'lucide-react';
import type { ProductConfig } from '@/config/products';
import type { ProductOffer } from '@/config/types';
import { formatPrice, stickyCtaLabel } from '@/lib/pricing';

export function ProductStickyCTA({
  product,
  offer,
  onClick,
  visible,
}: {
  product: ProductConfig;
  offer: ProductOffer;
  onClick: () => void;
  visible: boolean;
}) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white/95 shadow-[0_-8px_30px_rgba(19,78,58,0.12)] backdrop-blur-md">
      <div className="mx-auto flex max-w-container items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="hidden min-w-0 flex-1 sm:block">
          <p className="truncate font-arabic text-xs font-bold text-foreground">{product.shortName}</p>
          <p className="font-arabic text-sm font-extrabold text-primary">{formatPrice(offer.price)}</p>
        </div>
        <button
          type="button"
          onClick={onClick}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-arabic text-sm font-bold text-white sm:flex-none sm:px-8"
        >
          {stickyCtaLabel(product)}
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
