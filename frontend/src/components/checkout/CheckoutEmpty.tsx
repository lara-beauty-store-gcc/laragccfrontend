'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { CheckoutShell } from '@/components/checkout/CheckoutShell';

export function CheckoutEmpty() {
  return (
    <CheckoutShell title="إتمام الطلب" backHref="/">
      <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-rose">
          <ShoppingBag className="h-7 w-7 text-primary/70" aria-hidden />
        </span>
        <p className="mt-4 font-arabic text-lg font-extrabold">سلتك فارغة</p>
        <Link href="/#products" className="mt-6 rounded-2xl bg-primary px-6 py-3 font-arabic text-sm font-bold text-white">
          تصفّحي العلكات
        </Link>
      </div>
    </CheckoutShell>
  );
}
