# COD Admin Dashboard

Admin URL: `https://larabeauty.store/admin/cod`

## Features

- Overview metrics: valid clicks, orders, revenue, conversion rate, AOV
- Date range + slug filter
- Orders tab with preview modal
- Clicks tab (valid geo clicks only in metrics; all logged in clicks tab)
- Geo/VPN filtering via MaxMind + IPQualityScore

## Frontend / EasyPanel env (store container)

```env
# Admin login
COD_ADMIN_USERNAME=admin
COD_ADMIN_PASSWORD=change-me-strong-password

# Allowed countries for valid clicks (ISO codes, comma-separated)
# UAE only: AE
# KSA only: SA
# Both: AE,SA
COD_GEO_ALLOWED_COUNTRIES=AE

# Strict geo mode (true = unknown IP/country counts as invalid)
COD_GEO_STRICT=true

# MaxMind — pick ONE approach
# A) Web service (recommended, no mmdb files)
MAXMIND_ACCOUNT_ID=123456
MAXMIND_LICENSE_KEY=your_maxmind_license_key

# B) Local MMDB files (mount into /app/data)
MAXMIND_COUNTRY_DB_PATH=/app/data/GeoLite2-Country.mmdb
MAXMIND_ANON_DB_PATH=/app/data/GeoIP2-Anonymous-IP.mmdb

# Second VPN detector — IPQualityScore
IPQS_API_KEY=your_ipqs_api_key
# alias supported:
VPN_DETECTOR_API_KEY=your_ipqs_api_key

# Existing persistence volume
ORDERS_DATA_DIR=/app/data
```

## Backend API env (api.larabeauty.store)

If you mirror data into Postgres on the backend, use the same geo/admin env vars plus DB:

```env
COD_ADMIN_USERNAME=admin
COD_ADMIN_PASSWORD=change-me-strong-password
COD_GEO_ALLOWED_COUNTRIES=AE
COD_GEO_STRICT=true
MAXMIND_ACCOUNT_ID=123456
MAXMIND_LICENSE_KEY=your_maxmind_license_key
IPQS_API_KEY=your_ipqs_api_key
DATABASE_URL=postgresql://user:pass@host:5432/larabeauty
```

## Database migration

Run on PostgreSQL:

`frontend/docs/database/001_cod_admin.sql`

Creates:

- `redirect_rules`
- `click_events`
- `cod_orders`
- `cod_order_items`
- `cod_daily_metrics` view

## Notes

- Valid clicks require allowed country **and** no VPN/proxy/tor/hosting flags.
- Redirect aggregate counters (`redirects.json`) increment only for valid clicks.
- Orders store geo/IP metadata locally in `orders.json` for dashboard preview.
- Mount `/app/data` on EasyPanel for persistence across redeploys.
