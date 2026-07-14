# EasyPanel Deploy — دليل سريع (من screenshot ديالك)

## ✅ Config ديالك صحيح (تقريباً)

من screenshot EasyPanel dyalek:

| Setting | عندك دابا | صح؇ |
|---------|-----------|-----|
| Repository | `lara-beauty-store-gcc/laragccbackend` | ✅ |
| Branch | `frontend` | ✅ |
| Build Path | `/` | ✅ (خاوي = root) |
| Build | Dockerfile | ✅ |

> **مهم:** Branch `frontend` ≠ folder `frontend`.  
> F had repo, branch `frontend` kay7tawi store kamla f **root** — Build Path `/` هو الصح.

---

## ❌ اللي غالباً ناقص (سبب deploy ما كيخدمش)

### 1. Proxy Port = 3000 (ماشي 80)

EasyPanel → service **frontend** → tab **Domains**

| Field | Value |
|-------|--------|
| Proxy port | **3000** |

Qbel kan nginx 3la port **80**. Daba Next.js kayخدم 3la **3000**.

### 2. Save → Deploy

1. Source → **Save** (vert)
2. Foq → bouton **Deploy** (vert kbir)

### 3. Environment variables

Tab **Environment** — zid:

```env
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
NEXT_PUBLIC_SITE_URL=https://domain-dyalek.com
NEXT_PUBLIC_API_URL=https://api.domain-dyalek.com
```

### 4. Backend service (port 8000)

Service **backend** khasso:

| Setting | Value |
|---------|--------|
| Branch | `backend` |
| Build Path | `/` |
| Proxy port | **8000** |

---

## 🔍 كيفاش تشوف error

1. EasyPanel → **frontend** → tab **Deployments**
2. Cliquer 3la آخر deployment
3. **Build logs** — ila kayn error f `npm run build`, copyih

Errors شائعة:

| Log | الحل |
|-----|------|
| `package.json missing` | Branch = `frontend`, Build Path = `/` |
| `Service not reachable` | Domains port = **3000** |
| `branch not found` | Save m3a branch `frontend` w redeploy |
| Build timeout | Server 9lil RAM — زيد memory f EasyPanel |

---

## 🆕 بديل: repo `laragccfrontend` (UAE updated)

Ila bghiti UAE store jdid (AED, +971) li pushina f `main`:

| Setting | Value |
|---------|--------|
| Repository | `lara-beauty-store-gcc/laragccfrontend` |
| Branch | **`main`** |
| Build Path | **`frontend`** |
| Dockerfile | `Dockerfile` |
| Proxy port | **3000** |

---

## ✅ Test mn ba3d deploy

```bash
curl https://domain-dyalek.com/api/health
```

Khasso yraj3 JSON m3a `ok`.
