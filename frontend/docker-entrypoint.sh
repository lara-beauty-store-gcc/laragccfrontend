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

echo "[OK] Orders data dir: ${ORDERS_DATA_DIR:-/app/data}"
mkdir -p "${ORDERS_DATA_DIR:-/app/data}"

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
