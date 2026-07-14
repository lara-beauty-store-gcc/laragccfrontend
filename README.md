# laragccfrontend

Frontend dyal **Lara Beauty Store** — UAE (الإمارات) · COD · AED · deploy 3la [EasyPanel](https://easypanel.io).

## EasyPanel — settings (مهم!)

### Option A — source path `frontend` (مُفضّل)

| Setting | Value |
|---------|--------|
| Repository | `lara-beauty-store-gcc/laragccfrontend` |
| Branch | `main` |
| **Source path** | **`frontend`** |
| **Dockerfile file** | **`Dockerfile`** |
| **Proxy port** | **`3000`** |

### Option B — source path فارغ (repo root)

| Setting | Value |
|---------|--------|
| Source path | *(empty)* |
| Dockerfile file | `Dockerfile` |
| Proxy port | `3000` |

### Environment variables

```env
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

### Health check

`GET /api/health` on port **3000**

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
