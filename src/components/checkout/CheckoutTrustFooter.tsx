'use client';

import { Headphones, Leaf, ShieldCheck, Truck } from 'lucide-react';

const ITEMS = [
  { icon: Leaf, label: 'منتج أصلي مضمون 100%' },
  { icon: ShieldCheck, label: 'دفع آمن عبر Stripe' },
  { icon: Truck, label: 'شحن سريع في جميع الإمارات' },
] as const;

export function CheckoutTrustFooter() {
  return (
    <div className="mt-8 grid grid-cols-3 gap-3 border-t border-border/60 pt-6">
      {ITEMS.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-2 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <item.icon className="h-4 w-4" aria-hidden />
          </span>
          <p className="font-arabic text-[10px] font-bold leading-tight text-muted sm:text-[11px]">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}
