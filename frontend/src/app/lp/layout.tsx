import type { Metadata } from 'next';
import { businessConfig } from '@/config/business';

const { brand, market } = businessConfig;

export const metadata: Metadata = {
  title: `${brand.nameLocal} | ${market.countryName}`,
  description: `تسوق إلكتروني داخل ${market.countryName} — دفع عند الاستلام.`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function LpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
