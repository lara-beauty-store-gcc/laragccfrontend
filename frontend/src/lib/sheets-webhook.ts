import { businessConfig } from '@/config/business';

export type SheetsOrderItem = {
  product: string;
  url: string;
  sku: string;
  quantity: number;
  totalPrice: number;
};

export type SheetsOrderPayload = {
  customerName: string;
  phone: string;
  country: string;
  currency: string;
  area?: string;
  sourceUrl?: string;
  items: SheetsOrderItem[];
  orderIds?: string[];
  date?: string;
};

export type SheetsForwardResult =
  | { ok: true; orderIds: string[] }
  | { ok: false; reason: string; status?: number; detail?: string };

const { market } = businessConfig;

export function sheetsWebhookUrl() {
  return (
    process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
    process.env.ORDERS_SHEETS_WEBHOOK_URL ||
    ''
  );
}

export function sheetsWebhookConfigured() {
  return Boolean(sheetsWebhookUrl());
}

export async function forwardOrderToSheets(payload: SheetsOrderPayload): Promise<SheetsForwardResult> {
  const webhookUrl = sheetsWebhookUrl();
  if (!webhookUrl) {
    return { ok: false, reason: 'sheets_not_configured' };
  }

  const webhookSecret = process.env.SHEETS_WEBHOOK_SECRET || '';

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      redirect: 'follow',
      body: JSON.stringify({
        secret: webhookSecret,
        date: payload.date || new Date().toISOString(),
        customer_name: payload.customerName,
        phone: payload.phone,
        country: payload.country || market.countryCode,
        currency: payload.currency || market.currency,
        area: payload.area || '',
        items: payload.items,
        order_ids: payload.orderIds,
        source_url: payload.sourceUrl,
      }),
    });

    const text = await res.text();
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      data = { raw: text.slice(0, 500) };
    }

    if (!res.ok || data.ok === false) {
      const detail =
        typeof data.error === 'string'
          ? data.error
          : typeof data.raw === 'string'
            ? data.raw
            : text.slice(0, 500);

      console.warn('[sheets] webhook failed', res.status, detail);
      return { ok: false, reason: 'sheets_rejected', status: res.status, detail };
    }

    const orderIds: string[] = Array.isArray(data.order_ids)
      ? data.order_ids.map(String)
      : data.order_id
        ? [String(data.order_id)]
        : payload.orderIds || [];

    if (orderIds.length === 0) {
      return { ok: false, reason: 'sheets_missing_order_ids', detail: text.slice(0, 500) };
    }

    return { ok: true, orderIds };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[sheets] webhook error', message);
    return { ok: false, reason: 'sheets_network_error', detail: message };
  }
}
