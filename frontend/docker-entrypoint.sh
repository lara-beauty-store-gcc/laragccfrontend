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
  "TIKTOK_PIXEL_ID": "${TIKTOK_PIXEL_ID:-D9V4EIJC77U9RA6QKBL0}"
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
