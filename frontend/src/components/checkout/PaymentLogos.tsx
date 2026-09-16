'use client';

/** Visa, Mastercard, Apple Pay — no PayPal */
export function PaymentLogos({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'h-7 px-2 text-[9px]' : 'h-9 px-3 text-[10px]';

  return (
    <div className="flex flex-wrap items-center justify-center gap-2" aria-label="طرق الدفع المقبولة">
      <span
        className={`inline-flex items-center justify-center rounded-md border border-border bg-white font-bold tracking-wide text-[#1A1F71] ${box}`}
        dir="ltr"
      >
        VISA
      </span>
      <span
        className={`inline-flex items-center justify-center rounded-md border border-border bg-white font-bold ${box}`}
        dir="ltr"
      >
        <span className="text-[#EB001B]">●</span>
        <span className="mx-0.5 text-[#F79E1B]">●</span>
        <span className="text-[10px] font-extrabold text-foreground">MC</span>
      </span>
      <span
        className={`inline-flex items-center justify-center gap-1 rounded-md border border-border bg-white font-semibold text-foreground ${box}`}
        dir="ltr"
      >
        <ApplePayMark />
        Pay
      </span>
    </div>
  );
}

function ApplePayMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden fill="currentColor">
      <path d="M16.365 12.67c.02 2.14 1.87 2.86 1.89 2.87-.02.06-.3 1.02-.98 2.02-.59.87-1.2 1.74-2.16 1.76-.94.02-1.24-.55-2.32-.55-1.09 0-1.43.53-2.33.57-.94.04-1.65-.94-2.24-1.81-1.22-1.76-2.15-4.97-.9-7.14.62-1.08 1.74-1.76 2.96-1.78.92-.02 1.8.62 2.32.62.52 0 1.5-.76 2.54-.65 1.08.05 1.88.5 2.38 1.28-2.1 1.26-1.76 4.54.44 5.41zm-1.52-9.9c.5-.62.85-1.48.75-2.34-.73.03-1.62.49-2.14 1.1-.47.55-.88 1.44-.77 2.28.81.06 1.64-.42 2.16-1.04z" />
    </svg>
  );
}
