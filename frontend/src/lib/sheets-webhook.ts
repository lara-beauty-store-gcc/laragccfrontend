import { businessConfig } from '@/config/business';
import { normalizeSheetItems, type RawSheetItem, type SheetsOrderItem } from '@/lib/sheets-export';
import { runtimeEnv, sheetsWebhookSecret, sheetsWebhookUrl } from '@/lib/runtime-env';
import { formatPhoneForSheet, normalizeCustomerName } from '@/lib/phone';

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

export function sheetsWebhookConfigured() {
  return Boolean(sheetsWebhookUrl());
}

function siteBaseUrl() {
  return runtimeEnv('NEXT_PUBLIC_SITE_URL', 'https://larabeauty.store').replace(/\/$/, '');
}

export function mapPayloadToSheetItems(payload: SheetsOrderPayload): SheetsOrderItem[] {
  return normalizeSheetItems(payload.items, {
    siteBaseUrl: siteBaseUrl(),
    sourceUrl: payload.sourceUrl,
  });
}

function formatDubaiSheetDate(input?: string): string {
  const date = input ? new Date(input) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Dubai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
      .format(new Date())
      .replace(',', '');
  }

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(date)
    .replace(',', '');
}

/** Flat row — matches user's Apps Script (one POST = one sheet row). */
function buildFlatRowPayload(
  payload: SheetsOrderPayload,
  item: SheetsOrderItem,
  orderId: string,
) {
  const fullName = normalizeCustomerName(payload.customerName);
  const phoneRaw = String(payload.phone || '').trim();
  const phoneDisplay = formatPhoneForSheet(phoneRaw);

  return {
    secret: sheetsWebhookSecret(),
    date: payload.date ? formatDubaiSheetDate(payload.date) : formatDubaiSheetDate(),
    'order id': orderId,
    order_id: orderId,
    order_number: orderId,
    name: fullName,
    customer_name: fullName,
    full_name: fullName,
    phone: phoneDisplay,
    phone_e164: phoneDisplay,
    phone_display: phoneDisplay,
    product: item.product,
    url: item.url,
    source_url: item.url || payload.sourceUrl || siteBaseUrl(),
    sku: item.sku,
    quantite: item.quantity,
    quantity: item.quantity,
    totalprice: item.totalPrice,
    total_aed: item.totalPrice,
    total: item.totalPrice,
    country: String(payload.country || market.countryCode).trim() || market.countryCode,
    currency: String(payload.currency || market.currency).trim() || market.currency,
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postFlatRow(
  webhookUrl: string,
  row: ReturnType<typeof buildFlatRowPayload>,
): Promise<{ ok: boolean; orderId?: string; detail?: string; status?: number }> {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    redirect: 'follow',
    body: JSON.stringify(row),
  });

  const text = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(text) as Record<string, unknown>;
  } catch {
    data = { raw: text.slice(0, 500) };
  }

  const orderId = data.order_id ? String(data.order_id) : row.order_id;
  const accepted = res.ok && data.ok !== false && Boolean(orderId);

  if (!accepted) {
    const detail =
      typeof data.error === 'string'
        ? data.error
        : typeof data.raw === 'string'
          ? data.raw
          : text.slice(0, 500);
    return { ok: false, detail, status: res.status };
  }

  return { ok: true, orderId };
}

export async function forwardOrderToSheetsWithRetry(
  payload: SheetsOrderPayload,
  attempts = 2,
  delayMs = 150,
): Promise<SheetsForwardResult & { attempts: number; latencyMs: number }> {
  const started = Date.now();
  let last: SheetsForwardResult = { ok: false, reason: 'sheets_not_attempted' };

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    last = await forwardOrderToSheets(payload);
    if (last.ok) {
      return { ...last, attempts: attempt, latencyMs: Date.now() - started };
    }
    if (attempt < attempts) await sleep(delayMs);
  }

  return { ...last, attempts, latencyMs: Date.now() - started };
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

  const presetIds = Array.isArray(payload.orderIds) ? payload.orderIds.map(String) : [];
  const orderIds: string[] = [];

  try {
    for (let index = 0; index < items.length; index += 1) {
      const orderId = presetIds[index] || presetIds[0] || `LARA-${Date.now().toString(36).toUpperCase()}`;
      const row = buildFlatRowPayload(payload, items[index], orderId);
      const result = await postFlatRow(webhookUrl, row);

      if (!result.ok) {
        console.warn('[sheets] flat row failed', orderId, result.detail);
        return {
          ok: false,
          reason: 'sheets_rejected',
          status: result.status,
          detail: result.detail || `Failed on item ${index + 1}`,
        };
      }

      orderIds.push(result.orderId || orderId);
    }

    return { ok: true, orderIds };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[sheets] webhook error', message);
    return { ok: false, reason: 'sheets_network_error', detail: message };
  }
}
