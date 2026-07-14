'use client';

import {
  ArrowLeft,
  CircleCheckBig,
  Flame,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react';
import type { ProductConfig } from '@/config/products';
import type { ProductOffer } from '@/config/types';
import { businessConfig } from '@/config/business';
import { formatPrice, formatPriceFrom } from '@/lib/pricing';
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
  return (
    <section
      id="add-to-cart-section"
      className="bg-gradient-to-br from-background via-surface-rose to-primary-soft py-8 sm:py-12"
    >
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative flex justify-center">
            <div className="absolute inset-0 scale-150 rounded-full bg-primary/10 blur-3xl" aria-hidden />
            <ProductImageCarousel product={product} />
          </div>

          <div className="min-w-0 space-y-5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {heroStats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-border bg-white/80 px-2 py-2.5 text-center backdrop-blur-sm"
                >
                  <p className="text-[10px] font-medium text-muted">{s.label}</p>
                  <p className="mt-0.5 text-[11px] font-extrabold text-primary sm:text-xs">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5">
              <Sparkles className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span className="text-xs font-bold text-primary">
                {product.routineNameLocal} · {product.routineNameEnglish}
              </span>
            </div>

            <h1 className="font-arabic text-2xl font-extrabold leading-[1.15] tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {product.heroHeadline}
            </h1>

            <div className="flex flex-wrap items-center gap-3">
              <Stars rating={product.rating} count={product.reviewsCount} />
              <span className="text-xs text-muted">· تقييم مؤكد</span>
            </div>

            <p className="font-arabic text-lg font-extrabold text-primary sm:text-xl">
              {formatPriceFrom(selectedOffer.price)}
              <span className="mr-2 text-sm font-medium text-muted">/ علبة</span>
            </p>

            {product.scarcityLine ? (
              <div className="flex items-start gap-2 rounded-2xl border border-secondary/30 bg-secondary-soft px-4 py-3">
                <Flame className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden />
                <p className="text-xs font-bold leading-relaxed text-foreground sm:text-sm">{product.scarcityLine}</p>
              </div>
            ) : null}

            <p className="text-sm leading-relaxed text-muted">{product.heroSubheadline}</p>

            <ProductOfferSelector
              product={product}
              selectedId={selectedOffer.id}
              onSelect={onSelectOffer}
            />

            <div ref={ctaRef}>
              <button
                type="button"
                onClick={onAddToCart}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-bold text-white shadow-soft transition hover:bg-primary/90"
              >
                {ctaLabelText}
                <ArrowLeft className="h-5 w-5 shrink-0" aria-hidden />
              </button>
              <p className="mt-3 text-center text-[11px] font-medium text-muted">
                {cod.paymentLabel} · {formatPrice(selectedOffer.price)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {miniTrust.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-border bg-white/70 px-2 py-2.5 text-center"
                >
                  <item.icon className="mx-auto h-4 w-4 text-primary" aria-hidden />
                  <p className="mt-1 text-[10px] font-bold leading-tight text-foreground">{item.title}</p>
                  <p className="text-[9px] leading-tight text-muted">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 border-y border-foreground/10 bg-foreground text-white sm:mt-10">
        <div className="mx-auto flex max-w-container flex-col gap-4 px-4 py-6 sm:px-6 sm:py-8 lg:grid lg:grid-cols-4 lg:gap-5 lg:px-8">
          {product.badges.map((badge, i) => {
            const Icon = stripIcons[i % stripIcons.length];
            return (
              <div
                key={badge}
                className="flex min-w-0 items-center gap-3 rounded-xl bg-white/5 px-2 py-1 sm:gap-4 sm:px-0 sm:py-0"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary/15 ring-1 ring-secondary/40 sm:h-11 sm:w-11">
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
