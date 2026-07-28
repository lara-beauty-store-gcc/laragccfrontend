import { businessConfig } from '@/config/business';

export type OrderLinePayload = {
  sku: string;
  name: string;
  slug: string;
  quantity: number;
  lineTotal: number;
};

export type SubmitOrderPayload = {
  customerName: string;
  phone: string;
  area?: string;
  items: OrderLinePayload[];
  sourceUrl?: string;
};

export type SubmitOrderResult = {
  success: boolean;
  orderId: string;
  orderIds: string[];
  sheetSynced?: boolean;
};

export async function submitOrder(payload: SubmitOrderPayload): Promise<SubmitOrderResult> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.error || 'order_failed');
  }

  if (data.sheetSynced === false) {
    throw new Error(data.message || 'sheet_sync_failed');
  }

  const orderIds: string[] = Array.isArray(data.orderIds) ? data.orderIds : [];
  const orderId = String(data.orderId || orderIds[0] || '');

  if (!orderId) {
    throw new Error('order_failed');
  }

  return { success: true, orderId, orderIds };
}

export function formatOrderIdLabel(orderIds: string[]): string {
  if (orderIds.length <= 1) return orderIds[0] ?? '';
  return orderIds.join(' · ');
}

export function buildProductUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://larabeauty.store';
  return `${base.replace(/\/$/, '')}/products/${slug}`;
}

export const orderCurrency = businessConfig.market.currency;
