/**
 * Lara Beauty UAE — Google Sheets webhook
 *
 * Spreadsheet: Sheet Orders Lara beauty
 * https://docs.google.com/spreadsheets/d/1n_vZl2t3X_KV0Rkpj6dR9TZRRm3OETv3IjIdzcH-diU
 *
 * Columns (row 1):
 * date | order id | country | name | phone | product | url | sku | quantite | totalprice | currency
 */

const SCRIPT_SECRET = 'lara-beauty-secret-2026';

const SPREADSHEET_ID = '1n_vZl2t3X_KV0Rkpj6dR9TZRRm3OETv3IjIdzcH-diU';

const SHEET_CANDIDATES = [
  'Tabellenblatt1',
  'Sheet Orders Lara beauty',
  'Commandes',
  'Sheet1',
];

const JAVA_ARRAY_REF = /^\[L[\w.$]+;@[0-9a-f]+$/i;

function doGet() {
  const sheet = resolveOrdersSheet_();
  return jsonResponse({
    ok: true,
    sheet: sheet ? sheet.getName() : null,
    rows: sheet ? sheet.getLastRow() : 0,
  });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    if (body.secret !== SCRIPT_SECRET) {
      return jsonResponse({ ok: false, error: 'unauthorized' }, 401);
    }

    const sheet = resolveOrdersSheet_();
    if (!sheet) {
      return jsonResponse({ ok: false, error: 'sheet_not_found' }, 500);
    }

    ensureHeaders_(sheet);

    const rawItems = flattenItems_(body.items);
    if (rawItems.length === 0) {
      return jsonResponse({ ok: false, error: 'empty_items' }, 400);
    }

    const orderIds = [];
    const createdAt = formatSheetDate_(body.date) || formatSheetDate_(new Date().toISOString());
    const country = asString_(body.country) || 'AE';
    const currency = asString_(body.currency) || 'AED';
    const customerName = pickCustomerName_(body);
    const phone = formatPhone_(body.phone || body.phone_e164 || '');
    const sourceUrl = asString_(body.source_url || body.sourceUrl);
    const presetIds = Array.isArray(body.order_ids) ? body.order_ids : [];

    rawItems.forEach(function (raw, index) {
      const item = normalizeItem_(raw, sourceUrl);
      if (!item.product && !item.sku) return;

      const orderId = presetIds[index] ? String(presetIds[index]) : nextOrderId_();
      orderIds.push(orderId);

      sheet.appendRow([
        createdAt,
        orderId,
        country,
        customerName,
        phone,
        item.product,
        item.url,
        item.sku,
        item.quantity,
        item.totalPrice,
        currency,
      ]);
    });

    if (orderIds.length === 0) {
      return jsonResponse({ ok: false, error: 'no_valid_items' }, 400);
    }

    return jsonResponse({ ok: true, order_ids: orderIds, order_id: orderIds[0], sheet: sheet.getName() });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) }, 500);
  }
}

function flattenItems_(items) {
  if (!items) return [];
  if (Array.isArray(items)) {
    var out = [];
    items.forEach(function (entry) {
      if (Array.isArray(entry)) {
        out = out.concat(flattenItems_(entry));
      } else if (entry && typeof entry === 'object') {
        out.push(entry);
      }
    });
    return out;
  }
  if (typeof items === 'object') return [items];
  return [];
}

function normalizeItem_(raw, sourceUrl) {
  var quantity = pickQuantity_(raw);
  var product = productLabelForSheet_(raw);
  var slug = asString_(raw.slug || raw.productId).replace(/^\/+|\/+$/g, '');
  var url = asString_(raw.url || raw.product_url);
  if (!url && slug) {
    url = sourceUrl ? sourceUrl.replace(/\/$/, '') + '/products/' + slug : '';
  }
  if (!url) url = asString_(sourceUrl);

  return {
    product: product,
    url: url,
    sku: asString_(raw.sku || raw.SKU),
    quantity: quantity,
    totalPrice: pickTotalPrice_(raw, quantity),
  };
}

function productLabelForSheet_(raw) {
  var name = pickProductName_(raw);
  if (!name) return '';
  if (name.indexOf('\n') >= 0) return name;
  return formatProductLabel_(name, pickQuantity_(raw));
}

