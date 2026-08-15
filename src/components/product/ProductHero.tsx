'use client';

import {
  ArrowLeft,
  CircleCheckBig,
  HeartHandshake,
  ShieldCheck,
  Star,
  Truck,
} from 'lucide-react';
import type { ProductConfig } from '@/config/products';
import { getLowestOfferPrice } from '@/config/products';
import type { ProductOffer } from '@/config/types';
import { businessConfig } from '@/config/business';
import { formatPrice } from '@/lib/pricing';
import { ProductImageCarousel } from './ProductImageCarousel';
import { ProductOfferSelector } from './ProductOfferSelector';
import { Stars } from '../Stars';

const { cod } = businessConfig;

const heroStats = [
  { label: 'علكة في العلبة', value: '60' },
  { label: 'يوم لكل علبة', value: '30' },
  { label: 'حلال', value: 'بكتين نباتي' },
  { label: 'جودة', value: 'GMP' },
];

const miniTrust = [
  { icon: HeartHandshake, title: cod.paymentLabel, sub: 'بدون دفع أونلاين' },
  { icon: Truck, title: 'توصيل 2–4 أيام', sub: businessConfig.market.countryName },
  { icon: ShieldCheck, title: 'ضمان 30 يوم', sub: 'استرجاع كامل' },
  { icon: CircleCheckBig, title: 'حلال · GMP', sub: 'تركيبة واضحة' },
];

const stripIcons = [ShieldCheck, Star, HeartHandshake, Truck] as const;

export function ProductHero({
  product,
  selectedOffer,
  onSelectOffer,
  onAddToCart,
  ctaLabelText,
  ctaRef,
}: {
  product: ProductConfig;
  selectedOffer: ProductOffer;
  onSelectOffer: (offer: ProductOffer) => void;
  onAddToCart: () => void;
  ctaLabelText: string;
  ctaRef: React.Ref<HTMLDivElement>;
}) {
  const fromPrice = getLowestOfferPrice(product);

  return (
    <section id="add-to-cart-section" className="overflow-x-clip bg-background">
      <div className="mx-auto max-w-container px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="mx-auto w-full max-w-lg lg:sticky lg:top-20 lg:max-w-none lg:justify-self-center">
            <ProductImageCarousel product={product} />
          </div>

          <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {heroStats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-border bg-white px-2 py-2.5 text-center shadow-sm"
                >
                  <p className="text-lg font-extrabold tabular-nums text-primary sm:text-xl">{s.value}</p>
                  <p className="mt-0.5 text-[10px] font-medium leading-tight text-muted">{s.label}</p>
                </div>
              ))}
            </div>

            <h1 className="font-arabic text-2xl font-extrabold leading-[1.15] tracking-tight text-foreground sm:text-3xl lg:text-[2rem]">
              {product.heroHeadline}
            </h1>

            <p className="text-sm leading-relaxed text-muted sm:text-base">{product.heroSubheadline}</p>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <Stars rating={product.rating} count={product.reviewsCount} />
              <span className="text-muted" aria-hidden>
                ·
              </span>
              <span className="font-arabic font-extrabold text-primary">
                من {formatPrice(fromPrice)} / علبة
              </span>
            </div>

            {product.scarcityLine ? (
              <p className="rounded-xl border border-secondary/25 bg-secondary-soft px-3 py-2.5 text-xs font-bold leading-relaxed text-foreground sm:text-sm">
                {product.scarcityLine}
              </p>
            ) : null}

            <ProductOfferSelector
              product={product}
              selectedId={selectedOffer.id}
              onSelect={onSelectOffer}
            />

            <div ref={ctaRef} className="space-y-2">
              <button
                type="button"
                onClick={onAddToCart}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-bold text-white shadow-soft transition hover:bg-primary/90 active:scale-[0.99]"
              >
                {ctaLabelText}
                <ArrowLeft className="h-5 w-5 shrink-0" aria-hidden />
              </button>
              <p className="text-center text-[11px] font-medium text-muted">
                {cod.paymentLabel} · بدون دفع أونلاين
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {miniTrust.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-border bg-white px-2 py-3 text-center"
                >
                  <item.icon className="mx-auto h-4 w-4 text-primary" aria-hidden />
                  <p className="mt-1.5 text-[10px] font-bold leading-tight text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-[9px] leading-tight text-muted">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-y border-foreground/10 bg-foreground text-white">
        <div className="mx-auto grid max-w-container grid-cols-1 gap-4 px-4 py-5 sm:px-6 sm:py-6 lg:grid-cols-4 lg:gap-5 lg:px-8">
          {product.badges.map((badge, i) => {
            const Icon = stripIcons[i % stripIcons.length];
            return (
              <div key={badge} className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary/15 ring-1 ring-secondary/40">
                  <Icon className="h-5 w-5 text-secondary" aria-hidden />
                </div>
                <p className="min-w-0 flex-1 text-xs font-extrabold leading-snug sm:text-sm">{badge}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
