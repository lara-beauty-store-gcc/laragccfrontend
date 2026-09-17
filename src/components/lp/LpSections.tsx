'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import { businessConfig } from '@/config/business';

const { market } = businessConfig;

const ACTIVITY = [
  { name: 'نورة', city: 'دبي', minutesAgo: 2 },
  { name: 'سارة', city: 'أبوظبي', minutesAgo: 5 },
  { name: 'مريم', city: 'الشارقة', minutesAgo: 8 },
  { name: 'هند', city: 'عجمان', minutesAgo: 11 },
  { name: 'ليلى', city: 'دبي', minutesAgo: 14 },
  { name: 'ريم', city: 'العين', minutesAgo: 17 },
];

export function LpActivityFeed() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((current) => (current + 1) % ACTIVITY.length);
        setVisible(true);
      }, 300);
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  const item = ACTIVITY[index];

  return (
    <div
      className={`fixed bottom-5 left-4 z-40 max-w-xs rounded-2xl border border-border bg-white/95 p-4 shadow-card backdrop-blur transition-all duration-300 sm:left-6 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShoppingBag className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">
            {item.name} من {item.city}
          </p>
          <p className="mt-0.5 text-xs text-muted">أكّدت طلبها للتو · دفع عند الاستلام</p>
          <p className="mt-1 text-[11px] text-muted">منذ {item.minutesAgo} دقائق</p>
        </div>
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
      </div>
    </div>
  );
}

export function LpReviews() {
  const reviews = [
    {
      name: 'أمل الحمادي',
      city: 'دبي',
      text: 'تجربة شراء سلسة من أول زيارة. التواصل واضح والطلب سهل.',
      rating: 5,
      initial: 'أ',
    },
    {
      name: 'شيماء المنصوري',
      city: 'أبوظبي',
      text: 'خدمة العملاء ردّت بسرعة ووضّحت خطوات التوصيل بدون تعقيد.',
      rating: 5,
      initial: 'ش',
    },
    {
      name: 'دانة الكعبي',
      city: 'الشارقة',
      text: 'الموقع مرتب والدفع عند الاستلام يخلي التجربة مريحة.',
      rating: 5,
      initial: 'د',
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Customer Feedback</p>
          <h2 className="mt-2 font-arabic text-2xl font-extrabold text-primary sm:text-3xl">
            تجارب عملاء داخل {market.countryName}
          </h2>
          <p className="mt-2 text-sm text-muted">آراء عامة عن تجربة الشراء والتوصيل — بدون ادعاءات صحية.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {reviews.map((review) => (
            <blockquote
              key={review.name}
              className="rounded-3xl border border-border bg-[#f6f2e8] p-6 text-center shadow-sm"
            >
              <div className="mb-4 flex justify-center gap-0.5 text-secondary">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <span key={i} aria-hidden>
                    ★
                  </span>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-foreground">{review.text}</p>
              <footer className="mt-5 border-t border-border/60 pt-4">
                <p className="font-arabic text-sm font-extrabold">{review.name}</p>
                <p className="text-xs text-muted">{review.city} · عميلة</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
