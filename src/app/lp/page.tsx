import Image from 'next/image';
import Link from 'next/link';
import { HandCoins, ShieldCheck, Truck } from 'lucide-react';
import { LpActivityFeed, LpReviews } from '@/components/lp/LpSections';
import { LpFooter } from '@/components/lp/LpFooter';
import { LandingUrlTracker } from '@/components/LandingUrlTracker';
import { businessConfig } from '@/config/business';

const { brand, market, cod } = businessConfig;

export default function LpPage() {
  return (
    <div className="min-h-screen bg-[#FBF8F2]">
      <LandingUrlTracker />

      <header className="border-b border-border bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-container items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/lp" className="flex items-center gap-3" aria-label={brand.nameLocal}>
            <Image
              src={brand.logoUrl || '/images/logo-header.webp'}
              alt={brand.nameLocal}
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
            <div>
              <p className="font-arabic text-sm font-extrabold text-foreground sm:text-base">{brand.nameLocal}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-secondary">{brand.nameEnglish}</p>
            </div>
          </Link>
          <Link
            href="/"
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-primary-soft"
          >
            المتجر
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10" />
        <div className="relative mx-auto max-w-container px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-secondary">Online Shopping · UAE</p>
            <h1 className="mt-4 font-arabic text-4xl font-extrabold leading-tight text-primary sm:text-5xl">
              تسوقي بسهولة داخل {market.countryName}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
              متجر إلكتروني موثوق — طلب سهل، توصيل سريع، ودفع عند الاستلام بدون دفع أونلاين.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-foreground shadow-sm">
                <Truck className="h-4 w-4 text-primary" aria-hidden />
                توصيل {market.countryName}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-foreground shadow-sm">
                <HandCoins className="h-4 w-4 text-primary" aria-hidden />
                دفع عند الاستلام
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-foreground shadow-sm">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
                دعم سريع
              </span>
            </div>

            <div className="mt-10 rounded-[2rem] border border-border bg-white p-6 text-right shadow-card sm:p-8">
              <p className="font-arabic text-lg font-extrabold text-foreground">لماذا يختار العملاء التسوق معنا؟</p>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
                <li>• واجهة بسيطة وواضحة من أول زيارة</li>
                <li>• تأكيد الطلب عبر الهاتف قبل الشحن</li>
                <li>• {cod.deliveryPromise}</li>
                <li>• فريق دعم متاح للإجابة على استفساراتك</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <LpReviews />

      <section className="bg-surface-rose py-14">
        <div className="mx-auto max-w-container px-4 text-center sm:px-6 lg:px-8">
          <p className="font-arabic text-2xl font-extrabold text-primary">تجربة تسوق مريحة من البداية للنهاية</p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            صفحة عامة للتعريف بالمتجر — بدون منتجات محددة أو ادعاءات صحية. مناسبة لتجربة الحملات الإعلانية.
          </p>
        </div>
      </section>

      <LpFooter />
      <LpActivityFeed />
    </div>
  );
}
