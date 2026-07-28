'use client';

import Link from 'next/link';
import { HandCoins, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { CartLineItem } from '@/components/cart/CartLineItem';
import { businessConfig } from '@/config/business';
import type { CartLine } from '@/lib/cart';

const { cod, market } = businessConfig;

const trustChips = [
  { icon: HandCoins, text: 'دفع عند الاستلام' },
  { icon: Truck, text: `شحن ${market.countryName}` },
  { icon: ShieldCheck, text: 'ضمان 30 يوم' },
];

type CartStepProps = {
  items: CartLine[];
  onRemove: (productId: string, offerId: string) => void;
  onUpdateQty: (productId: string, offerId: string, qty: number) => void;
  onClose: () => void;
};

export function CartStep({
  items,
  onRemove,
  onUpdateQty,
  onClose,
}: CartStepProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center px-5 py-10 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-rose">
          <ShoppingBag className="h-7 w-7 text-primary/70" aria-hidden />
        </span>
        <p className="mt-4 font-arabic text-lg font-extrabold text-foreground">سلتك فاضية</p>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
          اختاري عرضك المفضل من العلكات وارجعي هنا قبل ما تكمّلي الطلب.
        </p>
        <Link
          href="/#products"
          onClick={onClose}
          className="mt-6 inline-flex rounded-2xl bg-primary px-6 py-3 font-arabic text-sm font-bold text-white shadow-md transition hover:bg-primary/90"
        >
          تصفّحي العلكات
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {items.map((line) => (
          <CartLineItem
            key={`${line.productId}-${line.offerId}`}
            line={line}
            onRemove={() => onRemove(line.productId, line.offerId)}
            onUpdateQty={(qty) => onUpdateQty(line.productId, line.offerId, qty)}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {trustChips.map((chip) => (
          <span
            key={chip.text}
            className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800"
          >
            <chip.icon className="h-3 w-3" aria-hidden />
            {chip.text}
          </span>
        ))}
      </div>

      <p className="mt-4 rounded-2xl border border-border bg-surface-rose px-4 py-3 text-xs leading-relaxed text-muted">
        {cod.deliveryPromise} · {cod.paymentLabel}
      </p>
    </>
  );
}
