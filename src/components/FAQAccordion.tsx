'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { getFaqs } from '@/lib/marketing';
import type { ProductConfig } from '@/config/products';
import { SectionHeader } from './SectionHeader';

export function FAQAccordion({ product }: { product?: ProductConfig }) {
  const faqs = getFaqs(product);
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
        <SectionHeader
          className="mb-10 lg:mb-12"
          eyebrow="FAQ"
          title="أسئلة قبل الطلب"
          subtitle="كل شيء تحتاجين معرفته قبل الدفع عند الاستلام."
        />

        <div className="mx-auto max-w-3xl space-y-2">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={faq.q}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-5 py-4 text-right"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition ${
                      isOpen ? 'rotate-45' : ''
                    }`}
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="flex-1 font-arabic text-sm font-bold text-foreground sm:text-base">
                    {faq.q}
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-border px-5 pb-5 pt-2">
                    <p className="text-sm leading-relaxed text-muted">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
