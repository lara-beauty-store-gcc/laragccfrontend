type TrackPayload = Record<string, string | number | boolean | undefined>;

type TrackerWindow = Window & {
  fbq?: (...args: unknown[]) => void;
  ttq?: { track: (...args: unknown[]) => void };
  snaptr?: (...args: unknown[]) => void;
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

function snapEventName(name: string) {
  switch (name) {
    case 'ViewContent':
      return 'VIEW_CONTENT';
    case 'AddToCart':
      return 'ADD_CART';
    case 'Lead':
      return 'START_CHECKOUT';
    case 'Purchase':
      return 'PURCHASE';
    default:
      return name;
  }
}

function snapItemIds(payload?: TrackPayload): string[] | undefined {
  const raw = payload?.content_ids ?? payload?.content_id;
  if (raw === undefined || raw === '') return undefined;
  if (typeof raw === 'string' && raw.includes(',')) {
    return raw.split(',').map((id) => id.trim()).filter(Boolean);
  }
  return [String(raw)];
}

function snapPayload(payload?: TrackPayload, snapEvent?: string): Record<string, unknown> | undefined {
  if (!payload) return undefined;

  const itemIds = snapItemIds(payload);
  const mapped: Record<string, unknown> = {
    currency: payload.currency,
    price: payload.value,
    transaction_id: payload.order_id,
    number_items: payload.quantity ?? payload.num_items,
    item_category: payload.content_type ?? 'product',
  };

  if (itemIds?.length) mapped.item_ids = itemIds;

  if (snapEvent === 'PURCHASE' && payload.order_id) {
    const dedupId = String(payload.event_id || `purchase_${payload.order_id}`);
    mapped.client_dedup_id = dedupId;
    mapped.transaction_id = payload.order_id;
  }

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
  try {
    const snapEvent = snapEventName(name);
    w.snaptr?.('track', snapEvent, snapPayload(payload, snapEvent));
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
    event_id: `purchase_${payload.orderId}`,
  });
}
