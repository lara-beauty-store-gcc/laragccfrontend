# Lara Beauty — Documentation Index

**Brand:** لارا للجمال · Lara Beauty  
**Market:** Kuwait (KWT) · COD only · Arabic (Gulf/Kuwaiti tone)  
**Domains:** `larabeauty.store` (frontend) · `api.larabeauty.store` (backend)  
**DB:** PostgreSQL `larabeauty` on EasyPanel

This folder is the **single source of truth** for the AI coder building `frontend/` (Next.js) and `backend/` (FastAPI).

## Read order (mandatory)

| # | File | Purpose |
|---|------|---------|
| 00 | [00-PROJECT-OVERVIEW.md](./00-PROJECT-OVERVIEW.md) | Goals, scope, success metrics |
| 01 | [01-POSITIONING-BRAND.md](./01-POSITIONING-BRAND.md) | Brand promise, authority, premium DTC |
| 02 | [02-ICP-COPY-GUIDELINES.md](./02-ICP-COPY-GUIDELINES.md) | Kuwait ICP, Gulf Arabic, emotions + proof |
| 03 | [03-PRODUCTS-CATALOG.md](./03-PRODUCTS-CATALOG.md) | 3 SKUs, bundles, cross-sell matrix |
| 04 | [04-PAGE-SPECS.md](./04-PAGE-SPECS.md) | Every page/section structure |
| 05 | [05-CRO-CONVERSION.md](./05-CRO-CONVERSION.md) | Offers, scarcity, trust, AOV tactics |
| 06 | [06-DESIGN-SYSTEM.md](./06-DESIGN-SYSTEM.md) | Colors, typography, components, RTL |
| 07 | [07-ARCHITECTURE.md](./07-ARCHITECTURE.md) | System diagram, folders, data flow |
| 08 | [08-FRONTEND-RULES.md](./08-FRONTEND-RULES.md) | Next.js, Tailwind, libs, patterns |
| 09 | [09-BACKEND-RULES.md](./09-BACKEND-RULES.md) | FastAPI, migrations, jobs |
| 10 | [10-API-SPEC.md](./10-API-SPEC.md) | REST endpoints, payloads |
| 11 | [11-DATABASE-SCHEMA.md](./11-DATABASE-SCHEMA.md) | Tables, enums, indexes |
| 12 | [12-CART-CHECKOUT-FLOW.md](./12-CART-CHECKOUT-FLOW.md) | Cart drawer, popup, upsell, thank you |
| 13 | [13-TRACKING-PIXELS-CAPI.md](./13-TRACKING-PIXELS-CAPI.md) | Meta, TikTok, Snap — web + server |
| 14 | [14-DEPLOYMENT-EASYPANEL.md](./14-DEPLOYMENT-EASYPANEL.md) | Docker, GitHub, env on EasyPanel |
| 15 | [15-GOOGLE-SHEETS-INTEGRATION.md](./15-GOOGLE-SHEETS-INTEGRATION.md) | Webhook, Apps Script, CSV template |
| 16 | [16-ENV-VARIABLES.md](./16-ENV-VARIABLES.md) | Full env reference |
| 17 | [17-AI-CODER-CHECKLIST.md](./17-AI-CODER-CHECKLIST.md) | Definition of done |
| 18 | [18-COPY-BANK.md](./18-COPY-BANK.md) | Ready-to-use Arabic strings |
| 19 | [19-LEGAL-TRUST-PAGES.md](./19-LEGAL-TRUST-PAGES.md) | Policies, badges, certifications copy |

## Deliverables outside `docs/`

| Path | Description |
|------|-------------|
| `frontend/` | Next.js 15 App Router, Tailwind, RTL |
| `backend/` | FastAPI + Alembic/SQL migrations on startup |
| `sheets/orders-template.csv` | Column headers for Google Sheet |
| `sheets/google-apps-script.js` | Deploy to Apps Script; URL → backend env |

## Logo placeholder

User will upload logo later. Until then, use wordmark: **لارا للجمال** + **Lara Beauty** per [06-DESIGN-SYSTEM.md](./06-DESIGN-SYSTEM.md).
