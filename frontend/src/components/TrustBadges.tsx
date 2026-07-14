import { getTrustBadges } from '@/lib/marketing';
import { TrustIcon } from './icons';

export function TrustBadgesRow({
  className = '',
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const badges = getTrustBadges();

  return (
    <div
      className={`grid grid-cols-2 gap-2 sm:grid-cols-4 ${className}`}
    >
      {badges.map((b) => (
        <div
          key={b.label}
          className={`rounded-xl border border-border bg-card text-center ${
            compact ? 'px-2 py-2' : 'px-3 py-4'
          }`}
        >
          <TrustIcon
            name={b.icon as 'shield'}
            className={`mx-auto text-primary ${compact ? 'h-4 w-4' : 'h-5 w-5'}`}
          />
          <p className={`mt-1 font-arabic font-semibold text-primary ${compact ? 'text-[10px]' : 'text-xs'}`}>
            {b.label}
          </p>
          {!compact && (
            <p className="mt-0.5 text-[10px] text-muted">{b.sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function TrustStrip() {
  const badges = getTrustBadges();
  return (
    <section className="border-y border-border bg-card px-4 py-6">
      <div className="mx-auto flex max-w-lg flex-wrap justify-center gap-2">
        {badges.map((b) => (
          <span
            key={b.label}
            className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-medium text-primary"
          >
            {b.label}
          </span>
        ))}
      </div>
    </section>
  );
}
