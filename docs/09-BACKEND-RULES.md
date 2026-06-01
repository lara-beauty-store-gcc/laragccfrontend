# 09 — Backend Rules

## Stack (required)

| Package | Purpose |
|---------|---------|
| fastapi | API framework |
| uvicorn[standard] | ASGI server |
| sqlalchemy 2 | ORM |
| alembic | Migrations |
| asyncpg or psycopg2 | PostgreSQL driver |
| pydantic v2 | Schemas |
| httpx | Outbound CAPI + Sheets |
| python-dotenv | Config |

## Startup: migrations then serve

`scripts/entrypoint.sh`:

```bash
#!/bin/sh
set -e
alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Dockerfile `CMD` → entrypoint.sh

## App structure rules

1. **Routers thin** — business logic in `services/`
2. **All prices** from `product_bundles` table at order time
3. **Orders immutable** after create (no edit v1)
4. **Logging** structlog or stdlib JSON for EasyPanel logs
5. **Health** `GET /health` → `{"status":"ok"}`

## Order validation service

```python
def calculate_order(lines: list[OrderLineIn]) -> OrderTotal:
    # 1. Load products by id
    # 2. Map bundle_id → price from DB
    # 3. Add upsell at 9.000 KWD if present
    # 4. Return line items + total
```

Reject if:
- Unknown product/bundle
- Empty cart
- Invalid phone after normalization

## CAPI module

- `hash_pii.py` — Meta vs TikTok normalization functions
- Fire CAPI **after** order persisted
- Store `event_id` on order row for dedup audit

## Environment

Load from env; never commit `.env`. See [16-ENV-VARIABLES.md](./16-ENV-VARIABLES.md).

## Docker (backend)

```dockerfile
FROM python:3.12-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends libpq5 && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN chmod +x scripts/entrypoint.sh
EXPOSE 8000
CMD ["./scripts/entrypoint.sh"]
```

## Testing (minimum)

- `pytest` for phone normalize + price calculation
- One integration test: create order with test DB

## Do not

- Store raw phone in CAPI logs
- Skip server-side price validation
- Run migrations manually in production without entrypoint
