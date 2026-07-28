# Build store from frontend/ when EasyPanel source path is empty (repo root)
ARG CACHEBUST=no-duplicate-orders-v36-2026-07-28
FROM node:20-alpine AS base
RUN echo "BUILD ${CACHEBUST}"
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

FROM base AS deps
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM base AS builder
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WHATSAPP_NUMBER
ARG NEXT_PUBLIC_SUPPORT_PHONE
ARG NEXT_PUBLIC_SUPPORT_EMAIL
ARG NEXT_PUBLIC_META_PIXEL_ID
ARG NEXT_PUBLIC_TIKTOK_PIXEL_ID
ARG NEXT_PUBLIC_SNAP_PIXEL_ID
ARG NEXT_PUBLIC_ENABLE_PIXELS
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WHATSAPP_NUMBER=$NEXT_PUBLIC_WHATSAPP_NUMBER
ENV NEXT_PUBLIC_SUPPORT_PHONE=$NEXT_PUBLIC_SUPPORT_PHONE
ENV NEXT_PUBLIC_SUPPORT_EMAIL=$NEXT_PUBLIC_SUPPORT_EMAIL
ENV NEXT_PUBLIC_META_PIXEL_ID=$NEXT_PUBLIC_META_PIXEL_ID
ENV NEXT_PUBLIC_TIKTOK_PIXEL_ID=$NEXT_PUBLIC_TIKTOK_PIXEL_ID
ENV NEXT_PUBLIC_SNAP_PIXEL_ID=$NEXT_PUBLIC_SNAP_PIXEL_ID
ENV NEXT_PUBLIC_ENABLE_PIXELS=$NEXT_PUBLIC_ENABLE_PIXELS
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=--max-old-space-size=1536
RUN npm run build && test -d .next/standalone

FROM base AS runner
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_API_URL
ARG GOOGLE_SHEETS_WEBHOOK_URL
ARG SHEETS_WEBHOOK_SECRET
ARG ORDERS_DATA_DIR
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV GOOGLE_SHEETS_WEBHOOK_URL=$GOOGLE_SHEETS_WEBHOOK_URL
ENV SHEETS_WEBHOOK_SECRET=$SHEETS_WEBHOOK_SECRET
ENV ORDERS_DATA_DIR=${ORDERS_DATA_DIR:-/app/data}
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S -u 1001 -G nodejs nextjs \
  && mkdir -p /app/data && chown nextjs:nodejs /app/data

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
