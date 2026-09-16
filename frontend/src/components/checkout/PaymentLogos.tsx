'use client';

import Image from 'next/image';

const CARD_BRANDS = [
  { src: '/images/payments/mastercard.svg', alt: 'Mastercard' },
  { src: '/images/payments/visa.svg', alt: 'Visa' },
  { src: '/images/payments/discover.svg', alt: 'Discover' },
  { src: '/images/payments/amex.svg', alt: 'American Express' },
] as const;

const WALLET_BRANDS = [
  { src: '/images/payments/apple-pay.svg', alt: 'Apple Pay' },
  { src: '/images/payments/google-pay.svg', alt: 'Google Pay' },
] as const;

type PaymentLogosProps = {
  size?: 'sm' | 'md' | 'lg';
  wallets?: boolean;
  full?: boolean;
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

/** Professional payment brand logos */
export function PaymentLogos({
  size = 'md',
  wallets = false,
  full = true,
  align = 'center',
}: PaymentLogosProps) {
  const alignClass = align === 'start' ? 'justify-start' : 'justify-center';
  const brands = full ? CARD_BRANDS : CARD_BRANDS.slice(0, 2);

  return (
    <div
      className={`flex flex-wrap items-center gap-2.5 ${alignClass}`}
      aria-label="طرق الدفع المقبولة"
      dir="ltr"
    >
      {brands.map((brand) => (
        <BrandBadge key={brand.alt} src={brand.src} alt={brand.alt} size={size} />
      ))}
      {wallets
        ? WALLET_BRANDS.map((brand) => (
            <BrandBadge key={brand.alt} src={brand.src} alt={brand.alt} size={size} />
          ))
        : null}
    </div>
  );
}

export function PaymentLogosInline() {
  return <PaymentLogos size="sm" full={false} align="start" />;
}

export function ExpressPaymentLogos() {
  return <PaymentLogos size="md" wallets full align="center" />;
}
