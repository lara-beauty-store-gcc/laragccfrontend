# 08 — Frontend Rules

## Stack (required)

| Package | Version guidance |
|---------|------------------|
| next | 15.x |
| react | 19.x |
| typescript | 5.x |
| tailwindcss | 4.x |
| zustand | 5.x |
| @tanstack/react-query | 5.x |
| react-hook-form + zod | latest |
| framer-motion | 11.x |
| lucide-react | icons |
| shadcn/ui | init with RTL |

## Coding standards

1. **TypeScript strict** — no `any` in cart/order types
2. **Server Components** default; `'use client'` only for interactivity
3. **Arabic copy** in constants file `src/content/ar.ts` — not hardcoded scattered
4. **Images:** `next/image` only; sample paths from docs
5. **API base URL:** `process.env.NEXT_PUBLIC_API_URL`
6. **No secrets** in `NEXT_PUBLIC_*`

## Cart store shape

```ts
type CartLine = {
  productId: string;
  slug: string;
  nameAr: string;
  bundleId: 'bundle_1' | 'bundle_2' | 'bundle_3';
  quantity: number; // bundles count (usually 1)
  unitCount: number; // pieces in bundle (1,2,3)
  priceKwd: number; // from server-validated snapshot at add time
};

type CartState = {
  lines: CartLine[];
  upsellLine?: { productId: string; priceKwd: 9 };
  addBundle: (...) => void;
  openCart: () => void;
  // ...
};
```

## CTA behavior (PDP)

```text
onClick:
  1. add selected bundle to cart
  2. set cartDrawerOpen = true
  3. fire AddToCart pixel with content_ids, value, currency KWD
```

## Checkout CTA (cart drawer)

```text
onClick:
  1. open CheckoutDialog (do not navigate away)
  2. fire InitiateCheckout
```

## Phone input

- Mask display for Kuwait
- zod schema:

```ts
const kuwaitPhoneSchema = z.string().refine(normalizeKuwaitPhone, {
  message: 'رقم كويتي غير صحيح — مثال: 5XXXXXXX',
});
```

## Performance — deferred pixels

Load pixel scripts **after** `window.onload` or via `requestIdleCallback`:

```ts
// src/components/tracking/PixelProvider.tsx
'use client';
// DO NOT import fbevents in layout head synchronously
```

Use `next/script` with `strategy="lazyOnload"` for:
- Meta Pixel base
- TikTok Pixel
- Snap Pixel

## SEO

- `metadata` per page in Arabic
- `openGraph` images — sample hero
- `jsonLd` Product on PDP
- Canonical `https://larabeauty.store/...`

## Docker (frontend)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

Enable `output: 'standalone'` in `next.config.ts`.

## Do not

- Use Shopify Hydrogen, WordPress, or page builders
- Block render on pixel load
- Trust client-side price for order POST body without server recalculation
