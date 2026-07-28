/**
 * Lara Beauty UAE — Google Sheets webhook
 *
 * Sheet columns (row 1):
 * date | order id | country | name | phone | product | url | sku | quantite | totalprice | currency
 *
 * Deploy: Extensions → Apps Script → paste → Deploy → Web app
 *   Execute as: Me · Who has access: Anyone
 *
 * EasyPanel env (frontend service):
 *   GOOGLE_SHEETS_WEBHOOK_URL = Web app URL
 *   SHEETS_WEBHOOK_SECRET     = same as SCRIPT_SECRET below
 */

const SCRIPT_SECRET = 'CHANGE_ME_SAME_AS_EASYPANEL';
const SHEET_NAME = 'Sheet Orders Lara beauty';

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    if (body.secret !== SCRIPT_SECRET) {
      return jsonResponse({ ok: false, error: 'unauthorized' }, 401);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return jsonResponse({ ok: false, error: 'sheet_not_found', sheet: SHEET_NAME }, 500);
    }

    ensureHeaders_(sheet);

    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      return jsonResponse({ ok: false, error: 'empty_items' }, 400);
    }

    const orderIds = [];
    const createdAt = body.date || new Date().toISOString();
    const country = body.country || 'AE';
    const currency = body.currency || 'AED';
    const customerName = body.customer_name || '';
    const phone = formatPhone_(body.phone || '');

    items.forEach(function (item) {
      const orderId = nextOrderId_();
      orderIds.push(orderId);

      sheet.appendRow([
        createdAt,
        orderId,
        country,
        customerName,
        phone,
        item.product || '',
        item.url || '',
        item.sku || '',
        Number(item.quantity) || 1,
        Number(item.totalPrice) || 0,
        currency,
      ]);
    });

    return jsonResponse({ ok: true, order_ids: orderIds, order_id: orderIds[0] });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) }, 500);
  }
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() > 0) return;

  sheet.appendRow([
    'date',
    'order id',
    'country',
    'name',
    'phone',
    'product',
    'url',
    'sku',
    'quantite',
    'totalprice',
    'currency',
  ]);
}

function nextOrderId_() {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const props = PropertiesService.getScriptProperties();
    const current = parseInt(props.getProperty('ORDER_COUNTER') || '0', 10);
    const next = current + 1;
    props.setProperty('ORDER_COUNTER', String(next));
    return String(next).padStart(5, '0');
  } finally {
    lock.releaseLock();
  }
}

/** Store +971501234567 (E.164). Accepts 05... or 971... from the site. */
function formatPhone_(input) {
  const digits = String(input || '').replace(/\D/g, '');

  if (digits.startsWith('971') && digits.length === 12) {
    return '+' + digits;
  }

  if (digits.startsWith('05') && digits.length === 10) {
    return '+971' + digits.slice(1);
  }

  if (digits.length === 9 && digits.charAt(0) === '5') {
    return '+971' + digits;
  }

  if (String(input || '').startsWith('+')) {
    return String(input).replace(/\s|-/g, '');
  }

  return digits ? '+' + digits : '';
}

function jsonResponse(obj, code) {
  if (code && code !== 200) {
    obj._httpStatus = code;
  }
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
