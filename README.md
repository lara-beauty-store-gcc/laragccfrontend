# laragccfrontend

Frontend dyal **Lara Beauty Store** — UAE (الإمارات) · COD · AED · deploy 3la [EasyPanel](https://easypanel.io).

## EasyPanel — settings (مهم!)

### Option A — branch `frontend` (مُفضّل لـ EasyPanel)

| Setting | Value |
|---------|--------|
| Repository | `lara-beauty-store-gcc/laragccfrontend` |
| Branch | **`frontend`** |
| **Source path** | *(empty / `/`)* |
| **Dockerfile file** | **`Dockerfile`** |
| **Proxy port** | **`3000`** |

> Branch `frontend` = store kamla f root (auto-synced mn `main`).

### Option B — branch `main` + folder `frontend`

| Setting | Value |
|---------|--------|
| Repository | `lara-beauty-store-gcc/laragccfrontend` |
| Branch | `main` |
| **Source path** | **`frontend`** |
| **Dockerfile file** | **`Dockerfile`** |
| **Proxy port** | **`3000`** |

### Environment variables

```env
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
NEXT_PUBLIC_SITE_URL=https://larabeauty.store
NEXT_PUBLIC_API_URL=https://api.larabeauty.store
NEXT_PUBLIC_WHATSAPP_NUMBER=971XXXXXXXXX
NEXT_PUBLIC_SUPPORT_PHONE=+971 XX XXX XXXX
NEXT_PUBLIC_SUPPORT_EMAIL=support@larabeauty.store

# Server-only — Google Sheets (see frontend/docs/sheets/UAE_ORDERS_WEBHOOK.gs)
GOOGLE_SHEETS_WEBHOOK_URL=
SHEETS_WEBHOOK_SECRET=
```

### Google Sheets — الطلبات

1. ف Sheet **Sheet Orders Lara beauty** → Extensions → Apps Script
2. لصق `frontend/docs/sheets/UAE_ORDERS_WEBHOOK.gs`
3. بدّل `SCRIPT_SECRET` و `SHEETS_WEBHOOK_SECRET` بنفس القيمة
4. Deploy → Web app → Anyone
5. حط URL ف EasyPanel: `GOOGLE_SHEETS_WEBHOOK_URL`

كل منتج = صف واحد + رقم طلب تسلسلي (`00001`, `00002`…). الجوال يتسجّل بصيغة `+971501234567`.

**ملاحظة:** الطلبات كتتحفظ دابا على السيرفر حتى بلا Google Sheet. باش توصل للـ Sheet، زيد `GOOGLE_SHEETS_WEBHOOK_URL` فـ EasyPanel.

### Verify deploy (مهم!)

Ba3d Deploy f EasyPanel, **khass yاخد 2–5 d9ayeq** (machi 2 seconds).

```bash
curl https://larabeauty.store/api/health
```

Khasso yraj3:
```json
"deployTag": "thank-you-cod-v6-2026-07-27"
```

Ila ba9a `uae-currency-aed-v4` → deploy ma dar rebuild. Dir **Redeploy** w chouf build logs.

---

## أخطاء شائعة

| المشكل | الحل |
|--------|------|
| `package.json missing` | Source path = **`frontend`** |
| Service not reachable | Proxy port = **3000** (ماشي 80) |
| branch not found | Branch = **`main`** (minuscules) |
| Build timeout | Repo private → GitHub token f EasyPanel |

---

## Dev local

```bash
cd frontend
npm ci
npm run dev
```

## Market (UAE)

| | Value |
|---|---|
| Currency | AED (189 / 239 / 339) |
| Phone | +971 |
| Upsell | 99 AED |
