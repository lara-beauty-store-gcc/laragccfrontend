import type { ReactNode } from 'react';

export function ProductPageSection({
  children,
  variant = 'white',
  className = '',
  id,
}: {
  children: ReactNode;
  variant?: 'white' | 'rose';
  className?: string;
  id?: string;
}) {
  const bg = variant === 'white' ? 'bg-white' : 'bg-surface-rose';
  return (
    <section id={id} className={`py-14 sm:py-16 lg:py-24 ${bg} ${className}`}>
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

export function ProductSectionHeader({
  eyebrow,
  title,
  subtitle,
  className = '',
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`mb-10 w-full max-w-3xl sm:mb-12 lg:mx-auto lg:text-center ${className}`}>
      {eyebrow ? (
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.25em] text-secondary">{eyebrow}</p>
      ) : null}
      <h2 className="text-balance font-arabic text-2xl font-extrabold leading-snug text-foreground sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
}
