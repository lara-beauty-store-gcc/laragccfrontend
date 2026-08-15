import { getHowItWorksSteps } from '@/lib/marketing';
import { SectionHeader } from './SectionHeader';

export function HowItWorks() {
  const steps = getHowItWorksSteps();

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
        <SectionHeader
          className="mb-12 lg:mb-16"
          eyebrow="How It Works"
          title="من الطلب لباب بيتك في 3 خطوات"
          subtitle="بدون دفع أونلاين. بدون التزام. بدون مخاطرة."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.n}
              className="rounded-3xl border border-border bg-white p-6 text-center shadow-card md:text-right"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-secondary bg-primary font-arabic text-xl font-bold text-secondary md:mx-0">
                {step.n}
              </div>
              <h3 className="font-arabic text-lg font-extrabold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
