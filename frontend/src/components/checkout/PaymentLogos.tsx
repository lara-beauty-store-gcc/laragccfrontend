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
};

const BRANDS = [
  { id: 'visa', Mark: VisaMark, label: 'Visa' },
  { id: 'mastercard', Mark: MastercardMark, label: 'Mastercard' },
  { id: 'apple-pay', Mark: ApplePayMark, label: 'Apple Pay' },
  { id: 'google-pay', Mark: GooglePayMark, label: 'Google Pay' },
] as const;

function LogoBadge({
  Mark,
  label,
  size,
}: {
  Mark: typeof VisaMark;
  label: string;
  size: 'sm' | 'md';
}) {
  const box = size === 'sm' ? 'h-8 min-w-[52px] px-2' : 'h-9 min-w-[58px] px-2.5';

  return (
    <span
      className={`inline-flex ${box} shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white`}
      aria-label={label}
    >
      <Mark />
    </span>
  );
}

/** Official brand marks — LTR row inside RTL checkout */
export function PaymentLogos({ size = 'md', align = 'start' }: PaymentLogosProps) {
  const alignClass = align === 'center' ? 'justify-center' : 'justify-start';

  return (
    <div
      className={`flex max-w-full flex-wrap items-center gap-2 ${alignClass}`}
      dir="ltr"
      aria-label="طرق الدفع المقبولة"
    >
      {BRANDS.map(({ id, Mark, label }) => (
        <LogoBadge key={id} Mark={Mark} label={label} size={size} />
      ))}
    </div>
  );
}
