import { config } from '../config.js';
import { log } from '../logger.js';

function siteBaseUrl() {
  return (config.frontendUrl || 'https://larabeauty.store').replace(/\/$/, '');
}

function toUaeSheetItems(items = [], sourceUrl) {
  return items.map((item) => {
    const slug = item.productId || item.slug || '';
    const quantity = Number(item.quantity) || 1;
    const lineTotal =
      Number(item.lineTotalAed) ||
      Number(item.lineTotalKwd) ||
      Number(item.unitPriceAed) * quantity ||
      Number(item.unitPriceKwd) * quantity ||
      0;

    return {
      product: item.productName || item.name || '',
      url: slug ? `${siteBaseUrl()}/products/${slug}` : sourceUrl || siteBaseUrl(),
      sku: item.sku || '',
      quantity,
      totalPrice: lineTotal,
    };
  });
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
        phone: payload.phone_e164 || payload.phone,
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
        phone_e164: payload.phone_e164 || payload.phone,
        area_notes: payload.area_notes || payload.area,
        items,
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
