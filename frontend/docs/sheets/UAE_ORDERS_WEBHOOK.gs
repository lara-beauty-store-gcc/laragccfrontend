const SCRIPT_SECRET = 'lara-beauty-secret-2026';
const SPREADSHEET_ID = '1n_vZl2t3X_KV0Rkpj6dR9TZRRm3OETv3IjIdzcH-diU';
const SHEET_NAME = 'Tabellenblatt1';

const HEADERS = [
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
];

function isJavaObjectRef(value) {
  return /^\[L[a-zA-Z0-9./]+;@[0-9a-f]+$/i.test(String(value || ''));
}

function cell(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') {
    var s = value.trim();
    return isJavaObjectRef(s) ? '' : s;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

function cellNumber(value) {
  var n = Number(value);
  if (!isFinite(n) || n < 0) return 0;
  return n;
}

function doGet() {
  return jsonResponse({ ok: true, service: 'lara-orders-webhook', version: '2026-07-28' });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: 'empty_body' }, 400);
    }

    var body = JSON.parse(e.postData.contents);

    if (body.secret !== SCRIPT_SECRET) {
      return jsonResponse({ ok: false, error: 'unauthorized' }, 401);
    }

    var orderId = cell(body['order id'] || body.order_id || body.order_number);
    var name = cell(body.name || body.customer_name || body.full_name);
    var phone = cell(body.phone || body.phone_e164 || body.phone_display);
    var product = cell(body.product);
    var url = cell(body.url || body.source_url);
    var sku = cell(body.sku);
    var country = cell(body.country) || 'AE';
    var currency = cell(body.currency) || 'AED';
    var date =
      cell(body.date) ||
      Utilities.formatDate(new Date(), 'Asia/Dubai', 'yyyy-MM-dd HH:mm');
    var quantite = cellNumber(body.quantite || body.quantity);
    var totalprice = cellNumber(
      body.totalprice || body['total price'] || body.total_aed || body.total_amount || body.total,
    );

    if (!orderId || !name || !phone) {
      return jsonResponse({ ok: false, error: 'incomplete_row' }, 400);
    }
    if (!product || isJavaObjectRef(product)) {
      return jsonResponse({ ok: false, error: 'invalid_product' }, 400);
    }
    if (!totalprice) {
      return jsonResponse({ ok: false, error: 'invalid_total' }, 400);
    }
    if (!quantite) quantite = 1;

    var ss = getSpreadsheet_();
    if (!ss) {
      return jsonResponse({ ok: false, error: 'spreadsheet_not_linked' }, 500);
    }

    var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    if (!sheet) {
      return jsonResponse({ ok: false, error: 'sheet_not_found' }, 500);
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][1]) === orderId) {
        return jsonResponse({ ok: true, success: true, duplicate: true, order_id: orderId });
      }
    }

    sheet.appendRow([
      date,
      orderId,
      country,
      name,
      phone,
      product,
      url,
      sku,
      quantite,
      totalprice,
      currency,
    ]);

    return jsonResponse({ ok: true, success: true, sheet: sheet.getName(), order_id: orderId });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) }, 500);
  }
}

function getSpreadsheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);
  return null;
}

function jsonResponse(obj, code) {
  if (code && code !== 200) obj._httpStatus = code;
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
