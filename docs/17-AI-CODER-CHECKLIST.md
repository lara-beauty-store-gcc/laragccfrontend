# 17 — AI Coder Checklist (Definition of Done)

## Phase 1 — Scaffold

- [ ] `frontend/` Next.js 15 + Tailwind + RTL + design tokens from [06-DESIGN-SYSTEM.md](./06-DESIGN-SYSTEM.md)
- [ ] `backend/` FastAPI + Alembic + Dockerfile entrypoint migrations
- [ ] `sheets/orders-template.csv` + `google-apps-script.js`
- [ ] Root README points to `docs/`

## Phase 2 — Catalog

- [ ] Seed 3 products + 9 bundles in migration
- [ ] `GET /products` and `GET /products/{slug}`
- [ ] Home, collection, PDP with sample images
- [ ] Bundle selector + alternating sections on PDP

## Phase 3 — Cart & checkout

- [ ] Zustand cart + localStorage persist
- [ ] Cart drawer with cross-sells
- [ ] PDP CTA adds bundle + opens drawer
- [ ] Checkout dialog: name + Kuwait phone validation
- [ ] Upsell overlay 15s, 9 KWD, cross-sell logic
- [ ] `POST /orders` server-side price validation
- [ ] Thank you page

## Phase 4 — Integrations

- [ ] Sheets webhook working
- [ ] Deferred Meta, TikTok, Snap pixels
- [ ] CAPI Purchase + dedup `event_id`
- [ ] Phone hash: Meta/Snap digits; TikTok E.164 with `+`

## Phase 5 — Pages & trust

- [ ] About, contact, legal pages from [19-LEGAL-TRUST-PAGES.md](./19-LEGAL-TRUST-PAGES.md)
- [ ] Copy from [18-COPY-BANK.md](./18-COPY-BANK.md)
- [ ] Footer complete

## Phase 6 — Deploy

- [ ] `frontend/.env.example` + `backend/.env.example`
- [ ] Docker builds pass
- [ ] EasyPanel env documented in [14-DEPLOYMENT-EASYPANEL.md](./14-DEPLOYMENT-EASYPANEL.md)
- [ ] Health endpoints OK

## Phase 7 — QA

- [ ] Mobile RTL iPhone size
- [ ] Order E2E → Postgres + Sheet row
- [ ] Double-submit prevented
- [ ] Lighthouse mobile performance ≥ 85 (best effort)
- [ ] No medical overclaims in copy

## Out of scope reminder

- Payment gateway
- User accounts
- Admin dashboard (v1)
