'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import { businessConfig } from '@/config/business';
import type { ProductConfig } from '@/config/products';
import {
  buildWhatsAppAddOnUrl,
  crossSellPrice,
  getCrossSellProducts,
} from '@/lib/cross-sell';
import type { LastOrder } from '@/lib/order-session';
import { formatPrice } from '@/lib/pricing';
import { trackEvent } from '@/lib/tracking';

const { support } = businessConfig;

/**
 * Post-purchase cross-sell — complementary products only (Amazon/Shopify pattern).
 * Does NOT mutate order totals; add-ons go through WhatsApp on the same COD order.
 */
export function RoutineCrossSell({ order }: { order: LastOrder }) {
  const [dismissed, setDismissed] = useState(false);
  const suggestions = getCrossSellProducts(order);

  useEffect(() => {
    if (suggestions.length) {
      trackEvent('CrossSellView', { count: suggestions.length });
    }
  }, [suggestions.length]);

  if (dismissed || suggestions.length === 0) return null;

  return (
    <div className="rounded-3xl border border-border bg-white p-5 shadow-card">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary-soft">
          <Sparkles className="h-5 w-5 text-secondary" aria-hidden />
        </span>
        <div>
          <p className="font-arabic text-sm font-extrabold text-primary">كمّلي روتينك</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            عميلات الروتين الكامل كيشوفو نتيجة أوضح — أضيفي منتج ثاني لنفس الطلب عبر واتساب.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {suggestions.map((product) => (
          <CrossSellCard key={product.id} order={order} product={product} />
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          setDismissed(true);
          trackEvent('CrossSellDismissed');
        }}
        className="mt-4 w-full py-2 text-center text-xs text-muted"
      >
        لا شكراً — أكملي التأكيد
      </button>
    </div>
  );
}

function CrossSellCard({ order, product }: { order: LastOrder; product: ProductConfig }) {
  const price = crossSellPrice(product);
  const waUrl = buildWhatsAppAddOnUrl(order, product, support.whatsappNumber);
  const image = product.collectionImage ?? '/images/products/home-hero.webp';

  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-surface-rose/50 p-3">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
        <Image src={image} alt={product.collectionImageAlt ?? product.shortName} fill className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-arabic text-sm font-extrabold text-foreground">{product.shortName}</p>
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted">{product.cardHeadline}</p>
        <p className="mt-1 font-arabic text-sm font-extrabold tabular-nums text-primary">
          من {formatPrice(price)}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('CrossSellClick', { product_id: product.id, value: price })}
            className="inline-flex items-center gap-1 rounded-xl bg-[#25D366] px-3 py-2 text-[11px] font-bold text-white"
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden />
            أضيفي لطلبي
          </a>
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex items-center rounded-xl border border-border bg-white px-3 py-2 text-[11px] font-semibold text-primary"
          >
            التفاصيل
          </Link>
        </div>
      </div>
    </div>
  );
}
