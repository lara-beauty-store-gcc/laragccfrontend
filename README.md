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
NEXT_PUBLIC_WHATSAPP_NUMBER=12402107635
NEXT_PUBLIC_WHATSAPP_DISPLAY=+1 (240) 210-7635
NEXT_PUBLIC_SUPPORT_PHONE=+1 (240) 210-7635
NEXT_PUBLIC_SUPPORT_EMAIL=support@larabeauty.store

# Server-only — Google Sheets (see frontend/docs/sheets/UAE_ORDERS_WEBHOOK.gs)
GOOGLE_SHEETS_WEBHOOK_URL=
SHEETS_WEBHOOK_SECRET=

# Marketing pixels (client-side — baked in at build time)
NEXT_PUBLIC_ENABLE_PIXELS=true
NEXT_PUBLIC_TIKTOK_PIXEL_ID=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_SNAP_PIXEL_ID=

# TikTok Events API (server-only — set in EasyPanel)
TIKTOK_ACCESS_TOKEN=
TIKTOK_PIXEL_ID=D9V4EIJC77U9RA6QKBL0
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

Khasso yraj3 JSON m3a `"ok": true` w `"deployTag"` (version f `api/health`).

Ila `deployTag` ma tbdlch ba3d merge → **Redeploy** (w ila ma kaybniش: bump `CACHEBUST` f Dockerfile).

---

## أخطاء شائعة

| المشكل | الحل |
|--------|------|
| `package.json missing` | Branch **`frontend`** → Source path **فارغ**. Branch **`main`** → Source path **`frontend`** |
| branch not found | Branch **`frontend`** (Option A) ولا **`main`** (Option B) — حروف صغيرة |
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
