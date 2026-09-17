type CheckoutFormSectionProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

/** Smooche-style form block — clean section header, no heavy card chrome */
export function CheckoutFormSection({ title, subtitle, children }: CheckoutFormSectionProps) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="font-arabic text-base font-extrabold text-foreground">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-sm text-muted">{subtitle}</p> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
