'use client';

import {
  AmexIcon,
  ApplePayIcon,
  DiscoverIcon,
  GooglePayIcon,
  MastercardIcon,
  VisaIcon,
} from '@/components/checkout/PaymentBrandIcons';

type PaymentLogosProps = {
  size?: 'sm' | 'md' | 'lg';
  /** Show wallet options (Apple Pay, Google Pay) */
  wallets?: boolean;
  /** Show all card brands including Discover & Amex */
  full?: boolean;
  align?: 'start' | 'center';
};

function BrandBadge({
  children,
  size,
  className = '',
}: {
  children: React.ReactNode;
  size: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const heights = {
    sm: 'h-7 min-w-[42px] px-1.5',
    md: 'h-9 min-w-[52px] px-2',
    lg: 'h-11 min-w-[60px] px-2.5',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-md border border-gray-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] ${heights[size]} ${className}`}
      dir="ltr"
    >
      {children}
    </span>
  );
}

/** Professional payment brand logos — Visa, Mastercard, Amex, Apple Pay */
export function PaymentLogos({
  size = 'md',
  wallets = false,
  full = true,
  align = 'center',
}: PaymentLogosProps) {
  const iconScale = {
    sm: { mc: 'h-4 w-7', visa: 'h-3.5 w-9', amex: 'h-4 w-7', disc: 'h-4 w-7', wallet: 'h-4 w-10' },
    md: { mc: 'h-5 w-8', visa: 'h-4 w-10', amex: 'h-5 w-8', disc: 'h-5 w-8', wallet: 'h-5 w-12' },
    lg: { mc: 'h-6 w-10', visa: 'h-5 w-12', amex: 'h-6 w-10', disc: 'h-6 w-10', wallet: 'h-6 w-14' },
  }[size];

  const alignClass = align === 'start' ? 'justify-start' : 'justify-center';

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${alignClass}`}
      aria-label="طرق الدفع المقبولة"
      dir="ltr"
    >
      <BrandBadge size={size}>
        <MastercardIcon className={iconScale.mc} />
      </BrandBadge>
      <BrandBadge size={size}>
        <VisaIcon className={iconScale.visa} />
      </BrandBadge>
      {full ? (
        <>
          <BrandBadge size={size}>
            <DiscoverIcon className={iconScale.disc} />
          </BrandBadge>
          <BrandBadge size={size}>
            <AmexIcon className={iconScale.amex} />
          </BrandBadge>
        </>
      ) : null}
      {wallets ? (
        <>
          <BrandBadge size={size} className="text-foreground">
            <ApplePayIcon className={iconScale.wallet} />
          </BrandBadge>
          <BrandBadge size={size}>
            <GooglePayIcon className={iconScale.wallet} />
          </BrandBadge>
        </>
      ) : null}
    </div>
  );
}

/** Compact row for inline use next to labels */
export function PaymentLogosInline() {
  return <PaymentLogos size="sm" full={false} align="start" />;
}

/** Express checkout row — wallets + cards */
export function ExpressPaymentLogos() {
  return <PaymentLogos size="md" wallets full align="center" />;
}
