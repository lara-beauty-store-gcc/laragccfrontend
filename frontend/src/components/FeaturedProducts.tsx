import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { products, getLowestOfferPrice } from '@/config/products';
import { formatPriceFrom } from '@/lib/pricing';
import { ProductCollectionImage } from './ProductCollectionImage';
import { SectionHeader } from './SectionHeader';
import { Stars } from './Stars';

export function FeaturedProducts() {
  return (
    <section id="products" className="scroll-mt-20 bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
        <SectionHeader
          className="mb-12 lg:mb-16"
          eyebrow="Our Formulations"
          title="ثلاث علكات. ثلاث احتياجات. حلّ واحد."
          subtitle="كل علكة من لارا تركيبة مستقلة بجرعات مدروسة. اختاري احتياجك، أو ادمجي الثلاث للروتين الكامل."
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <article
              key={product.id}
              className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card transition hover:shadow-soft"
            >
              <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col">
                <div className="relative p-4 pb-0">
                  <span className="absolute left-4 top-4 z-10 rounded-full border border-border bg-white/90 px-3 py-1 text-[10px] font-bold text-primary shadow-sm backdrop-blur-sm">
                    {product.routineNameLocal} · {product.routineNameEnglish}
                  </span>
                <ProductCollectionImage product={product} priority={index === 0} />
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="font-arabic text-lg font-extrabold leading-snug text-foreground sm:text-xl">
                    {product.name}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                    {product.cardSubheadline}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
                    <Stars rating={product.rating} count={product.reviewsCount} />
                    <p className="font-arabic text-sm font-extrabold text-primary">
                      {formatPriceFrom(getLowestOfferPrice(product))}
                    </p>
                  </div>
                  <span className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 py-3 text-sm font-bold text-primary transition group-hover:bg-primary group-hover:text-white">
                    شوفي التفاصيل
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
