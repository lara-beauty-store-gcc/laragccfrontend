# 20 — AI Coder Skills & Conventions

## Required skills

| Skill | Application |
|-------|-------------|
| Next.js App Router | RSC + client islands |
| RTL Arabic layout | `dir="rtl"`, logical CSS |
| E-commerce CRO | Bundles, upsell, trust sections |
| Zustand | Cart persistence |
| FastAPI + SQLAlchemy | Orders API, migrations |
| Meta/TikTok/Snap tracking | Deferred web + hashed CAPI |
| Kuwait phone validation | +965, 8-digit mobile |
| Docker multi-stage | EasyPanel deploy |
| Google Apps Script | Sheet append webhook |

## Code quality rules

1. **Prices:** server is source of truth
2. **PII:** hash only in backend CAPI modules
3. **event_id:** one per checkout funnel for Purchase dedup
4. **Copy:** import from `content/ar.ts`, not inline 50 places
5. **Images:** keep paths stable when user replaces assets
6. **Commits:** logical phases per checklist in [17-AI-CODER-CHECKLIST.md](./17-AI-CODER-CHECKLIST.md)

## Libraries summary

**Frontend:** next, react, typescript, tailwindcss, zustand, @tanstack/react-query, react-hook-form, zod, framer-motion, shadcn/ui, lucide-react

**Backend:** fastapi, uvicorn, sqlalchemy, alembic, pydantic, httpx, python-dotenv

## Phone hashing reminder

| Platform | Format before SHA-256 |
|----------|----------------------|
| Meta | `96551234567` |
| TikTok | `+96551234567` |
| Snap | `96551234567` |

## When stuck

Re-read [12-CART-CHECKOUT-FLOW.md](./12-CART-CHECKOUT-FLOW.md) and [13-TRACKING-PIXELS-CAPI.md](./13-TRACKING-PIXELS-CAPI.md).
