#!/usr/bin/env bash
# Build EasyPanel deploy branch `frontend` — full Next.js app at repo root (UAE store).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

git checkout main
MAIN_SHA="$(git rev-parse HEAD)"
echo "=== Build deploy branch frontend from main @ ${MAIN_SHA} ==="

stage="$(mktemp -d)"
cp -a "${ROOT}/frontend/." "${stage}/"
rm -rf "${stage}/node_modules" "${stage}/.next" 2>/dev/null || true

cat > "${stage}/EASYPANEL.md" <<EOF
# EasyPanel — Lara Beauty Store UAE

| Setting | Value |
|---------|--------|
| Repository | \`lara-beauty-store-gcc/laragccfrontend\` |
| Branch | \`frontend\` |
| Source path | *(leave empty / /)* |
| Dockerfile | \`Dockerfile\` |
| Proxy port | **3000** |

UAE market · AED · +971 · synced from \`main\` @ \`${MAIN_SHA}\`.
EOF

sed -i 's|Source path MUST be: frontend|Git branch frontend — empty Source path|g' "${stage}/docker-entrypoint.sh" 2>/dev/null || true

git branch -D frontend 2>/dev/null || true
git checkout --orphan frontend
git rm -rf . 2>/dev/null || true
git clean -fdx

shopt -s dotglob
cp -a "${stage}/"* .
shopt -u dotglob
rm -rf "${stage}"

git add -A
git commit -m "deploy(frontend): UAE store from main ${MAIN_SHA:0:7}

EasyPanel: repo laragccfrontend, branch frontend, empty source path, port 3000."
echo "✓ frontend branch ready — $(git ls-files | wc -l) files"

git checkout main
echo "Push: git push -f origin frontend"
