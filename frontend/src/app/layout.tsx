import type { Metadata, Viewport } from 'next';
import { businessInputs } from '@/config/business';
import { CartProvider } from '@/lib/cart';
import { StoreShell } from '@/components/StoreShell';
import { MarketingPixels } from '@/components/marketing/MarketingPixels';
import { SnapPixel } from '@/components/marketing/SnapPixel';
import { TikTokPixel } from '@/components/marketing/TikTokPixel';
import './globals.css';

const { brand, market, design, support } = businessInputs;

export const metadata: Metadata = {
  title: `${brand.nameLocal} | علكات يومية — ${market.countryName}`,
  description: brand.description,
  other: {
    'contact:email': support.email,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: design.themeColor ?? design.primaryColor,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={market.language} dir={market.direction}>
      <head>
        <TikTokPixel />
        <SnapPixel />
        <MarketingPixels />
      </head>
      <body className="flex min-h-screen flex-col">
        <CartProvider>
          <StoreShell>{children}</StoreShell>
        </CartProvider>
      </body>
    </html>
  );
}
