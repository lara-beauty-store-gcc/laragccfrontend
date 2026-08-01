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
  const local = String(input || '').replace(/\D/g, '');
  const m = local.match(/^(?:971)?0?(5[024568]\d{7})$/);
  if (m) return `+971${m[1]}`;

  const digits = String(input || '').replace(/\D/g, '');
  if (digits.startsWith('971') && digits.length >= 12) {
    return `+${digits.slice(0, 12)}`;
  }
  if (digits.startsWith('05') && digits.length >= 10) {
    return `+971${digits.slice(1)}`;
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return `+971${digits.slice(1)}`;
  }
  if (digits.length === 9 && /^5[024568]/.test(digits)) {
    return `+971${digits}`;
  }
  if (String(input || '').trim().startsWith('+')) {
    return String(input).replace(/\s|-/g, '');
  }
  if (digits.startsWith('971') && digits.length === 12) {
    return `+${digits}`;
  }
  return '';
}

export async function forwardToGoogleSheets(eventName, payload) {
  if (!config.sheetsWebhookUrl) {
    return { ok: true, skipped: true, reason: 'sheets_not_configured' };
  }

  const currency = payload.currency || 'AED';
  const isUae = currency === 'AED';
  const sourceUrl = payload.sourceUrl || payload.source_url || siteBaseUrl();
  const items = toUaeSheetItems(payload.items || payload.products || [], sourceUrl);
  const orderNumber = payload.order_number || payload.orderId || `LARA-${Date.now().toString(36).toUpperCase()}`;
  const name = payload.customer_name || payload.customerName || payload.full_name || '';
  const phone = formatPhoneForSheet(
    payload.phone_display || payload.phone_e164 || payload.phone_raw || payload.phone,
  );
  const country = payload.country || 'AE';
  const date = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dubai', hour12: false });

  if (!items.length) {
    log.warn('Google Sheets webhook skipped: no valid items after normalization');
    return { ok: false, error: 'no_valid_items' };
  }

  const orderIds = [];

  try {
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const orderId = index === 0 ? orderNumber : `${orderNumber}-${index + 1}`;
      const row = isUae
        ? {
            secret: config.sheetsWebhookSecret || undefined,
            date,
            'order id': orderId,
            order_id: orderId,
            order_number: orderId,
            name,
            customer_name: name,
            phone,
            phone_e164: phone,
            product: item.product,
            url: item.url,
            source_url: item.url || sourceUrl,
            sku: item.sku,
            quantite: item.quantity,
            quantity: item.quantity,
            totalprice: item.totalPrice,
            total_aed: item.totalPrice,
            total: item.totalPrice,
            country,
            currency,
          }
        : {
            secret: config.sheetsWebhookSecret || undefined,
            event: eventName,
            date,
            'order id': orderId,
            order_id: orderId,
            order_number: orderId,
            name,
            customer_name: name,
            phone_e164: phone,
            product: item.product,
            url: item.url,
            sku: item.sku,
            quantite: item.quantity,
            totalprice: item.totalPrice,
            currency,
            source_url: sourceUrl,
          };

      const res = await fetch(config.sheetsWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(row),
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

      orderIds.push(String(data.order_id || orderId));
    }

    return { ok: true, orderIds, orderId: orderIds[0] };
  } catch (err) {
    log.error('Google Sheets webhook error', err.message);
    return { ok: false, error: err.message };
  }
}
