'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, CircleCheckBig, Plus, Sparkles } from 'lucide-react';
import type { ProductConfig } from '@/config/products';
import {
  appendProductsToOrder,
  crossSellPrice,
  getCrossSellProducts,
} from '@/lib/cross-sell';
import { saveLastOrder, type LastOrder } from '@/lib/order-session';
import { formatPrice } from '@/lib/pricing';
import { submitOrder } from '@/lib/submit-order';
import { trackEvent } from '@/lib/tracking';

type RoutineCrossSellPanelProps = {
  order: LastOrder;
  variant: 'checkout' | 'thankyou';
  onSkip: () => void;
  onOrderUpdate?: (order: LastOrder) => void;
  skipLabel?: string;
};

const AUTO_SKIP_SECONDS = 10;

export function RoutineCrossSellPanel({
  order,
  variant,
  onSkip,
  onOrderUpdate,
  skipLabel = 'لا شكراً — كمّلي للتأكيد',
}: RoutineCrossSellPanelProps) {
  const suggestions = useMemo(() => getCrossSellProducts(order), [order]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [addedMessage, setAddedMessage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(AUTO_SKIP_SECONDS);
  const onSkipRef = useRef(onSkip);

  useEffect(() => {
    onSkipRef.current = onSkip;
  }, [onSkip]);

  useEffect(() => {
    if (variant !== 'checkout' || selected.size > 0 || syncing) return;

    setSecondsLeft(AUTO_SKIP_SECONDS);
    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          onSkipRef.current();
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [variant, selected.size, syncing, suggestions.length]);

  useEffect(() => {
    if (suggestions.length) {
      trackEvent('CrossSellView', { count: suggestions.length, placement: variant });
    }
  }, [suggestions.length, variant]);

  const selectedProducts = suggestions.filter((p) => selected.has(p.id));
  const addTotal = selectedProducts.reduce((sum, p) => sum + crossSellPrice(p), 0);

  function toggle(productId: string) {
    setAddedMessage(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  async function addSelectedToOrder() {
    if (selectedProducts.length === 0 || syncing) return;

    setSyncing(true);
    setAddedMessage(null);

    try {
      const { orderIds: newOrderIds } = await submitOrder({
        customerName: order.customerName,
        phone: order.phone,
        area: order.area,
        items: selectedProducts.map((product) => ({
          sku: product.sku,
          name: product.shortName,
          slug: product.slug,
          quantity: 1,
          lineTotal: crossSellPrice(product),
        })),
      });

      const updated = appendProductsToOrder(order, selectedProducts);
      const mergedOrderIds = [...(order.orderIds ?? [order.orderId]), ...newOrderIds];

      const saved = {
        ...updated,
        orderIds: mergedOrderIds,
        orderId: mergedOrderIds[0] ?? updated.orderId,
      };

      saveLastOrder(saved);
      onOrderUpdate?.(saved);

      trackEvent('CrossSellAccepted', {
        placement: variant,
        count: selectedProducts.length,
        value: addTotal,
        product_ids: selectedProducts.map((p) => p.id).join(','),
      });

      setSelected(new Set());
      setAddedMessage(`تمت الإضافة للطلب — المجموع الجديد: ${formatPrice(saved.total)}`);

      if (getCrossSellProducts(saved).length === 0) {
        setTimeout(() => onSkip(), 1500);
      }
    } catch {
      setAddedMessage('ما نقدر نضيف المنتجات — جربي مرة ثانية');
    } finally {
      setSyncing(false);
    }
  }

  if (suggestions.length === 0) return null;

  const title =
    variant === 'checkout'
      ? 'اقتراح: تبين تزيدين شي لنفس الطلب؟'
      : 'تبين تكمّلين روتينك؟';
  const subtitle =
    variant === 'checkout'
      ? 'اختياري تماماً — اختاري إذا تحبين، وإلا كمّلي للتأكيد مباشرة.'
      : 'اختاري منتجات ثانية تضيفينها لنفس الطلب من هنا.';

  return (
    <div className={variant === 'checkout' ? '' : 'rounded-3xl border border-border bg-white p-5 shadow-card'}>
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary-soft">
          <Sparkles className="h-5 w-5 text-secondary" aria-hidden />
        </span>
        <div>
          <p className="font-arabic text-sm font-extrabold text-primary">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">{subtitle}</p>
        </div>
      </div>

      {addedMessage ? (
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CircleCheckBig className="h-5 w-5 shrink-0" aria-hidden />
          {addedMessage}
        </div>
      ) : null}

      <div className="space-y-3">
        {suggestions.map((product) => (
          <CrossSellSelectableCard
            key={product.id}
            product={product}
            checked={selected.has(product.id)}
            onToggle={() => toggle(product.id)}
          />
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {variant === 'checkout' && selected.size === 0 && !syncing ? (
          <p className="text-center text-xs font-semibold text-muted">
            بنكمّلك للتأكيد تلقائياً خلال{' '}
            <span className="font-arabic tabular-nums text-primary">{secondsLeft}</span> ثانية
          </p>
        ) : null}

        <button
          type="button"
          onClick={onSkip}
          className="w-full rounded-2xl border-2 border-primary bg-white py-4 font-arabic text-base font-extrabold text-primary shadow-sm transition hover:bg-primary/5 active:scale-[0.99]"
        >
          {variant === 'checkout' && selected.size === 0 && !syncing
            ? `${skipLabel} (${secondsLeft})`
            : skipLabel}
        </button>

        <button
          type="button"
          disabled={selectedProducts.length === 0 || syncing}
          onClick={addSelectedToOrder}
          className="flex w-full flex-col items-center rounded-2xl bg-primary py-3.5 font-arabic text-sm font-bold text-white shadow-md transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" aria-hidden />
            {syncing ? 'جاري الإضافة...' : `أضيفي المختار للطلب (${selectedProducts.length || 0})`}
          </span>
          {selectedProducts.length > 0 ? (
            <span className="mt-0.5 text-xs font-medium text-white/85">
              +{formatPrice(addTotal)} · المجموع يصير {formatPrice(order.total + addTotal)}
            </span>
          ) : null}
        </button>

        {selectedProducts.length === 0 ? (
          <p className="text-center text-[11px] text-muted">اختاري منتج واحد على الأقل للإضافة</p>
        ) : null}
      </div>
    </div>
  );
}

function CrossSellSelectableCard({
  product,
  checked,
  onToggle,
}: {
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
