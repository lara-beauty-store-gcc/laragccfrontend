import { Router } from 'express';
import { config } from '../config.js';
import { createOrder, logEvent, markSheetSynced } from '../db.js';
import { log } from '../logger.js';
import { sendMetaEvent } from '../services/meta-capi.js';
import { forwardToGoogleSheets } from '../services/sheets.js';
import { sendSnapEvent } from '../services/snap-capi.js';
import { sendTiktokEvent } from '../services/tiktok-capi.js';
import { isValidMarketPhone, isValidUaePhone, normalizeMarketPhone } from '../services/phone.js';

const router = Router();

const KWD_PRICES = {
  b1: 16,
  b2: 21,
  b3: 29,
  UPSELL: 9,
};

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return req.socket.remoteAddress || '';
}

function calcTotal(items, upsell, currency) {
  let total = 0;
  for (const item of items) {
    if (currency === 'AED') {
      const unit = Number(item.unitPriceAed) || Number(item.lineTotalAed) || 0;
      const qty = Number(item.quantity) || 1;
      total += unit * qty;
      continue;
    }

    const bundle = item.bundleId || 'b1';
    const unit = KWD_PRICES[bundle] ?? Number(item.unitPriceKwd) ?? 16;
    const qty = Number(item.quantity) || 1;
    total += unit * qty;
  }

  if (upsell?.accepted) {
    total += currency === 'AED' ? Number(upsell.amountAed) || 99 : KWD_PRICES.UPSELL;
  }

  return currency === 'AED' ? Math.round(total) : Math.round(total * 1000) / 1000;
}

router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    const name = String(body.customerName || body.name || '').trim();
    const phoneRaw = body.phone || body.phoneNumber || '';
    const phoneE164 = normalizeMarketPhone(phoneRaw);
    const currency = String(body.currency || 'AED').toUpperCase();
    const country = String(body.country || (currency === 'AED' ? 'AE' : 'KW')).toUpperCase();
    const isUae = currency === 'AED' || country === 'AE';

    if (!name || name.length < 2) {
      return res.status(400).json({ error: 'invalid_name' });
    }

    if (!isValidMarketPhone(phoneRaw)) {
      return res.status(400).json({
        error: 'invalid_phone',
        message: isUae
          ? 'رقم جوال إماراتي غير صحيح — مثال: 501234567'
          : 'رقم جوال كويتي غير صحيح — مثال: 50001234',
      });
    }

    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      return res.status(400).json({ error: 'empty_cart' });
    }

    const upsell = body.upsell || {};
    const total = calcTotal(items, upsell, currency);
    const orderNumber = `LARA-${Date.now().toString(36).toUpperCase()}`;
    const eventId = body.eventId || `purchase_${orderNumber}`;

    const order = {
      orderNumber,
      customerName: name,
      phoneE164,
      areaNotes: body.area || body.areaNotes || '',
      subtotalKwd: isUae ? total : total,
      totalKwd: total,
      currency,
      paymentMethod: 'COD',
      upsellAccepted: Boolean(upsell.accepted),
      upsellProductId: upsell.productId || null,
      upsellAmountKwd: upsell.accepted ? (isUae ? Number(upsell.amountAed) || 99 : KWD_PRICES.UPSELL) : null,
      eventId,
      sourceUrl: body.sourceUrl || config.frontendUrl,
      clientIp: clientIp(req),
    };

    const dbItems = items.map((i) => {
      const qty = Number(i.quantity) || 1;

      if (isUae) {
        const unit = Number(i.unitPriceAed) || Number(i.lineTotalAed) || 0;
        return {
          productId: i.productId || i.id || i.slug,
          sku: i.sku,
          productName: i.name || i.productName,
          bundleId: i.bundleId || i.offerId || 'one',
          quantity: qty,
          unitPriceAed: unit,
          lineTotalAed: unit * qty,
        };
      }

      const bundle = i.bundleId || 'b1';
      const unit = KWD_PRICES[bundle] ?? 16;
      return {
        productId: i.productId || i.id,
        sku: i.sku,
        productName: i.name || i.productName,
        bundleId: bundle,
        quantity: qty,
        unitPriceKwd: unit,
        lineTotalKwd: unit * qty,
      };
    });

    let dbResult = null;
    try {
      dbResult = await createOrder(order, dbItems);
    } catch (dbErr) {
      log.error('DB order insert failed', dbErr.message);
    }

    const capiPayload = {
      orderId: orderNumber,
      value: total,
      currency,
      email: body.email,
      phone: phoneE164,
      sourceUrl: order.sourceUrl,
      contentIds: items.map((i) => i.sku).filter(Boolean),
    };
    const ctx = { ip: order.clientIp, userAgent: req.headers['user-agent'] || '' };

    const [meta, tiktok, snap, sheets] = await Promise.all([
      sendMetaEvent('Purchase', capiPayload, ctx),
      sendTiktokEvent('Purchase', capiPayload, ctx),
      sendSnapEvent('Purchase', capiPayload, ctx),
      forwardToGoogleSheets('Purchase', {
        ...capiPayload,
        country,
        order_number: orderNumber,
        customer_name: name,
        phone_e164: phoneE164,
        area_notes: order.areaNotes,
        items: dbItems,
        total_kwd: isUae ? undefined : total,
        upsell_accepted: order.upsellAccepted,
        payment_method: 'COD',
      }),
    ]);

    await logEvent('Purchase', { orderNumber, ...capiPayload }, { meta, tiktok, snap, sheets }, order.clientIp);

    if (!sheets.ok) {
      await markSheetSynced(orderNumber, String(sheets.error || sheets.body));
    } else {
      await markSheetSynced(orderNumber, null);
    }

    const sheetOrderIds = Array.isArray(sheets.orderIds) ? sheets.orderIds.map(String) : [];
    const primaryOrderId = sheetOrderIds[0] || orderNumber;

    return res.json({
      success: true,
      orderId: primaryOrderId,
      orderNumber: primaryOrderId,
      orderIds: sheetOrderIds.length ? sheetOrderIds : [primaryOrderId],
      total,
      totalAed: isUae ? total : undefined,
      totalKwd: isUae ? undefined : total,
      currency,
      eventId,
      db: Boolean(dbResult),
    });
  } catch (err) {
    log.error('Order error', err);
    return res.status(500).json({ error: 'internal_error' });
  }
});

export default router;
