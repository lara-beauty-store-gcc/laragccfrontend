import type { Metadata, Viewport } from 'next';
import { businessInputs } from '@/config/business';
import { CartProvider } from '@/lib/cart';
import { CheckoutModal } from '@/components/CheckoutModal';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { SiteHeader } from '@/components/SiteHeader';
import './globals.css';

const { brand, market, design } = businessInputs;

export const metadata: Metadata = {
  title: `${brand.nameLocal} | علكات يومية — ${market.countryName}`,
  description: brand.description,
};

export const viewport: Viewport = {
  themeColor: design.themeColor ?? design.primaryColor,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={market.language} dir={market.direction}>
      <body className="flex min-h-screen flex-col">
        <CartProvider>
          <AnnouncementBar />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <CheckoutModal />
        </CartProvider>
      </body>
    </html>
  );
}
