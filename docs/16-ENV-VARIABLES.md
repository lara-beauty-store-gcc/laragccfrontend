# 16 — Environment Variables

## Frontend (`frontend/.env.example`)

```bash
# Public — safe in browser
NEXT_PUBLIC_SITE_URL=https://larabeauty.store
NEXT_PUBLIC_API_URL=https://api.larabeauty.store

# Pixels (public IDs only)
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_TIKTOK_PIXEL_ID=
NEXT_PUBLIC_SNAP_PIXEL_ID=

# Optional analytics
NEXT_PUBLIC_GA4_ID=

# Feature flags
NEXT_PUBLIC_UPSELL_DURATION_MS=15000
NEXT_PUBLIC_SCARCITY_ENABLED=true
```

## Backend (`backend/.env.example`)

```bash
# App
APP_ENV=production
APP_DEBUG=false
CORS_ORIGINS=https://larabeauty.store

# Database (EasyPanel internal)
DATABASE_URL=postgres://larabeauty:larabeauty@larabeauty_database:5432/larabeauty?sslmode=disable

# Google Sheets
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/XXXX/exec
GOOGLE_SHEETS_WEBHOOK_SECRET=change-me-long-random

# Meta CAPI
META_PIXEL_ID=
META_CAPI_ACCESS_TOKEN=
META_TEST_EVENT_CODE=

# TikTok Events API
TIKTOK_PIXEL_ID=
TIKTOK_ACCESS_TOKEN=
TIKTOK_TEST_EVENT_CODE=

# Snapchat CAPI
SNAP_PIXEL_ID=
SNAP_CAPI_ACCESS_TOKEN=

# Order
ORDER_RATE_LIMIT_PER_MINUTE=5
KUWAIT_COUNTRY_CODE=965

# Upsell
UPSELL_PRICE_KWD=9.000
```

## EasyPanel mapping

| Variable | Service |
|----------|---------|
| All `NEXT_PUBLIC_*` | Frontend |
| `DATABASE_URL` | Backend (use internal URL) |
| CAPI tokens | Backend only |
| Pixel IDs | Frontend (web) + Backend (CAPI uses pixel id) |

## Never commit

- `.env`, `.env.local`
- Real tokens in docs
