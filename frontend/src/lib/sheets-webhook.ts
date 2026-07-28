import { businessConfig } from '@/config/business';
import { normalizeSheetItems, type RawSheetItem, type SheetsOrderItem } from '@/lib/sheets-export';

export type { SheetsOrderItem };

export type SheetsOrderPayload = {
  customerName: string;
  phone: string;
  country: string;
  currency: string;
  area?: string;
  sourceUrl?: string;
  items: SheetsOrderItem[] | RawSheetItem[];
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

function siteBaseUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://larabeauty.store').replace(/\/$/, '');
}

export function mapPayloadToSheetItems(payload: SheetsOrderPayload): SheetsOrderItem[] {
  return normalizeSheetItems(payload.items, {
    siteBaseUrl: siteBaseUrl(),
    sourceUrl: payload.sourceUrl,
  });
}

export async function forwardOrderToSheets(payload: SheetsOrderPayload): Promise<SheetsForwardResult> {
  const webhookUrl = sheetsWebhookUrl();
  if (!webhookUrl) {
    return { ok: false, reason: 'sheets_not_configured' };
  }

  const items = mapPayloadToSheetItems(payload);
  if (items.length === 0) {
    return { ok: false, reason: 'sheets_empty_items', detail: 'No valid line items after normalization' };
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
        customer_name: String(payload.customerName || '').trim(),
        phone: String(payload.phone || '').trim(),
        country: String(payload.country || market.countryCode).trim() || market.countryCode,
        currency: String(payload.currency || market.currency).trim() || market.currency,
        area: String(payload.area || '').trim(),
        items,
        order_ids: Array.isArray(payload.orderIds) ? payload.orderIds.map(String) : [],
        source_url: payload.sourceUrl || siteBaseUrl(),
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
