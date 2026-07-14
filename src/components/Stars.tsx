export function Stars({ rating = 5, count }: { rating?: number; count?: number }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div className="flex gap-0.5 text-secondary" aria-label={`${rating} من 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="text-sm">
            {i < Math.round(rating) ? '★' : '☆'}
          </span>
        ))}
      </div>
      {count != null && (
        <span className="text-xs text-muted">({count} تقييم)</span>
      )}
    </div>
  );
}
