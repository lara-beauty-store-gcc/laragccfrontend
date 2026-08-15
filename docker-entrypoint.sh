#!/bin/sh
set -e

echo "========================================"
echo " Lara Beauty Store — container start"
echo " Source: frontend/ | Port: ${PORT:-3000}"
echo "========================================"
echo "NODE_ENV=${NODE_ENV:-unset}"
echo "PORT=${PORT:-unset}"
echo "HOSTNAME=${HOSTNAME:-unset}"
echo "PWD=$(pwd)"
echo "Node: $(node -v)"
echo "Files: server.js=$(test -f server.js && echo yes || echo NO) .next=$(test -d .next && echo yes || echo NO)"

if [ ! -f "server.js" ] && [ ! -f "package.json" ]; then
  echo "[FATAL] server.js or package.json missing"
  exit 1
fi

DATA_DIR="${ORDERS_DATA_DIR:-/app/data}"
mkdir -p "$DATA_DIR"

# Persist runtime env for Next.js standalone (avoids empty build-time inlining).
cat > "$DATA_DIR/runtime.env.json" <<EOF
{
  "GOOGLE_SHEETS_WEBHOOK_URL": "${GOOGLE_SHEETS_WEBHOOK_URL:-}",
  "ORDERS_SHEETS_WEBHOOK_URL": "${ORDERS_SHEETS_WEBHOOK_URL:-}",
  "SHEETS_WEBHOOK_SECRET": "${SHEETS_WEBHOOK_SECRET:-}",
  "NEXT_PUBLIC_API_URL": "${NEXT_PUBLIC_API_URL:-https://api.larabeauty.store}",
  "NEXT_PUBLIC_SITE_URL": "${NEXT_PUBLIC_SITE_URL:-https://larabeauty.store}",
  "TIKTOK_ACCESS_TOKEN": "${TIKTOK_ACCESS_TOKEN:-}",
  "TIKTOK_PIXEL_ID": "${TIKTOK_PIXEL_ID:-D9V4EIJC77U9RA6QKBL0}",
  "SNAP_ACCESS_TOKEN": "${SNAP_ACCESS_TOKEN:-}",
  "SNAP_PIXEL_ID": "${SNAP_PIXEL_ID:-998e0cce-14e8-4cfb-b55e-e7eea8fe5f25}",
  "SNAP_TEST_EVENT_CODE": "${SNAP_TEST_EVENT_CODE:-}",
  "REDIRECT_ADMIN_SECRET": "${REDIRECT_ADMIN_SECRET:-}",
  "REDIRECTKILLER_ADMIN_PASSWORD": "${REDIRECTKILLER_ADMIN_PASSWORD:-}",
  "COD_ADMIN_USERNAME": "${COD_ADMIN_USERNAME:-}",
  "COD_ADMIN_PASSWORD": "${COD_ADMIN_PASSWORD:-}",
  "COD_GEO_ALLOWED_COUNTRIES": "${COD_GEO_ALLOWED_COUNTRIES:-AE}",
  "COD_GEO_STRICT": "${COD_GEO_STRICT:-true}",
  "MAXMIND_ACCOUNT_ID": "${MAXMIND_ACCOUNT_ID:-}",
  "MAXMIND_LICENSE_KEY": "${MAXMIND_LICENSE_KEY:-}",
  "MAXMIND_COUNTRY_DB_PATH": "${MAXMIND_COUNTRY_DB_PATH:-}",
  "MAXMIND_ANON_DB_PATH": "${MAXMIND_ANON_DB_PATH:-}",
  "IPQS_API_KEY": "${IPQS_API_KEY:-}",
  "VPN_DETECTOR_API_KEY": "${VPN_DETECTOR_API_KEY:-}",
  "COD_AED_TO_USD": "${COD_AED_TO_USD:-0.2725}",
  "COD_COST_PER_LEAD_USD": "${COD_COST_PER_LEAD_USD:-10}",
  "COD_CONFIRMATION_RATE": "${COD_CONFIRMATION_RATE:-0.60}",
  "COD_DELIVERY_RATE": "${COD_DELIVERY_RATE:-0.60}",
  "COD_PRICE_AOV_USD": "${COD_PRICE_AOV_USD:-65}",
  "COD_PRODUCT_COST_USD": "${COD_PRODUCT_COST_USD:-9}",
  "COD_LEAD_ENTRY_FEE_USD": "${COD_LEAD_ENTRY_FEE_USD:-0.50}",
  "COD_CONFIRMATION_FEE_USD": "${COD_CONFIRMATION_FEE_USD:-1.00}",
  "COD_DELIVERED_WAREHOUSE_FEE_USD": "${COD_DELIVERED_WAREHOUSE_FEE_USD:-2.00}",
  "COD_SHIPPING_FEE_USD": "${COD_SHIPPING_FEE_USD:-4.99}",
  "COD_DELIVERED_FEE_USD": "${COD_DELIVERED_FEE_USD:-1.00}",
  "COD_NETWORK_FEE_PERCENT": "${COD_NETWORK_FEE_PERCENT:-0.05}",
  "COD_TOTAL_STOCK_PCS": "${COD_TOTAL_STOCK_PCS:-100}",
  "COD_LEADS_AT_SCALE": "${COD_LEADS_AT_SCALE:-150}"
}
EOF

echo "[OK] Orders data dir: $DATA_DIR"
echo "[OK] API URL: ${NEXT_PUBLIC_API_URL:-https://api.larabeauty.store}"
echo "[OK] Sheets webhook: $([ -n "${GOOGLE_SHEETS_WEBHOOK_URL:-}${ORDERS_SHEETS_WEBHOOK_URL:-}" ] && echo configured || echo fallback-url)"

if [ -f "server.js" ]; then
  echo "[OK] Starting Next.js standalone on 0.0.0.0:${PORT:-3000}"
  exec node server.js
fi

if [ ! -d ".next" ]; then
  echo "[FATAL] .next/ missing — image was not built correctly"
  exit 1
fi

if [ ! -d "node_modules/next" ]; then
  echo "[FATAL] node_modules/next missing"
  exit 1
fi

echo "[OK] Starting Next.js on 0.0.0.0:${PORT:-3000}"
exec npx next start -H 0.0.0.0 -p "${PORT:-3000}"
