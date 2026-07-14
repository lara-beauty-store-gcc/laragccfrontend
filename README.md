# laragccfrontend

Frontend dyal **Lara Beauty Store** — store UAE (الإمارات) · COD · AED · deploy 3la [EasyPanel](https://easypanel.io).

## Market

| | قبل (Kuwait) | دابا (UAE) |
|---|---|---|
| Country | الكويت | الإمارات |
| Currency | KWD (د.ك) | AED (د.إ) |
| Phone | +965 | +971 |
| Bundles | 16 / 21 / 29 | 189 / 239 / 339 |
| Upsell | 9 | 99 |

## EasyPanel deploy

1. **GitHub → EasyPanel** — repo: `lara-beauty-store-gcc/laragccfrontend`, branch: `main`
2. **Build:** Dockerfile (root)
3. **Environment** — copy mn `.env.example`:
   - `NEXT_PUBLIC_SITE_URL` = domain dyalek
   - `NEXT_PUBLIC_API_URL` = backend API URL

## Backend

Orders API + CAPI f repo `lara-beauty-store-gcc/laragccbackend` — khassu ykon migrated UAE bach totals w phone validation yتطابقو.

## Dev local

```bash
npm ci
npm run dev
```

## Push

```bash
git add .
git commit -m "your message"
git push origin main
```
