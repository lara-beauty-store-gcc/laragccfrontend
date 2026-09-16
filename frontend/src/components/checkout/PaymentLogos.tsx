'use client';

import Image from 'next/image';

/** Mastercard, Visa, Discover, Amex — matching premium checkout UI */
const CARD_BRANDS = [
  { src: '/images/payments/mastercard.svg', alt: 'Mastercard' },
  { src: '/images/payments/visa.svg', alt: 'Visa' },
  { src: '/images/payments/discover.svg', alt: 'Discover' },
  { src: '/images/payments/amex.svg', alt: 'American Express' },
] as const;

type PaymentLogosProps = {
  size?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'center';
};

function BrandBadge({
  src,
  alt,
  size,
}: {
  src: string;
  alt: string;
  size: 'sm' | 'md' | 'lg';
}) {
  const sizes = {
    sm: { box: 'h-8 w-[50px]', img: 40 },
    md: { box: 'h-10 w-[62px]', img: 52 },
    lg: { box: 'h-12 w-[74px]', img: 64 },
  }[size];

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${sizes.box}`}
      dir="ltr"
    >
      <Image
        src={src}
        alt={alt}
        width={sizes.img}
        height={Math.round(sizes.img * 0.57)}
        className="h-auto w-full object-contain"
        unoptimized
      />
    </span>
  );
}

export function PaymentLogos({ size = 'md', align = 'center' }: PaymentLogosProps) {
  const alignClass = align === 'start' ? 'justify-start' : 'justify-center';

  return (
    <div
      className={`flex flex-wrap items-center gap-2.5 ${alignClass}`}
      aria-label="طرق الدفع المقبولة"
      dir="ltr"
    >
      {CARD_BRANDS.map((brand) => (
        <BrandBadge key={brand.alt} src={brand.src} alt={brand.alt} size={size} />
      ))}
    </div>
  );
}

export function ExpressPaymentLogos() {
  return <PaymentLogos size="md" align="center" />;
}
