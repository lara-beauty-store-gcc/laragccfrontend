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
```

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
