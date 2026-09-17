'use client';

import Image from 'next/image';

const BRANDS = [
  { src: '/images/payments/visa.png', alt: 'Visa' },
  { src: '/images/payments/mastercard.png', alt: 'Mastercard' },
  { src: '/images/payments/apple-pay.png', alt: 'Apple Pay' },
  { src: '/images/payments/google-pay.png', alt: 'Google Pay' },
] as const;

type PaymentLogosProps = {
  size?: 'sm' | 'md';
  align?: 'start' | 'center';
};

function LogoBadge({
  src,
  alt,
  size,
}: {
  src: string;
  alt: string;
  size: 'sm' | 'md';
}) {
  const box = size === 'sm' ? 'h-8 min-w-[52px] px-2' : 'h-9 min-w-[58px] px-2.5';
  const imgHeight = size === 'sm' ? 16 : 18;

  return (
    <span
      className={`inline-flex ${box} shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white`}
      aria-label={alt}
    >
      <Image
        src={src}
        alt={alt}
        width={52}
        height={imgHeight}
        className="h-auto max-h-full w-auto max-w-full object-contain"
        unoptimized
      />
    </span>
  );
}

/** User-provided official brand marks — LTR row inside RTL checkout */
export function PaymentLogos({ size = 'md', align = 'start' }: PaymentLogosProps) {
  const alignClass = align === 'center' ? 'justify-center' : 'justify-start';

  return (
    <div
      className={`flex max-w-full flex-wrap items-center gap-2 ${alignClass}`}
      dir="ltr"
      aria-label="طرق الدفع المقبولة"
    >
      {BRANDS.map((brand) => (
        <LogoBadge key={brand.alt} src={brand.src} alt={brand.alt} size={size} />
      ))}
    </div>
  );
}
