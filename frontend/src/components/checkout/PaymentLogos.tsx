'use client';

import {
  ApplePayMark,
  GooglePayMark,
  MastercardMark,
  VisaMark,
} from '@/components/checkout/PaymentBrandMarks';

type PaymentLogosProps = {
  size?: 'sm' | 'md';
  align?: 'start' | 'center';
  showDisclaimer?: boolean;
};

type BrandEntry = {
  id: string;
  Mark: typeof VisaMark;
  box: string;
  dark?: boolean;
};

const BRANDS: BrandEntry[] = [
  { id: 'visa', Mark: VisaMark, box: 'w-[46px]' },
  { id: 'mastercard', Mark: MastercardMark, box: 'w-[40px]' },
  { id: 'apple-pay', Mark: ApplePayMark, box: 'w-[48px]', dark: true },
  { id: 'google-pay', Mark: GooglePayMark, box: 'w-[50px]' },
];

function BrandBadge({
  Mark,
  box,
  dark,
  size,
}: {
  Mark: typeof VisaMark;
  box: string;
  dark?: boolean;
  size: 'sm' | 'md';
}) {
  const height = size === 'sm' ? 'h-7' : 'h-8';

  return (
    <span
      className={`inline-flex ${height} ${box} shrink-0 items-center justify-center rounded border border-gray-200/90 bg-white px-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${dark ? 'text-gray-900' : ''}`}
      dir="ltr"
    >
      <Mark className="max-h-[16px] max-w-full" />
    </span>
  );
}

/** Visa · Mastercard · Apple Pay · Google Pay */
export function PaymentLogos({
  size = 'md',
  align = 'start',
  showDisclaimer = false,
}: PaymentLogosProps) {
  const alignClass = align === 'center' ? 'justify-center' : 'justify-start';

  return (
    <div className="space-y-2">
      <div
        className={`flex max-w-full flex-wrap items-center gap-1.5 ${alignClass}`}
        aria-label="طرق الدفع المقبولة عبر Stripe"
        dir="ltr"
      >
        {BRANDS.map(({ id, Mark, box, dark }) => (
          <BrandBadge key={id} Mark={Mark} box={box} dark={dark} size={size} />
        ))}
      </div>
      {showDisclaimer ? (
        <p className="text-[10px] leading-relaxed text-muted">
          الطرق الفعلية المتاحة تُحدَّد عبر Stripe حسب جهازك ومنطقتك.
        </p>
      ) : null}
    </div>
  );
}
