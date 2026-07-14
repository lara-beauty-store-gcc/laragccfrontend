import { getTestimonials } from '@/lib/marketing';
import type { ProductConfig } from '@/config/products';
import { SectionHeader } from './SectionHeader';
import { Stars } from './Stars';

export function Testimonials({ product }: { product?: ProductConfig }) {
  const items = getTestimonials(product);

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
        <SectionHeader
          className="mb-12 lg:mb-16"
          eyebrow="Verified Reviews"
          title="عميلات جرّبن لارا داخل الإمارات"
          subtitle="تقييمات حقيقية من مشتريات مؤكدة — دفع عند الاستلام."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <blockquote
              key={t.name}
              className="flex flex-col rounded-3xl border border-border bg-[#f6f2e8] p-6"
            >
              <div className="mb-4 flex items-start justify-between">
                <span className="text-3xl font-serif leading-none text-primary/25">&ldquo;</span>
                <Stars rating={t.rating} />
              </div>
              <p className="flex-1 text-center text-sm leading-relaxed text-foreground">{t.text}</p>
              <footer className="mt-6 flex items-center justify-end gap-3 border-t border-border/60 pt-4">
                <div className="text-right">
                  <p className="font-arabic text-sm font-extrabold text-foreground">{t.name}</p>
                  <p className="text-[11px] text-muted">{t.meta}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary font-arabic text-sm font-bold text-secondary">
                  {t.initial}
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
