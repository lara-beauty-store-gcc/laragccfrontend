import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Truck } from 'lucide-react';
import { businessConfig } from '@/config/business';
import { SocialLinks } from '@/components/social/SocialLinks';
import { SupportContact } from '@/components/SupportContact';

const { brand, market } = businessConfig;

const SAFE_DESCRIPTION = `متجر إلكتروني داخل ${market.countryName} — دفع عند الاستلام وتوصيل لباب البيت.`;

export function LpFooter() {
  return (
    <footer className="border-t border-border bg-[#0f1f18] text-white">
      <div className="mx-auto max-w-container px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-right">
            <div className="flex flex-col items-center gap-3 lg:items-start">
              <Image
                src={brand.logoWhiteUrl || brand.logoUrl || '/images/logo-white.webp'}
                alt={brand.nameLocal}
                width={64}
                height={64}
                className="h-16 w-16 object-contain"
              />
              <p className="font-arabic text-lg font-extrabold">{brand.nameLocal}</p>
              <p className="max-w-sm text-sm leading-relaxed text-white/70">{SAFE_DESCRIPTION}</p>
              <SocialLinks variant="footer" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
              <Truck className="mx-auto h-6 w-6 text-secondary" aria-hidden />
              <p className="mt-2 text-xs font-bold">توصيل {market.countryName}</p>
              <p className="mt-0.5 text-[10px] text-white/60">2–4 أيام عمل</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
              <ShieldCheck className="mx-auto h-6 w-6 text-secondary" aria-hidden />
              <p className="mt-2 text-xs font-bold">دفع عند الاستلام</p>
              <p className="mt-0.5 text-[10px] text-white/60">بدون دفع أونلاين</p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 border-t border-white/10 pt-10 sm:grid-cols-2">
          <SupportContact variant="footer" />
          <div>
            <p className="mb-3 font-arabic text-sm font-bold text-secondary">معلومات</p>
            <p className="text-sm leading-relaxed text-white/75">
              متجر إلكتروني موثوق داخل {market.countryName}. للاستفسارات، تواصلي مع فريق الدعم.
            </p>
            <Link href="/" className="mt-4 inline-block text-sm font-semibold text-secondary hover:text-white">
              زيارة المتجر الرئيسي
            </Link>
          </div>
        </div>

        <p className="mt-10 text-center text-[11px] text-white/50">
          © {new Date().getFullYear()} {brand.nameLocal}. جميع الحقوق محفوظة — {market.countryName}
        </p>
      </div>
    </footer>
  );
}
