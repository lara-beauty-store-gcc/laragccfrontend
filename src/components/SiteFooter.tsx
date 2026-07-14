import Image from 'next/image';
import Link from 'next/link';
import { Heart, Leaf, ShieldCheck, Truck } from 'lucide-react';
import { businessInputs } from '@/config/business';
import { products } from '@/config/products';
import { getTrustBadges } from '@/lib/marketing';

const { brand, market } = businessInputs;

const footerIcons = [ShieldCheck, Leaf, Truck, Heart];

export function SiteFooter() {
  const badges = getTrustBadges();

  return (
    <footer className="border-t border-border bg-[#0f1f18] text-white">
      <div className="mx-auto max-w-container px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-right">
            <div className="flex flex-col items-center gap-3 lg:items-start">
              <Image
                src="/images/logo.svg"
                alt={brand.nameLocal}
                width={56}
                height={56}
                className="h-14 w-14 object-contain"
              />
              <p className="font-arabic text-lg font-extrabold">{brand.nameLocal}</p>
              <p className="max-w-sm text-sm leading-relaxed text-white/70">{brand.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {badges.map((b, i) => {
              const Icon = footerIcons[i] ?? ShieldCheck;
              return (
                <div
                  key={b.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center"
                >
                  <Icon className="mx-auto h-6 w-6 text-secondary" aria-hidden />
                  <p className="mt-2 text-xs font-bold">{b.label}</p>
                  <p className="mt-0.5 text-[10px] text-white/60">{b.sub}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 grid gap-8 border-t border-white/10 pt-10 sm:grid-cols-2">
          <div>
            <p className="mb-3 font-arabic text-sm font-bold text-secondary">العلكات</p>
            <ul className="space-y-2 text-sm text-white/75">
              {products.map((p) => (
                <li key={p.id}>
                  <Link href={`/products/${p.slug}`} className="transition hover:text-white">
                    {p.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 font-arabic text-sm font-bold text-secondary">توصيل</p>
            <p className="text-sm leading-relaxed text-white/75">
              دفع عند الاستلام في كل {market.countryName}. ضمان استرجاع 30 يوم.
            </p>
          </div>
        </div>

        <p className="mt-10 text-center text-[11px] text-white/50">
          © {new Date().getFullYear()} {brand.nameLocal}. جميع الحقوق محفوظة — {market.countryName}
        </p>
      </div>
    </footer>
  );
}
