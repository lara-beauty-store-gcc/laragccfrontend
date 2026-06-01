# 00 — Project Overview

## What we are building

A **premium-branded DTC e-commerce store** for Kuwait that sells three wellness gummy products at **high perceived value** (not discount-store positioning). Traffic comes from **Snapchat, TikTok, and Meta** (AI/UGC video ads). The site must **convert cold traffic**, maximize **AOV** via bundles, cross-sells, and a post-form upsell, and maximize **COD confirmation rate** through trust, authority, and Gulf-native copy.

## Business model

| Item | Value |
|------|--------|
| Payment | **COD only** (cash on delivery) |
| Currency | **KWD** |
| Fulfillment | Dropship; brand must feel like we own the products |
| Primary channel | Short video → landing/product pages |

## Technical stack (fixed)

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS 4** | SEO, speed, RTL, image optimization |
| UI | **shadcn/ui** + **Radix** primitives | Accessible drawers, dialogs, forms |
| State | **Zustand** (cart) + **TanStack Query** (server state) | Simple cart persistence, API cache |
| Forms | **react-hook-form** + **zod** | Kuwait phone validation |
| Backend | **Python 3.12** + **FastAPI** | Fast APIs, CAPI forwarding |
| ORM | **SQLAlchemy 2** + **Alembic** | Migrations run on container start |
| DB | **PostgreSQL** (`larabeauty`) | Already on EasyPanel |
| Orders export | **Google Sheets** via Apps Script webhook | Ops-friendly |

## Domains & services (EasyPanel)

| Service | URL / host |
|---------|------------|
| Store | `https://larabeauty.store` |
| API | `https://api.larabeauty.store` |
| Postgres (internal) | `postgres://larabeauty:larabeauty@larabeauty_database:5432/larabeauty?sslmode=disable` |

## Non-goals (v1)

- Card payments, Apple Pay, tabby/tamara
- User accounts / login
- Multi-country checkout (Kuwait only v1)
- Inventory sync with supplier APIs (manual stock flags OK)

## Success metrics

1. **CVR** on product landing from paid social
2. **AOV** ≥ 23 KWD (push 29 KWD bundles)
3. **Upsell take rate** on 9 KWD offer (checkout only)
4. **COD confirmation** — clear phone validation, order summary, trust on checkout popup
5. **Page speed** — LCP < 2.5s mobile; pixels deferred
6. **Event quality** — Pixel + CAPI dedup with matching `event_id`

## Repository layout (to implement)

```
/
├── docs/                 # This folder
├── frontend/
│   ├── Dockerfile
│   ├── .env.example
│   └── src/...
├── backend/
│   ├── Dockerfile
│   ├── .env.example
│   ├── alembic/
│   └── app/...
└── sheets/
    ├── orders-template.csv
    └── google-apps-script.js
```

## Brand assets (user-provided later)

- Logo image → replace placeholder in header/footer
- Product photography → replace `/public/images/sample/*`
- Certification scans (if any) → `/public/images/trust/*`
