'use client';

import { Minus, Plus } from 'lucide-react';

type CartQuantityControlProps = {
  qty: number;
  onDecrease: () => void;
  onIncrease: () => void;
  size?: 'sm' | 'md';
  disabled?: boolean;
};

export function CartQuantityControl({
  qty,
  onDecrease,
  onIncrease,
  size = 'md',
  disabled = false,
}: CartQuantityControlProps) {
  const btn = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';
  const icon = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <div className="inline-flex items-center rounded-xl border border-border bg-white shadow-sm">
      <button
        type="button"
        onClick={onDecrease}
        disabled={disabled || qty <= 1}
        className={`flex ${btn} items-center justify-center rounded-r-xl text-foreground transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40`}
        aria-label="نقصي الكمية"
      >
        <Minus className={icon} aria-hidden />
      </button>
      <span
        className="min-w-[2.25rem] px-1 text-center text-sm font-bold tabular-nums text-foreground"
        aria-live="polite"
        aria-atomic="true"
      >
        {qty}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={disabled}
        className={`flex ${btn} items-center justify-center rounded-l-xl text-foreground transition hover:bg-surface disabled:opacity-40`}
        aria-label="زيدي الكمية"
      >
        <Plus className={icon} aria-hidden />
      </button>
    </div>
  );
}
