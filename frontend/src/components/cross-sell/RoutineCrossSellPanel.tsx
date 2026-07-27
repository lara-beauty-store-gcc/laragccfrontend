'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Check, MessageCircle, Sparkles } from 'lucide-react';
import { businessConfig } from '@/config/business';
import type { ProductConfig } from '@/config/products';
import {
  buildWhatsAppMultiAddOnUrl,
  crossSellPrice,
  getCrossSellProducts,
} from '@/lib/cross-sell';
import type { LastOrder } from '@/lib/order-session';
import { formatPrice } from '@/lib/pricing';
import { trackEvent } from '@/lib/tracking';

const { support } = businessConfig;

type RoutineCrossSellPanelProps = {
  order: LastOrder;
  variant: 'checkout' | 'thankyou';
  onSkip: () => void;
  skipLabel?: string;
};

export function RoutineCrossSellPanel({
  order,
  variant,
  onSkip,
  skipLabel = 'لا شكراً — كملي للتأكيد',
}: RoutineCrossSellPanelProps) {
  const suggestions = useMemo(() => getCrossSellProducts(order), [order]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (suggestions.length) {
      trackEvent('CrossSellView', { count: suggestions.length, placement: variant });
    }
  }, [suggestions.length, variant]);

  const selectedProducts = suggestions.filter((p) => selected.has(p.id));
  const waUrl =
    selectedProducts.length > 0
      ? buildWhatsAppMultiAddOnUrl(order, selectedProducts, support.whatsappNumber)
      : null;

  function toggle(productId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  if (suggestions.length === 0) return null;

  const title =
    variant === 'checkout' ? 'قبل التأكيد — كمّلي روتينك؟' : 'كمّلي روتينك';
  const subtitle =
    variant === 'checkout'
      ? 'اختاري منتجات تانية تزيديهم لنفس الطلب — أو تخطي وكملي للتأكيد.'
      : 'اختاري منتجات تانية تزيديهم لنفس الطلب عبر واتساب.';

  return (
    <div className={variant === 'checkout' ? '' : 'rounded-3xl border border-border bg-white p-5 shadow-card'}>
      <div className={`flex items-start gap-3 ${variant === 'checkout' ? 'mb-4' : 'mb-4'}`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary-soft">
          <Sparkles className="h-5 w-5 text-secondary" aria-hidden />
        </span>
        <div>
          <p className="font-arabic text-sm font-extrabold text-primary">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">{subtitle}</p>
        </div>
      </div>

      <div className="space-y-3">
        {suggestions.map((product) => (
          <CrossSellSelectableCard
            key={product.id}
            order={order}
            product={product}
            checked={selected.has(product.id)}
            onToggle={() => toggle(product.id)}
          />
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent('CrossSellClick', {
                placement: variant,
                count: selectedProducts.length,
                product_ids: selectedProducts.map((p) => p.id).join(','),
              })
            }
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 font-arabic text-sm font-bold text-white shadow-md"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            أضيفي المختار عبر واتساب ({selectedProducts.length})
          </a>
        ) : (
          <p className="text-center text-[11px] text-muted">اختاري منتج واحد على الأقل للإضافة</p>
        )}

        <button type="button" onClick={onSkip} className="w-full py-2.5 text-center text-xs font-medium text-muted">
          {skipLabel}
        </button>
      </div>
    </div>
  );
}

function CrossSellSelectableCard({
  product,
  checked,
  onToggle,
}: {
  order: LastOrder;
  product: ProductConfig;
  checked: boolean;
  onToggle: () => void;
}) {
  const price = crossSellPrice(product);
  const image = product.collectionImage ?? '/images/products/home-hero.webp';

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full gap-3 rounded-2xl border-2 p-3 text-right transition ${
        checked ? 'border-primary bg-primary/5' : 'border-border bg-surface-rose/50 hover:border-primary/30'
      }`}
    >
      <div
        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
          checked ? 'border-primary bg-primary text-white' : 'border-border bg-white'
        }`}
      >
        {checked ? <Check className="h-3 w-3" strokeWidth={3} aria-hidden /> : null}
      </div>

      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white">
        <Image src={image} alt={product.collectionImageAlt ?? product.shortName} fill className="object-cover" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-arabic text-sm font-extrabold text-foreground">{product.shortName}</p>
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted">{product.cardHeadline}</p>
        <p className="mt-1 font-arabic text-sm font-extrabold tabular-nums text-primary">من {formatPrice(price)}</p>
      </div>

      <Link
        href={`/products/${product.slug}`}
        onClick={(e) => e.stopPropagation()}
        className="self-center text-[10px] font-semibold text-primary underline"
      >
        التفاصيل
      </Link>
    </button>
  );
}
