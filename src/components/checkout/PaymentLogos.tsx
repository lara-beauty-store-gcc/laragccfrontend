'use client';

import Image from 'next/image';

const BRANDS = [
  { src: '/images/payments/visa.png', alt: 'Visa' },
  { src: '/images/payments/mastercard.png', alt: 'Mastercard' },
  { src: '/images/payments/apple-pay.png', alt: 'Apple Pay' },
  { src: '/images/payments/google-pay.png', alt: 'Google Pay' },
] as const;

type PaymentLogosProps = {
  size?: 'xs' | 'sm' | 'md';
  align?: 'start' | 'center' | 'end';
  className?: string;
};

const SIZE_STYLES = {
  xs: { box: 'h-5 min-w-[34px] px-1', img: 10 },
  sm: { box: 'h-7 min-w-[44px] px-1.5', img: 13 },
  md: { box: 'h-9 min-w-[58px] px-2.5', img: 18 },
} as const;

function LogoBadge({
  src,
  alt,
  size,
}: {
  src: string;
  alt: string;
  size: keyof typeof SIZE_STYLES;
}) {
  const { box, img } = SIZE_STYLES[size];

  return (
    <span
      className={`inline-flex ${box} shrink-0 items-center justify-center rounded border border-gray-200/90 bg-white`}
      aria-label={alt}
    >
      <Image
        src={src}
        alt={alt}
        width={44}
        height={img}
        className="h-auto max-h-full w-auto max-w-full object-contain"
        unoptimized
      />
    </span>
  );
}

/** Visa · Mastercard · Apple Pay · Google Pay — compact LTR row for RTL checkout */
export function PaymentLogos({
  size = 'md',
  align = 'start',
  className = '',
}: PaymentLogosProps) {
  const alignClass =
    align === 'center' ? 'justify-center' : align === 'end' ? 'justify-end' : 'justify-start';

  return (
    <div
      className={`flex max-w-full flex-wrap items-center gap-1 ${alignClass} ${className}`}
      dir="ltr"
      aria-label="طرق الدفع المقبولة"
    >
      {BRANDS.map((brand) => (
        <LogoBadge key={brand.alt} src={brand.src} alt={brand.alt} size={size} />
      ))}
    </div>
  );
}
