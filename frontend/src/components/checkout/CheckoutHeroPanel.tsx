'use client';

import Image from 'next/image';
import { businessConfig } from '@/config/business';
import { cartLineImage } from '@/lib/cart-images';

const { brand } = businessConfig;

type CheckoutHeroPanelProps = {
  productSlug?: string;
};

export function CheckoutHeroPanel({ productSlug }: CheckoutHeroPanelProps) {
  const image = productSlug ? cartLineImage(productSlug) : brand.logoIconUrl;

  return (
    <aside
      className="relative hidden min-h-[520px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#E8EFE9] via-[#F5F0E5] to-[#FAF8F5] lg:flex lg:flex-col lg:justify-end"
      aria-hidden
    >
      <div className="absolute inset-0 opacity-[0.07]">
        <Image src={image} alt="" fill className="object-cover" sizes="280px" />
      </div>
      <div className="relative p-8 text-right">
        <p className="font-arabic text-2xl font-extrabold leading-snug text-primary">
          لأن صحتك أهم
        </p>
        <p className="mt-2 font-arabic text-sm leading-relaxed text-muted">
          {brand.tagline}
        </p>
      </div>
    </aside>
  );
}
