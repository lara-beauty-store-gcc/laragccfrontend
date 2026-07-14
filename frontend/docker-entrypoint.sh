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
echo "Files: package.json=$(test -f package.json && echo yes || echo NO) .next=$(test -d .next && echo yes || echo NO)"

if [ ! -f "package.json" ]; then
  echo "[FATAL] package.json missing"
  echo "EasyPanel → App → Source path MUST be: frontend"
  echo "EasyPanel → Dockerfile file MUST be: Dockerfile"
  exit 1
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
