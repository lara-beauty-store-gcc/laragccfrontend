'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { businessInputs } from '@/config/business';

const { brand } = businessInputs;

function ThankYouContent() {
  const params = useSearchParams();
  const orderId = params.get('order') ?? '';

  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl text-accent">
        ✓
      </div>
      <h1 className="font-arabic text-2xl font-bold text-primary">تم استلام طلبك!</h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
        شكراً لك. فريق {brand.nameLocal} بيتصل فيك قريب يأكد العنوان. الدفع عند الاستلام.
      </p>
      {orderId && (
        <p className="mt-4 rounded-lg bg-surface px-4 py-2 text-xs text-muted">
          رقم الطلب: <span className="font-mono text-primary">{orderId}</span>
        </p>
      )}
      <Link
        href="/"
        className="mt-8 rounded-xl bg-primary px-8 py-3 font-arabic text-sm font-semibold text-white"
      >
        رجوع للرئيسية
      </Link>
    </section>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted">...</p>}>
      <ThankYouContent />
    </Suspense>
  );
}
