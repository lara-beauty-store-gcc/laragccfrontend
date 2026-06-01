/**
 * Lara Beauty — Google Apps Script Webhook
 *
 * Setup:
 * 1. Create sheet from sheets/orders-template.csv (row 1 = headers)
 * 2. Paste this file in Apps Script editor
 * 3. Project Settings → Script properties:
 *    - WEBHOOK_SECRET = same as backend GOOGLE_SHEETS_WEBHOOK_SECRET
 * 4. Deploy → Web app → Execute as: Me, Access: Anyone
 * 5. Copy URL to backend GOOGLE_SHEETS_WEBHOOK_URL
 */

const SHEET_NAME = 'Orders';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);

    const expectedSecret = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
    if (!expectedSecret || payload.secret !== expectedSecret) {
      return jsonResponse({ ok: false, error: 'unauthorized' }, 401);
    }

    const sheet = getSheet_();
    sheet.appendRow([
      payload.order_number || '',
      payload.created_at || '',
      payload.customer_name || '',
      payload.customer_phone || '',
      payload.products_summary_ar || '',
      payload.lines_json || '',
      payload.subtotal_kwd || 0,
      payload.upsell_kwd || 0,
      payload.total_kwd || 0,
      payload.currency || 'KWD',
      payload.status || 'pending_confirmation',
      payload.payment_method || 'COD',
      payload.source_url || '',
      payload.utm_source || '',
      payload.utm_campaign || '',
      payload.event_id || '',
      '',
    ]);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) }, 500);
  }
}

function doGet() {
  return jsonResponse({ ok: true, service: 'lara-beauty-orders' });
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

function jsonResponse(obj, code) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
