# 14 — Deployment (EasyPanel)

## Services (2 apps + existing DB)

| EasyPanel service | Domain | Port | Repo path |
|-------------------|--------|------|-----------|
| `lara-frontend` | larabeauty.store | 3000 | `/frontend` |
| `lara-api` | api.larabeauty.store | 8000 | `/backend` |
| `larabeauty_database` | internal only | 5432 | existing |

## GitHub

Monorepo or single repo with `frontend/` and `backend/` folders.

**Branch:** `main`

## Frontend deploy settings

- **Build method:** Dockerfile
- **Context:** `frontend/`
- **Build args:** `NEXT_PUBLIC_API_URL=https://api.larabeauty.store`
- **Env:** see `frontend/.env.example`

## Backend deploy settings

- **Build method:** Dockerfile
- **Context:** `backend/`
- **Env:** `DATABASE_URL=postgres://larabeauty:larabeauty@larabeauty_database:5432/larabeauty?sslmode=disable`
- **Startup:** entrypoint runs `alembic upgrade head` then uvicorn

## Internal networking

Frontend container reaches API via **public URL** `https://api.larabeauty.store` (simplest).  
Backend reaches Postgres via **internal hostname** `larabeauty_database`.

## SSL

EasyPanel handles Let's Encrypt for both domains.

## Health checks

| Service | Path |
|---------|------|
| API | `/health` |
| Frontend | `/` 200 |

## CI suggestion (optional)

GitHub Action on push to `main`:
- lint + test
- EasyPanel webhook redeploy

## Post-deploy checklist

1. Products API returns 3 products
2. Test order → row in Postgres + Sheet row
3. Meta events receiving Purchase
4. Mobile RTL layout OK

## Sample images

Ship placeholder images in `frontend/public/images/sample/`. User replaces without code change — keep paths stable.
