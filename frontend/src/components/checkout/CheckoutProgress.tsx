'use client';

import { Check } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'معلومات الطلب' },
  { id: 2, label: 'طريقة الدفع' },
  { id: 3, label: 'تأكيد الطلب' },
] as const;

type CheckoutProgressProps = {
  currentStep: 1 | 2 | 3;
};

export function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  return (
    <nav aria-label="خطوات الطلب" className="hidden sm:block">
      <ol className="flex items-center justify-center gap-2 md:gap-4">
        {STEPS.map((step, index) => {
          const done = step.id < currentStep;
          const active = step.id === currentStep;

          return (
            <li key={step.id} className="flex items-center gap-2 md:gap-4">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    done
                      ? 'bg-primary text-white'
                      : active
                        ? 'bg-primary text-white ring-4 ring-primary/15'
                        : 'bg-gray-100 text-muted'
                  }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : step.id}
                </span>
                <span
                  className={`hidden font-arabic text-xs font-bold md:inline ${
                    active ? 'text-primary' : done ? 'text-foreground' : 'text-muted'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 ? (
                <span className="h-px w-6 bg-border md:w-10" aria-hidden />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
