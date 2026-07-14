export function SectionShell({
  eyebrow,
  title,
  subtitle,
  children,
  className = '',
  dark = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <section
      className={`px-4 py-10 ${dark ? 'bg-primary text-white' : ''} ${className}`}
    >
      {eyebrow ? (
        <p
          className={`text-center text-[11px] font-semibold ${dark ? 'text-accent' : 'text-accent'}`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`mt-2 text-center font-arabic text-xl font-bold leading-snug ${dark ? 'text-white' : 'text-primary'}`}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={`mx-auto mt-2 max-w-sm text-center text-sm leading-relaxed ${dark ? 'text-white/80' : 'text-muted'}`}
        >
          {subtitle}
        </p>
      ) : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}
