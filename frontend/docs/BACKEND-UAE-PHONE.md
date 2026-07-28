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

## Alternative (frontend-only)

Set on the **store** EasyPanel service:

```env
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
SHEETS_WEBHOOK_SECRET=your-secret
```

Use `frontend/docs/sheets/UAE_ORDERS_WEBHOOK.gs` in the Sheet.
