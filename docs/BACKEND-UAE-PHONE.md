# Backend patch — UAE phone support for api.larabeauty.store

The live API still validates **Kuwait** numbers. Until this is deployed, UAE checkouts fail even when the phone is correct (`501234567`).

## Quick fix (EasyPanel — API service)

Redeploy the **laragccbackend** service after applying these changes to `src/services/phone.js` and `src/routes/orders.js`:

- Accept `+971` / `501234567` / `0501234567`
- Use `currency: AED` and `country: AE` from the storefront payload
- Forward one row per product to Google Sheets (UAE format)

Patch files are in this repo under `docs/backend-patch/`.

## Verify after deploy

```bash
curl -s -X POST https://api.larabeauty.store/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Test","phone":"501234567","country":"AE","currency":"AED","items":[{"sku":"LARA-MG-01","name":"test","productId":"magnesium-sleep","quantity":1,"unitPriceAed":189}],"sourceUrl":"https://larabeauty.store"}'
```

Expected: `"success": true` (not `invalid_phone`).

## Alternative (frontend-only) — Google Sheets

Spreadsheet: [Sheet Orders Lara beauty](https://docs.google.com/spreadsheets/d/1n_vZl2t3X_KV0Rkpj6dR9TZRRm3OETv3IjIdzcH-diU)

### 1. Apps Script (in the spreadsheet)

1. Open the sheet → **Extensions → Apps Script**
2. Paste `frontend/docs/sheets/UAE_ORDERS_WEBHOOK.gs`
3. Set `SCRIPT_SECRET` to a random string
4. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the `/exec` URL

The script writes to tab **Tabellenblatt1** (first tab). Orders appear one row per product.

### 2. EasyPanel env (store / frontend service)

```env
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
SHEETS_WEBHOOK_SECRET=your-secret-same-as-SCRIPT_SECRET
ORDERS_DATA_DIR=/app/data
```

Mount a volume at `/app/data` so unsynced orders can be replayed.

### 3. Verify

```bash
curl -s https://larabeauty.store/api/health
# sheetsWebhook should be "configured"

# Replay pending orders (after deploy):
curl -s -X POST https://larabeauty.store/api/orders/sync-sheets \
  -H "Authorization: Bearer your-secret"
```

Checkout API returns `source: "sheets"` when sync works. If `source: "local"`, check `sheetError` in the response.
