import { Mail, Phone } from 'lucide-react';
import { businessConfig } from '@/config/business';

const { support, market } = businessConfig;

type SupportContactProps = {
  variant?: 'footer' | 'light';
  showTitle?: boolean;
};

export function SupportContact({ variant = 'footer', showTitle = true }: SupportContactProps) {
  const isFooter = variant === 'footer';

  return (
    <div>
      {showTitle ? (
        <p
          className={`mb-3 font-arabic text-sm font-bold ${isFooter ? 'text-secondary' : 'text-primary'}`}
        >
          تواصل معنا
        </p>
      ) : null}
      <ul className={`space-y-2 text-sm ${isFooter ? 'text-white/75' : 'text-muted'}`}>
        <li>
          <a
            href={`mailto:${support.email}`}
            className={`inline-flex items-center gap-2 transition ${isFooter ? 'hover:text-white' : 'hover:text-primary'}`}
          >
            <Mail className="h-4 w-4 shrink-0" aria-hidden />
            <span dir="ltr">{support.email}</span>
          </a>
        </li>
        <li>
          <a
            href={`tel:${support.phoneDisplay.replace(/\s/g, '')}`}
            className={`inline-flex items-center gap-2 transition ${isFooter ? 'hover:text-white' : 'hover:text-primary'}`}
          >
            <Phone className="h-4 w-4 shrink-0" aria-hidden />
            <span dir="ltr">{support.phoneDisplay}</span>
          </a>
        </li>
        <li className={`text-xs ${isFooter ? 'text-white/55' : 'text-muted'}`}>
          {support.hours} · {market.countryName}
        </li>
      </ul>
    </div>
  );
}
