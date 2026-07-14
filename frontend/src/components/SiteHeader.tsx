'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { businessInputs } from '@/config/business';
import { products } from '@/config/products';
import { useCart } from '@/lib/cart';

const { brand } = businessInputs;

export function SiteHeader() {
  const { count, setOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white shadow-sm [transform:translateZ(0)]">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label={brand.nameLocal}>
            <Image
              src="/images/logo.svg"
              alt={brand.nameLocal}
              width={44}
              height={44}
              className="h-11 w-11 object-contain drop-shadow-sm transition-transform group-hover:scale-105"
              priority
            />
            <div className="leading-tight">
              <p className="text-sm font-extrabold tracking-tight text-foreground sm:text-base">
                {brand.nameLocal}
              </p>
              <p className="font-latin text-[9px] font-bold uppercase tracking-[0.16em] text-secondary sm:text-[10px] sm:tracking-[0.18em]">
                {brand.nameEnglish}
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/" className="text-sm font-medium text-foreground transition-colors hover:text-primary">
              الرئيسية
            </Link>
            <Link
              href="#products"
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              العلكات
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              الأسئلة
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="relative rounded-full p-2 transition-colors hover:bg-primary-soft"
              aria-label={`السلة (${count} عناصر)`}
              onClick={() => setOpen(true)}
            >
              <ShoppingBag className="h-6 w-6 text-foreground" aria-hidden />
              {count > 0 && (
                <span className="absolute -left-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-primary-dark">
                  {count}
                </span>
              )}
            </button>
            <button
              type="button"
              className="rounded-full p-2 transition-colors hover:bg-primary-soft md:hidden"
              aria-label="القائمة"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu className="h-6 w-6 text-foreground" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-border bg-white px-4 py-3 md:hidden">
          <ul className="space-y-1 font-arabic text-sm">
            <li>
              <Link href="/" className="block py-2.5 font-medium text-foreground" onClick={() => setMenuOpen(false)}>
                الرئيسية
              </Link>
            </li>
            <li>
              <Link href="#products" className="block py-2.5 text-muted hover:text-primary" onClick={() => setMenuOpen(false)}>
                العلكات
              </Link>
            </li>
            {products.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/products/${p.slug}`}
                  className="block py-2.5 text-muted hover:text-primary"
                  onClick={() => setMenuOpen(false)}
                >
                  {p.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
