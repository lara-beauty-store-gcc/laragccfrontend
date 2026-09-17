import { FlaskConical, Handshake, Microscope, ShieldCheck, Truck } from 'lucide-react';
import { getWhyBrandCards } from '@/lib/marketing';
import { SectionHeader } from './SectionHeader';

const iconMap = {
  shield: ShieldCheck,
  microscope: Microscope,
  handshake: Handshake,
  truck: Truck,
} as const;

export function WhyBrand() {
  const cards = getWhyBrandCards();

  return (
    <section className="bg-gradient-to-b from-surface-rose/60 to-background py-16 lg:py-24">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
        <SectionHeader
          className="mb-12 lg:mb-16"
          eyebrow="Why Lara Beauty"
          title="لارا مو متجر عادي — روتين يومي واضح"
          subtitle="أربعة أركان: تركيبة واضحة، جرعات مدروسة، حلال، وراحة العميلة في الإمارات."
        />

        <div className="grid gap-6 sm:grid-cols-2">
          {cards.map((card) => {
            const Icon = iconMap[card.icon] ?? FlaskConical;
            return (
              <div
                key={card.title}
                className="rounded-3xl border border-border bg-white p-6 shadow-card transition hover:shadow-soft"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-secondary">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="font-arabic text-lg font-extrabold text-foreground">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{card.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
