'use client';

import Link from 'next/link';
import { MediaFrame } from '@/components/ui/MediaFrame';
import {
  BadgeCheck,
  ChevronDown,
  CircleCheckBig,
  CircleX,
  Clock,
  Droplet,
  HandCoins,
  MapPin,
  Package,
  Phone,
  Sprout,
  Stethoscope,
  TriangleAlert,
  Truck,
} from 'lucide-react';
import { businessConfig } from '@/config/business';
import type { ProductConfig } from '@/config/products';
import { getLowestOfferPrice, products } from '@/config/products';
import type { IngredientItem, ProductOffer } from '@/config/types';
import { formatPrice, formatPriceFrom } from '@/lib/pricing';
import { ProductMedia } from './ProductMedia';
import { ProductPageSection, ProductSectionHeader } from './ProductPageSection';

const { cod, market } = businessConfig;

function ingredientName(item: IngredientItem): string {
  return typeof item === 'string' ? item : item.name;
}

function ingredientDetail(item: IngredientItem): { benefit: string; proof: string; dosage?: string } {
  if (typeof item === 'string') {
    return { benefit: 'يدعم أهداف الروتين اليومي', proof: 'مكوّن مدروس' };
  }
  return {
    benefit: item.benefit ?? '',
    proof: item.proof ?? '',
    dosage: item.dosage,
  };
}

export function ProductTrustBadges() {
  return null;
}

export function ProductTrustStrip() {
  return null;
}

export function ProblemInsightSection({ product }: { product: ProductConfig }) {
  const stat = product.insightStat;
  return (
    <ProductPageSection variant="white">
      <ProductSectionHeader
        eyebrow="هل تعانين من هذه؟"
        title="مشاكل تعرفينها — وحلول من الداخل"
        subtitle={product.problem}
      />
      <div className="grid items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <div className="mx-auto w-full max-w-md">
            <ProductMedia
              product={product}
              imageKey="problemImage"
              alt={product.imageAlts.problemImage}
              variant="section"
              frameClassName="overflow-hidden rounded-[2rem] border-8 border-white shadow-2xl"
            />
          </div>
        </div>
        <div className="flex flex-col justify-center lg:col-span-7">
          <p className="text-base leading-relaxed text-muted sm:text-lg">{product.emotionalPain}</p>
          {stat ? (
            <div className="mt-6 rounded-3xl bg-primary p-6 text-white shadow-soft">
              <p className="font-arabic text-4xl font-extrabold text-secondary">{stat.value}</p>
              <p className="mt-3 text-sm leading-relaxed sm:text-base">{stat.label}</p>
              {stat.source ? <p className="mt-3 text-[11px] text-white/60">{stat.source}</p> : null}
            </div>
          ) : null}
        </div>
      </div>
    </ProductPageSection>
  );
}

export function ProblemAgitationSection({ product }: { product: ProductConfig }) {
  const cards = product.problemCards ?? [];
  return (
    <ProductPageSection variant="rose">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        {cards.map((card) => (
          <div
            key={card.pain}
            className="overflow-hidden rounded-3xl border border-border bg-white shadow-card"
          >
            <div className="flex items-start gap-3 border-b border-border bg-white p-5">
              <CircleX className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-hidden />
              <p className="flex-1 text-sm font-medium italic leading-relaxed text-foreground">{card.pain}</p>
            </div>
            <div className="flex items-start gap-3 bg-emerald-50/80 p-5">
              <CircleCheckBig className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
              <p className="flex-1 text-sm leading-relaxed text-muted">{card.solution}</p>
            </div>
          </div>
        ))}
      </div>
    </ProductPageSection>
  );
}

export function MechanismSection({ product }: { product: ProductConfig }) {
  return (
    <ProductPageSection variant="white">
      <ProductSectionHeader
        eyebrow="ليش يصير هالشي؟"
        title="كيف يشتغل الروتين؟"
        subtitle={product.mechanism}
      />
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-surface-rose p-6 sm:p-10">
        <p className="text-sm font-extrabold text-secondary">{product.mainIngredient}</p>
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{product.desiredOutcome}</p>
        <p className="mt-4 text-sm leading-relaxed text-foreground sm:text-base">{product.mechanism}</p>
      </div>
    </ProductPageSection>
  );
}

