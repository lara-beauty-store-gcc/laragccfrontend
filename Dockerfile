# Build store from frontend/ when EasyPanel source path is empty (repo root)
ARG CACHEBUST=fix-easypanel-build-oom-v24-2026-07-28
FROM node:20-alpine AS base
RUN echo "BUILD ${CACHEBUST}"
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

FROM base AS deps
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=--max-old-space-size=1536
RUN npm run build && test -d .next/standalone

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV ORDERS_DATA_DIR=/app/data
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S -u 1001 -G nodejs nextjs \
  && mkdir -p /app/data && chown nodejs:nodejs /app/data

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY frontend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD curl -fsS "http://127.0.0.1:3000/api/health" || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
