'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { CheckoutProgress } from '@/components/checkout/CheckoutProgress';
import { businessConfig } from '@/config/business';

const { brand } = businessConfig;

type CheckoutShellProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
  progressStep?: 1 | 2 | 3;
  children: React.ReactNode;
};

export function CheckoutShell({
  title,
  subtitle,
  backHref = '/checkout',
  progressStep,
  children,
}: CheckoutShellProps) {
  const showPremiumHeader = progressStep !== undefined;

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <header className="border-b border-border/60 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link
            href={backHref}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-surface hover:text-foreground"
            aria-label="رجوع"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>

          <Link href="/" className="shrink-0">
            <Image src={brand.logoUrl} alt={brand.nameLocal} width={140} height={40} className="h-9 w-auto" priority />
          </Link>

          {showPremiumHeader ? (
            <div className="hidden flex-1 justify-center lg:flex">
              <CheckoutProgress currentStep={progressStep} />
            </div>
          ) : (
            <div className="hidden flex-1 lg:block" />
          )}

          <div className="hidden max-w-[200px] items-center gap-2 text-end sm:flex">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <p className="font-arabic text-[10px] font-bold leading-tight text-muted">
              دفع آمن 100%
              <span className="block font-normal">بياناتك محمية دائماً</span>
            </p>
          </div>
        </div>

        {showPremiumHeader ? (
          <div className="border-t border-border/40 px-4 py-3 lg:hidden">
            <CheckoutProgress currentStep={progressStep} />
          </div>
        ) : null}
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="font-arabic text-2xl font-extrabold text-foreground sm:text-[1.75rem]">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-muted">{subtitle}</p> : null}
        </div>
        {children}
      </div>
    </div>
  );
}
