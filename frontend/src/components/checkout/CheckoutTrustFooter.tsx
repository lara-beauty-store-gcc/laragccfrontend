'use client';

import { BadgeCheck, Headphones, ShieldCheck, Truck } from 'lucide-react';

const items = [
  { icon: BadgeCheck, label: 'منتج أصلي', sub: 'ضمان 100%' },
  { icon: Headphones, label: 'دعم العملاء', sub: '7/7' },
  { icon: ShieldCheck, label: 'دفع آمن', sub: 'عبر Stripe' },
  { icon: Truck, label: 'شحن سريع', sub: 'كل الإمارات' },
];

export function CheckoutTrustFooter() {
  return (
    <div className="grid grid-cols-4 gap-2 border-t border-border/60 pt-4">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <item.icon className="mx-auto h-4 w-4 text-primary" aria-hidden />
          <p className="mt-1.5 font-arabic text-[9px] font-bold leading-tight text-foreground">{item.label}</p>
          <p className="text-[8px] leading-tight text-muted">{item.sub}</p>
        </div>
      ))}
    </div>
  );
}
