import { config } from '../config.js';
import { log } from '../logger.js';

const JAVA_ARRAY_REF = /^\[L[\w.$]+;@[0-9a-f]+$/i;

function siteBaseUrl() {
  return (config.frontendUrl || 'https://larabeauty.store').replace(/\/$/, '');
}

function isGarbageSerialized(value) {
  if (!value) return true;
  if (JAVA_ARRAY_REF.test(value)) return true;
  if (value === '[object Object]') return true;
  if (value === 'undefined' || value === 'null') return true;
  return false;
}

function serializeProduct(value) {
  if (value == null || value === '') return '';

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return isGarbageSerialized(trimmed) ? '' : trimmed;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
          const name = serializeProduct(
            entry.name || entry.productName || entry.product || entry.title || entry.label,
          );
          if (!name) return '';
          const qty = Math.max(1, Number(entry.quantity || entry.qty || entry.quantite) || 1);
          return qty > 1 ? `${name} x${qty}` : name;
        }
        return serializeProduct(entry);
      })
      .filter(Boolean)
      .join('\n');
  }

  if (typeof value === 'object') {
    const name = serializeProduct(
      value.name || value.productName || value.product || value.title || value.label,
    );
    if (!name) return '';
    const qty = Math.max(1, Number(value.quantity || value.qty || value.quantite) || 1);
    return qty > 1 ? `${name} x${qty}` : name;
  }

  const fallback = String(value).trim();
  return isGarbageSerialized(fallback) ? '' : fallback;
}

function pickProductName(item) {
  const fromProduct = serializeProduct(item.product);
  if (fromProduct) return fromProduct;

  for (const field of [item.name, item.productName, item.title, item.label, item.shortName]) {
    const value = serializeProduct(field);
    if (value) return value;
  }

  return '';
}

function pickQuantity(item) {
  return Math.max(1, Number(item.quantity || item.qty || item.quantite) || 1);
}

function pickTotalPrice(item, quantity) {
  for (const candidate of [
    item.totalPrice,
    item.totalprice,
    item.lineTotal,
    item.lineTotalAed,
    item.lineTotalKwd,
    item.price,
  ]) {
    const n = Number(candidate);
    if (Number.isFinite(n) && n > 0) return Math.round(n * 100) / 100;
  }

  const unitAed = Number(item.unitPriceAed);
  if (Number.isFinite(unitAed) && unitAed > 0) return Math.round(unitAed * quantity * 100) / 100;

  const unitKwd = Number(item.unitPriceKwd);
  if (Number.isFinite(unitKwd) && unitKwd > 0) return Math.round(unitKwd * quantity * 100) / 100;

  return 0;
}

function flattenItems(items) {
  if (!items) return [];
  if (Array.isArray(items)) {
    return items.flatMap((entry) => {
      if (Array.isArray(entry)) return flattenItems(entry);
      if (entry && typeof entry === 'object') return [entry];
      return [];
    });
  }
  if (typeof items === 'object') return [items];
  return [];
}

function toUaeSheetItems(items = [], sourceUrl) {
  const base = siteBaseUrl();

  return flattenItems(items)
    .map((item) => {
      const quantity = pickQuantity(item);
      const slug = String(item.productId || item.slug || '').trim().replace(/^\/+|\/+$/g, '');
      const name = pickProductName(item);
      const product = name.includes('\n') ? name : quantity > 1 ? `${name} x${quantity}` : name;

      return {
        product,
        url: String(item.url || item.product_url || '').trim() || (slug ? `${base}/products/${slug}` : sourceUrl || base),
        sku: String(item.sku || '').trim(),
        quantity,
        totalPrice: pickTotalPrice(item, quantity),
      };
    })
    .filter((item) => item.product || item.sku);
}

function formatPhoneForSheet(input) {
  const digits = String(input || '').replace(/\D/g, '');

  if (digits.startsWith('971') && digits.length >= 12) {
    return `+${digits.slice(0, 12)}`;
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return `+971${digits.slice(1)}`;
  }
  if (digits.length === 9) {
    return `+971${digits}`;
  }
  if (String(input || '').trim().startsWith('+')) {
    return String(input).replace(/\s|-/g, '');
  }
  if (digits.startsWith('971') && digits.length === 12) {
    return `+${digits}`;
  }
  return digits.length >= 9 ? `+971${digits.slice(-9)}` : '';
}

export async function forwardToGoogleSheets(eventName, payload) {
  if (!config.sheetsWebhookUrl) {
    return { ok: true, skipped: true, reason: 'sheets_not_configured' };
  }

  const currency = payload.currency || 'AED';
  const isUae = currency === 'AED';
  const sourceUrl = payload.sourceUrl || payload.source_url || siteBaseUrl();
  const items = payload.items || payload.products || [];

  const body = isUae
    ? {
        secret: config.sheetsWebhookSecret || undefined,
        date: new Date().toISOString(),
        customer_name: payload.customer_name || payload.customerName,
        phone: formatPhoneForSheet(payload.phone_e164 || payload.phone),
        country: payload.country || 'AE',
        currency,
        area: payload.area_notes || payload.area || '',
        items: toUaeSheetItems(items, sourceUrl),
        source_url: sourceUrl,
      }
    : {
        secret: config.sheetsWebhookSecret || undefined,
        event: eventName,
        timestamp: new Date().toISOString(),
        order_number: payload.order_number || payload.orderId,
        order_id: payload.orderId || payload.order_number,
        customer_name: payload.customer_name || payload.customerName,
        phone_e164: formatPhoneForSheet(payload.phone_e164 || payload.phone),
        area_notes: payload.area_notes || payload.area,
        items: toUaeSheetItems(items, sourceUrl),
        subtotal_kwd: payload.subtotal_kwd ?? payload.value,
        total_kwd: payload.total_kwd ?? payload.value,
        currency,
        payment_method: payload.payment_method || 'COD',
        upsell_accepted: payload.upsell_accepted ?? false,
        upsell_product: payload.upsell_product_id,
        upsell_amount_kwd: payload.upsell_amount_kwd,
        event_id: payload.eventId,
        source_url: sourceUrl,
        status: 'pending_confirmation',
      };

  if (!body.items.length) {
    log.warn('Google Sheets webhook skipped: no valid items after normalization');
    return { ok: false, error: 'no_valid_items' };
  }

  try {
    const res = await fetch(config.sheetsWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!res.ok || data.ok === false) {
      log.warn('Google Sheets webhook failed', res.status, text);
      return { ok: false, status: res.status, body: text, data };
    }

    return { ok: true, orderIds: data.order_ids, orderId: data.order_id };
  } catch (err) {
    log.error('Google Sheets webhook error', err.message);
    return { ok: false, error: err.message };
  }
}