export function ExclusionsSection({ product }: { product: ProductConfig }) {
  const list = product.exclusions ?? [];
  if (!list.length) return null;
  return (
    <ProductPageSection variant="rose">
      <ProductSectionHeader title="شنو ما راح تلقين داخل العلبة" />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {list.map((item) => (
          <li
            key={item}
            className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-white px-3 py-4 text-center text-xs font-bold text-foreground"
          >
            <CircleX className="h-4 w-4 shrink-0 text-red-500" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </ProductPageSection>
  );
}

export function IngredientBreakdown({ product }: { product: ProductConfig }) {
  const auth = product.authority;
  return (
    <ProductPageSection variant="white">
      <ProductSectionHeader
        eyebrow="التركيبة"
        title="تركيبة سريرية، مو وعود فاضية"
        subtitle="كل مكوّن بجرعة واضحة — بدون مكونات سرية."
      />
      {auth?.certifications?.length ? (
        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
          {auth.certifications.map((c) => (
            <div
              key={c}
              className="rounded-2xl border border-border bg-surface-rose py-4 text-center text-sm font-extrabold text-primary"
            >
              {c}
            </div>
          ))}
        </div>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {product.ingredientStack.map((item) => {
          const { benefit, proof, dosage } = ingredientDetail(item);
          return (
            <div
              key={ingredientName(item)}
              className="rounded-3xl border border-border bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                <Sprout className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <h3 className="font-arabic text-lg font-extrabold text-foreground">{ingredientName(item)}</h3>
              {dosage ? <p className="mt-1 text-xs font-bold text-secondary">{dosage}</p> : null}
              <p className="mt-3 text-sm leading-relaxed text-muted">{benefit}</p>
              <p className="mt-2 text-[11px] text-muted/80">{proof}</p>
            </div>
          );
        })}
      </div>
      <div className="mx-auto mt-8 w-full max-w-md">
        <ProductMedia
          product={product}
          imageKey="ingredientImage"
          alt={product.imageAlts.ingredientImage}
          variant="section"
          frameClassName="overflow-hidden rounded-[2rem] border-8 border-white shadow-2xl"
        />
      </div>
    </ProductPageSection>
  );
}

export function AuthoritySection({ product }: { product: ProductConfig }) {
  const auth = product.authority;
  if (!auth) return null;
  return (
    <ProductPageSection variant="rose">
      <div className="max-w-3xl rounded-[2rem] border-2 border-secondary/30 bg-white p-6 sm:p-10 lg:mx-auto">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5">
          <Stethoscope className="h-4 w-4 text-primary" aria-hidden />
          <span className="text-[11px] font-bold text-primary">رأي مختص</span>
        </div>
        <p className="text-base leading-relaxed text-foreground sm:text-lg">{auth.expertQuote}</p>
        <p className="mt-6 font-arabic text-sm font-extrabold text-secondary">{auth.expertTitle}</p>
        {auth.stats?.length ? (
          <div className="mt-8 grid grid-cols-2 gap-4">
            {auth.stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-surface-rose p-4 text-center">
                <p className="font-arabic text-2xl font-extrabold text-primary">{s.value}</p>
                <p className="mt-1 text-xs text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </ProductPageSection>
  );
}

export function ProofStats({ product }: { product: ProductConfig }) {
  const stats = [
    { value: String(product.rating), label: 'تقييم' },
    { value: String(product.reviewsCount), label: 'مراجعة' },
    { value: '30', label: 'يوم ضمان' },
    { value: '2', label: 'علكة / يوم' },
  ];
  return (
    <div className="mx-auto max-w-container grid grid-cols-2 gap-3 px-4 py-6 sm:px-6 lg:grid-cols-4 lg:px-8">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl border border-border bg-white py-5 text-center shadow-sm">
          <p className="font-arabic text-2xl font-extrabold text-secondary">{s.value}</p>
          <p className="mt-1 text-xs font-medium text-muted">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

export function ResultsTimeline({ product }: { product: ProductConfig }) {
  const items = product.timeline ?? [];
  return (
    <ProductPageSection variant="rose">
      <ProductSectionHeader
        eyebrow="نتيجة من أول علبة"
        title="وش راح تشوفين خلال أول 30 يوم؟"
        subtitle="النتيجة تختلف — الاستمرار هو المفتاح."
      />
      <div className="relative mx-auto grid max-w-5xl gap-5 md:grid-cols-3 md:gap-7">
        {items.map((item, i) => (
          <div
            key={item.label}
            className="relative rounded-3xl border border-border bg-white p-6 pt-10 shadow-card"
          >
            <span className="absolute -top-4 right-1/2 flex h-9 w-9 translate-x-1/2 items-center justify-center rounded-full bg-primary font-arabic text-sm font-bold text-secondary">
              {i + 1}
            </span>
            <p className="text-center font-arabic text-base font-extrabold text-foreground">{item.label}</p>
            <p className="mt-3 text-center text-sm leading-relaxed text-muted">{item.text}</p>
          </div>
        ))}
      </div>
    </ProductPageSection>
  );
}

export function ProductTestimonials({ product }: { product: ProductConfig }) {
  const items = product.testimonials ?? [];
  return (
    <ProductPageSection variant="white">
      <ProductSectionHeader title="ما تقوله العميلات؟" subtitle="تقييمات مؤكدة — دفع عند الاستلام." />
      <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3 md:gap-6">
        {items.map((t) => (
          <div
            key={t.name}
            className="relative flex flex-col rounded-3xl border border-border bg-surface-rose p-6 sm:p-7"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-secondary">★★★★★</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                <BadgeCheck className="h-3 w-3" aria-hidden />
                مؤكدة
              </span>
            </div>
            <p className="flex-1 text-sm leading-relaxed text-foreground">{t.quote}</p>
            <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary font-arabic text-sm font-bold text-secondary">
                {t.initial}
              </span>
              <div>
                <p className="font-arabic text-sm font-extrabold text-foreground">{t.name}</p>
                <p className="text-[11px] text-muted">{t.meta}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ProductPageSection>
  );
}

export function FailureAlternativesSection({ product }: { product: ProductConfig }) {
  const alts = product.failureAlternatives ?? [];
  return (
    <ProductPageSection variant="rose">
      <ProductSectionHeader
        eyebrow="ليش لارا تختلف؟"
        title="قارني — وقرّري بنفسك"
        subtitle="بدائل ثانية غالباً ما تعطي نفس الاستمرار."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {alts.map((alt) => (
          <div
            key={alt.name}
            className="relative overflow-hidden rounded-3xl border border-border bg-white p-5 sm:p-6"
          >
            <div className="mb-3 flex items-center gap-2">
              <TriangleAlert className="h-5 w-5 text-red-500" aria-hidden />
              <p className="font-arabic font-extrabold text-foreground">{alt.name}</p>
            </div>
            <p className="text-sm font-bold text-red-700">{alt.priceNote}</p>
            <ul className="mt-4 space-y-2.5">
              {alt.points.map((pt) => (
                <li key={pt} className="flex gap-2 text-sm text-muted">
                  <CircleX className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden />
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </ProductPageSection>
  );
}

export function ComparisonSection({ product }: { product: ProductConfig }) {
  const rows = product.comparisonRows ?? [
    { label: 'السعر', product: formatPrice(getLowestOfferPrice(product)), alternative: 'أغلى على المدى الطويل' },
    { label: 'السهولة', product: 'علكتين يومياً', alternative: 'روتين معقد' },
    { label: 'الدفع', product: 'عند الاستلام', alternative: 'أونلاين' },
    { label: 'الضمان', product: '30 يوم', alternative: 'محدود' },
  ];
  return (
    <ProductPageSection variant="white">
      <ProductSectionHeader title="مقارنة سريعة" />
      <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border shadow-card">
        <div className="grid grid-cols-3 bg-primary text-xs font-bold text-white">
          <div className="p-4">المعيار</div>
          <div className="border-r border-white/20 p-4">لارا</div>
          <div className="p-4">بدائل</div>
        </div>
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-3 border-t border-border text-sm">
            <div className="bg-surface-rose p-4 font-bold text-foreground">{row.label}</div>
            <div className="flex items-center gap-2 p-4 text-muted">
              <CircleCheckBig className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
              {row.product}
            </div>
            <div className="flex items-center gap-2 p-4 text-muted">
              <CircleX className="h-4 w-4 shrink-0 text-red-500" aria-hidden />
              {row.alternative}
            </div>
          </div>
        ))}
      </div>
    </ProductPageSection>
  );
}

export function OfferRecap({
  product,
  offer,
  onCta,
}: {
  product: ProductConfig;
  offer: ProductOffer;
  onCta: () => void;
}) {
  return (
    <ProductPageSection variant="rose">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] bg-primary p-6 text-white shadow-soft sm:rounded-[3rem] sm:p-10">
        <p className="text-[11px] font-bold uppercase tracking-widest text-secondary">{offer.badge || 'عرض مختار'}</p>
        <h2 className="mt-3 font-arabic text-2xl font-extrabold">{product.name}</h2>
        <p className="mt-2 text-sm text-white/80">{offer.label} — {offer.subtitle}</p>
        <p className="mt-6 font-arabic text-3xl font-extrabold text-secondary">{formatPrice(offer.price)}</p>
        <ul className="mt-6 space-y-2.5 text-sm text-white/90">
          <li className="flex items-center gap-2">
            <CircleCheckBig className="h-4 w-4 text-secondary" aria-hidden />
            {cod.paymentLabel}
          </li>
          <li className="flex items-center gap-2">
            <CircleCheckBig className="h-4 w-4 text-secondary" aria-hidden />
            {cod.deliveryPromise}
          </li>
          <li className="flex items-center gap-2">
            <CircleCheckBig className="h-4 w-4 text-secondary" aria-hidden />
            {cod.returnGuarantee}
          </li>
        </ul>
        <button
          type="button"
          onClick={onCta}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary py-4 font-arabic text-sm font-bold text-primary-dark"
        >
          اطلبي الآن — {formatPrice(offer.price)}
        </button>
      </div>
    </ProductPageSection>
  );
}

export function GuaranteeSection() {
  const steps = [
    { title: 'تواصلي معنا', body: 'خلال 30 يوم من الاستلام' },
    { title: 'نرتّب الاسترجاع', body: 'إذا ما ناسبك الروتين' },
    { title: 'نرجّع لك المبلغ', body: 'بدون تعقيد' },
  ];
  return (
    <ProductPageSection variant="white">
      <ProductSectionHeader title="30 يوم — أو فلوسك ترجع." subtitle={cod.returnGuarantee} />
      <div className="mx-auto max-w-4xl rounded-[2rem] border-2 border-secondary/30 bg-surface-rose p-6 sm:rounded-[3rem] sm:p-10">
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          {steps.map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-border bg-white p-5 text-center">
              <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-secondary">
                {i + 1}
              </span>
              <p className="mt-3 font-arabic text-sm font-extrabold text-foreground">{s.title}</p>
              <p className="mt-1 text-xs text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </ProductPageSection>
  );
}

const usageIcons = [Clock, Package, Droplet, Sprout];

export function HowToUseSection({ product }: { product: ProductConfig }) {
  const usage = product.usage ?? {
    headline: 'أبسط روتين جربتيه',
    steps: [
      'علكتين كل يوم — بعد الفطور أو العشا حسب نوع الروتين',
      'العلبة = شهر كامل (60 علكة)',
      'بدون ماء — طعم لذيذ',
      '30 ثانية باليوم',
    ],
  };
  return (
    <ProductPageSection variant="rose">
      <ProductSectionHeader eyebrow="طريقة الاستخدام" title={usage.headline} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {usage.steps.map((step, i) => {
          const Icon = usageIcons[i % usageIcons.length];
          return (
            <div
              key={step}
              className="rounded-3xl border border-border bg-white p-5 transition hover:border-primary/30 hover:shadow-lg sm:p-6"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <h3 className="font-arabic text-sm font-extrabold text-foreground">خطوة {i + 1}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step}</p>
            </div>
          );
        })}
      </div>
    </ProductPageSection>
  );
}

export function CODDeliverySection() {
  const steps = [
    { icon: HandCoins, title: 'اطلبي الآن', body: 'اختاري العرض، اكتبي اسمك ورقمك — بدون دفع أونلاين.' },
    { icon: Phone, title: cod.confirmationPromise, body: 'عربي 100% — نأكد العنوان والكمية.' },
    { icon: Truck, title: 'استلمي وادفعي', body: 'تدفعين كاش أو كي نت لما يوصلك الطلب.' },
  ];
  return (
    <ProductPageSection variant="white">
      <ProductSectionHeader
        eyebrow="التوصيل والدفع"
        title="كيف يوصلك طلبك — بكل بساطة"
        subtitle={cod.paymentLabel}
      />
      <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3 md:gap-7">
        {steps.map((s, i) => (
          <div key={s.title} className="relative rounded-3xl border border-border bg-surface-rose p-6 pt-10">
            <span className="absolute -top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
              <s.icon className="h-4 w-4" aria-hidden />
            </span>
            <p className="font-arabic text-base font-extrabold text-foreground">{s.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            <span className="absolute left-4 top-4 font-arabic text-xs font-bold text-secondary/60">
              {i + 1}
            </span>
          </div>
        ))}
      </div>
    </ProductPageSection>
  );
}

export function DeliveryCitiesSection({ product }: { product: ProductConfig }) {
  const cities = product.delivery?.cities ?? [market.countryName];
  const carriers = product.delivery?.carriers ?? [];
  return (
    <ProductPageSection variant="rose">
      <ProductSectionHeader title={`نوصّل لكل مناطق ${market.countryName}`} />
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" aria-hidden />
          <p className="font-arabic text-sm font-extrabold text-foreground">مدن التوصيل</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <span
              key={city}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-rose px-3 py-1.5 text-[11px] font-medium text-foreground"
            >
              <CircleCheckBig className="h-3 w-3 text-emerald-600" aria-hidden />
              {city}
            </span>
          ))}
        </div>
        {carriers.length ? (
          <p className="mt-5 flex items-center gap-2 text-[11px] text-muted">
            <Truck className="h-4 w-4" aria-hidden />
            {carriers.join(' • ')}
          </p>
        ) : null}
      </div>
    </ProductPageSection>
  );
}

export function ProductFAQ({ product }: { product: ProductConfig }) {
  const base = product.faq ?? [
    {
      question: 'كم السعر والعروض؟',
      answer: `عروض من ${formatPrice(16)} لعلبة وحدة إلى ${formatPrice(29)} لثلاث علب. الدفع عند الاستلام.`,
    },
    {
      question: 'متى أشوف نتيجة؟',
      answer: 'تختلف من شخص لشخص. الاستمرار 2–4 أسابيع يساعد على تقييم الروتين.',
    },
    {
      question: 'هل آمن للاستخدام اليومي؟',
      answer: 'اتبعي التعليمات على العلبة. إذا عندك حالة صحية أو حامل — استشيري طبيبك.',
    },
    {
      question: 'كيف الدفع والتوصيل؟',
      answer: `${cod.paymentLabel}. ${cod.deliveryPromise}.`,
    },
  ];

  return (
    <ProductPageSection variant="white">
      <ProductSectionHeader eyebrow="قبل ما تطلبين" title="كل اللي تحتاجين تعرفينه" />
      <div className="mx-auto max-w-3xl space-y-2">
        {base.map((item) => (
          <details
            key={item.question}
            className="group overflow-hidden rounded-2xl border border-border bg-white"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 font-arabic text-sm font-bold text-foreground [&::-webkit-details-marker]:hidden">
              {item.question}
              <ChevronDown className="h-5 w-5 shrink-0 text-muted transition group-open:rotate-180" aria-hidden />
            </summary>
            <p className="border-t border-border px-5 pb-5 pt-2 text-sm leading-relaxed text-muted">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </ProductPageSection>
  );
}

export function RelatedProducts({
  product,
  onSelect,
}: {
  product: ProductConfig;
  onSelect?: (slug: string) => void;
}) {
  const slugs = product.relatedSlugs ?? [];
  const related = products.filter((p) => slugs.includes(p.slug));
  if (!related.length) return null;

  return (
    <ProductPageSection variant="rose">
      <ProductSectionHeader title="منتجات أخرى من لارا" />
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 md:gap-8">
        {related.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            onClick={() => onSelect?.(p.slug)}
            className="group flex gap-5 rounded-3xl border border-border bg-white p-4 shadow-xl transition hover:-translate-y-1 hover:border-primary/50 sm:p-5"
          >
            {p.collectionImage ? (
              <MediaFrame
                src={p.collectionImage}
                alt={p.collectionImageAlt ?? p.shortName}
                layout="thumb"
              />
            ) : (
              <div className="aspect-square w-28 shrink-0 rounded-2xl bg-surface-rose" />
            )}
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <p className="font-arabic text-base font-extrabold leading-snug text-foreground group-hover:text-primary">
                {p.cardHeadline}
              </p>
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">{p.cardSubheadline}</p>
              <p className="mt-3 font-arabic text-sm font-extrabold text-secondary">
                {formatPriceFrom(getLowestOfferPrice(p))}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </ProductPageSection>
  );
}
