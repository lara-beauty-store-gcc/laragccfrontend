'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { CheckoutModal } from '@/components/CheckoutModal';
import { SiteHeader } from '@/components/SiteHeader';
import { WhatsAppFloatingButton } from '@/components/WhatsAppFloatingButton';
import { LandingUrlTracker } from '@/components/LandingUrlTracker';

const MINIMAL_CHROME_PREFIXES = ['/lp', '/redirectkiller'];

function isMinimalRoute(pathname: string | null) {
  if (!pathname) return false;
  return MINIMAL_CHROME_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function StoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const minimal = isMinimalRoute(pathname);

  if (minimal) {
    return <>{children}</>;
  }

  return (
    <>
      <LandingUrlTracker />
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <CheckoutModal />
      <WhatsAppFloatingButton />
    </>
  );
}

export function MinimalBackLink({ href = '/', label = '← رجوع' }: { href?: string; label?: string }) {
  return (
    <Link href={href} className="inline-block text-sm font-semibold text-primary">
      {label}
    </Link>
  );
}
