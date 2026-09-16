'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { businessConfig } from '@/config/business';

const { brand, market } = businessConfig;

type CheckoutShellProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
  children: React.ReactNode;
};

export function CheckoutShell({ title, subtitle, backHref = '/checkout', children }: CheckoutShellProps) {
  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <header className="border-b border-border/70 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href={backHref}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition hover:bg-surface hover:text-foreground"
            aria-label="رجوع"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="/" className="shrink-0">
            <Image src={brand.logoUrl} alt={brand.nameLocal} width={120} height={36} className="h-8 w-auto" />
          </Link>
          <div className="w-10" aria-hidden />
        </div>

        <div className="border-t border-border/50 bg-surface-rose/50">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-2.5 text-[11px] font-medium text-muted">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
              دفع آمن 100%
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-primary" aria-hidden />
              توصيل {market.countryName}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="font-arabic text-2xl font-extrabold text-foreground sm:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-muted">{subtitle}</p> : null}
        </div>
        {children}
      </div>
    </div>
  );
}
