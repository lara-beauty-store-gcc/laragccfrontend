# Lara Beauty — لارا للجمال

Premium DTC wellness store for **Kuwait** (COD). Three gummy products, bundle pricing, high-CRO funnel.

## Documentation (start here)

**AI coder:** read [`docs/README.md`](./docs/README.md) in order, then implement `frontend/` and `backend/`.

| Item | Location |
|------|----------|
| Full spec index | [`docs/README.md`](./docs/README.md) |
| Google Sheet columns | [`sheets/orders-template.csv`](./sheets/orders-template.csv) |
| Apps Script webhook | [`sheets/google-apps-script.js`](./sheets/google-apps-script.js) |
| Frontend env | [`frontend/.env.example`](./frontend/.env.example) |
| Backend env | [`backend/.env.example`](./backend/.env.example) |

## Domains

- Store: https://larabeauty.store
- API: https://api.larabeauty.store

## Database (EasyPanel internal)

```
postgres://larabeauty:larabeauty@larabeauty_database:5432/larabeauty?sslmode=disable
```

## Brand colors

| Token | Hex |
|-------|-----|
| Primary | `#6B3F4A` |
| Gold accent | `#C9A227` |
| CTA green | `#2D6A4F` |
| Background | `#FBF7F4` |

Logo: user uploads later — use wordmark until then.

## Status

- [x] Product & technical documentation
- [ ] Frontend implementation (Next.js)
- [ ] Backend implementation (FastAPI)