function pickProductName_(raw) {
  var fromProduct = serializeProduct_(raw.product);
  if (fromProduct) return fromProduct;

  var fields = [raw.name, raw.productName, raw.title, raw.label, raw.shortName];
  for (var i = 0; i < fields.length; i++) {
    var value = serializeProduct_(fields[i]);
    if (value) return value;
  }
  return '';
}

function serializeProduct_(value) {
  if (value == null || value === '') return '';

  if (typeof value === 'string') {
    var trimmed = value.trim();
    if (!trimmed || isGarbageSerialized_(trimmed)) return '';
    return trimmed;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    var lines = [];
    value.forEach(function (entry) {
      if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
        var nestedName = serializeProduct_(entry.name || entry.productName || entry.product || entry.title || entry.label);
        if (!nestedName) return;
        var nestedQty = pickQuantity_(entry);
        lines.push(formatProductLabel_(nestedName, nestedQty));
        return;
      }
      var line = serializeProduct_(entry);
      if (line) lines.push(line);
    });
    return lines.join('\n');
  }

  if (typeof value === 'object') {
    var objectName = serializeProduct_(value.name || value.productName || value.product || value.title || value.label);
    if (!objectName) return '';
    return formatProductLabel_(objectName, pickQuantity_(value));
  }

  var fallback = String(value).trim();
  return isGarbageSerialized_(fallback) ? '' : fallback;
}

function formatProductLabel_(name, quantity) {
  var clean = String(name || '').trim();
  if (!clean) return '';
  var qty = Math.max(1, Math.floor(Number(quantity) || 1));
  return qty > 1 ? clean + ' x' + qty : clean;
}

function isGarbageSerialized_(value) {
  if (!value) return true;
  if (JAVA_ARRAY_REF.test(value)) return true;
  if (value === '[object Object]') return true;
  if (value === 'undefined' || value === 'null') return true;
  return false;
}

function pickQuantity_(raw) {
  return Math.max(1, Number(raw.quantity || raw.qty || raw.quantite) || 1);
}

function pickTotalPrice_(raw, quantity) {
  var candidates = [raw.totalPrice, raw.totalprice, raw.lineTotal, raw.lineTotalAed, raw.lineTotalKwd, raw.price];
  for (var i = 0; i < candidates.length; i++) {
    var n = Number(candidates[i]);
    if (!isNaN(n) && n > 0) return Math.round(n * 100) / 100;
  }

  var unitAed = Number(raw.unitPriceAed);
  if (!isNaN(unitAed) && unitAed > 0) return Math.round(unitAed * quantity * 100) / 100;

  var unitKwd = Number(raw.unitPriceKwd);
  if (!isNaN(unitKwd) && unitKwd > 0) return Math.round(unitKwd * quantity * 100) / 100;

  return 0;
}

function pickCustomerName_(body) {
  var candidates = [body.full_name, body.customer_name, body.customerName, body.name];
  for (var i = 0; i < candidates.length; i++) {
    var text = asString_(candidates[i]);
    if (text) return text;
  }
  return '';
}

function formatSheetDate_(value) {
  if (!value) return '';
  var d = new Date(value);
  if (isNaN(d.getTime())) return asString_(value);
  return Utilities.formatDate(d, 'Asia/Dubai', 'yyyy-MM-dd HH:mm');
}

function asString_(value) {
  if (value == null) return '';
  var text = String(value).trim();
  return isGarbageSerialized_(text) ? '' : text;
}

function resolveOrdersSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  for (var i = 0; i < SHEET_CANDIDATES.length; i++) {
    var candidate = ss.getSheetByName(SHEET_CANDIDATES[i]);
    if (candidate) return candidate;
  }

  var sheets = ss.getSheets();
  return sheets.length ? sheets[0] : null;
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

function formatPhone_(input) {
  const digits = String(input || '').replace(/\D/g, '');

  if (digits.startsWith('971') && digits.length >= 12) {
    return '+' + digits.slice(0, 12);
  }

  if (digits.startsWith('0') && digits.length === 10) {
    return '+971' + digits.slice(1);
  }

  if (digits.length === 9) {
    return '+971' + digits;
  }

  if (String(input || '').trim().startsWith('+')) {
    return String(input).replace(/\s|-/g, '');
  }

  if (digits.startsWith('971') && digits.length === 12) {
    return '+' + digits;
  }

  return digits.length >= 9 ? '+971' + digits.slice(-9) : '';
}

function jsonResponse(obj, code) {
  if (code && code !== 200) {
    obj._httpStatus = code;
  }
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
