'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ProductConfig } from '@/config/products';
import { getDefaultOffer } from '@/config/products';
import type { ProductOffer } from '@/config/types';
import { businessConfig } from '@/config/business';
import { useCart } from '@/lib/cart';
import { ctaLabel } from '@/lib/pricing';
import { trackAddToCart, trackViewContent } from '@/lib/tracking';
import { ProductHero } from './ProductHero';
import {
  AuthoritySection,
  CODDeliverySection,
  ComparisonSection,
  DeliveryCitiesSection,
  ExclusionsSection,
  FailureAlternativesSection,
  GuaranteeSection,
  HowToUseSection,
  IngredientBreakdown,
  MechanismSection,
  OfferRecap,
  ProblemAgitationSection,
  ProblemInsightSection,
  ProductFAQ,
  ProductTestimonials,
  ProofStats,
  RelatedProducts,
  ResultsTimeline,
} from './ProductSections';
import { ProductStickyCTA } from './ProductStickyCTA';

const { market } = businessConfig;

export function ProductLandingPage({ product }: { product: ProductConfig }) {
  const { addOffer, setOpen } = useCart();
  const defaultOffer = useMemo(() => getDefaultOffer(product), [product]);
  const [selectedOffer, setSelectedOffer] = useState<ProductOffer>(defaultOffer);
  const [showSticky, setShowSticky] = useState(false);
  const heroCtaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackViewContent({
      id: product.id,
      sku: product.sku,
      name: product.name,
      price: selectedOffer.price,
      currency: market.currency,
    });
  }, [product.id, product.sku, product.name, selectedOffer.price]);

  useEffect(() => {
    const el = heroCtaRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleAddToCart = useCallback(() => {
    addOffer(product, selectedOffer);
    trackAddToCart({
      content_ids: product.sku,
      content_name: product.name,
      value: selectedOffer.price,
      currency: market.currency,
      quantity: selectedOffer.quantity,
    });
    setOpen(true);
  }, [addOffer, product, selectedOffer, setOpen]);

  return (
    <div className="pb-28">
      <ProductHero
        product={product}
        selectedOffer={selectedOffer}
        onSelectOffer={setSelectedOffer}
        onAddToCart={handleAddToCart}
        ctaRef={heroCtaRef}
        ctaLabelText={ctaLabel(product, selectedOffer)}
      />

      <ProblemInsightSection product={product} />
      <ProblemAgitationSection product={product} />
      <MechanismSection product={product} />
      <ExclusionsSection product={product} />
      <IngredientBreakdown product={product} />
      <AuthoritySection product={product} />
      <ProofStats product={product} />
      <ResultsTimeline product={product} />
      <ProductTestimonials product={product} />
      <FailureAlternativesSection product={product} />
      <ComparisonSection product={product} />
      <OfferRecap product={product} offer={selectedOffer} onCta={handleAddToCart} />
      <GuaranteeSection />
      <HowToUseSection product={product} />
      <CODDeliverySection />
      <DeliveryCitiesSection product={product} />
      <ProductFAQ product={product} />
      <RelatedProducts product={product} />

      <ProductStickyCTA
        product={product}
        offer={selectedOffer}
        onClick={handleAddToCart}
        visible={showSticky}
      />
    </div>
  );
}
