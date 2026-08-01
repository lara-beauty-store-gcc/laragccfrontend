export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  className = '',
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`text-center ${className}`}>
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.25em] text-secondary">
        {eyebrow}
      </p>
      <h2 className="mb-4 font-arabic text-2xl font-extrabold leading-snug text-foreground lg:text-3xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted lg:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
