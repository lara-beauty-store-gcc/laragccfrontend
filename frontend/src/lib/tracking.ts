type TrackPayload = Record<string, string | number | boolean | undefined>;

type TrackerWindow = Window & {
  fbq?: (...args: unknown[]) => void;
  ttq?: { track: (...args: unknown[]) => void };
};

function firstContentId(payload?: TrackPayload) {
  const raw = payload?.content_ids ?? payload?.content_id;
  if (typeof raw === 'string' && raw.includes(',')) return raw.split(',')[0]?.trim();
  return typeof raw === 'string' || typeof raw === 'number' ? String(raw) : undefined;
}

function tiktokPayload(payload?: TrackPayload) {
  if (!payload) return undefined;

  const contentId = firstContentId(payload);
  const mapped: TrackPayload = {
    content_type: payload.content_type ?? 'product',
    value: payload.value,
    currency: payload.currency,
    quantity: payload.quantity ?? payload.num_items,
    content_name: payload.content_name,
    order_id: payload.order_id,
  };

  if (contentId) mapped.content_id = contentId;
  return mapped;
}

export function trackEvent(name: string, payload?: TrackPayload) {
  if (typeof window === 'undefined') return;
  const w = window as TrackerWindow;
  try {
    w.fbq?.('track', name, payload);
  } catch {
    /* optional */
  }
  try {
    w.ttq?.track(name, tiktokPayload(payload));
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

export function trackPurchase(payload: {
  orderId: string;
  value: number;
  currency: string;
  items: Array<{ sku: string; qty: number; price: number }>;
}) {
  trackEvent('Purchase', {
    content_ids: payload.items.map((i) => i.sku).join(','),
    content_type: 'product',
    num_items: payload.items.reduce((n, i) => n + i.qty, 0),
    value: payload.value,
    currency: payload.currency,
    order_id: payload.orderId,
  });
}
