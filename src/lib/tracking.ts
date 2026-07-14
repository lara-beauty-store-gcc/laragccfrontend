type TrackPayload = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: string, payload?: TrackPayload) {
  if (typeof window === 'undefined') return;
  const w = window as Window & { fbq?: (...a: unknown[]) => void; ttq?: { track: (...a: unknown[]) => void } };
  try {
    w.fbq?.('track', name, payload);
  } catch {
    /* optional */
  }
  try {
    w.ttq?.track(name, payload);
  } catch {
    /* optional */
  }
  if (process.env.NODE_ENV === 'development') {
    console.debug('[track]', name, payload);
  }
}

export function trackViewContent(product: {
  id: string;
  sku: string;
  name: string;
  price: number;
  currency: string;
}) {
  trackEvent('ViewContent', {
    content_ids: product.sku,
    content_name: product.name,
    value: product.price,
    currency: product.currency,
  });
}

export function trackAddToCart(payload: TrackPayload) {
  trackEvent('AddToCart', payload);
}
