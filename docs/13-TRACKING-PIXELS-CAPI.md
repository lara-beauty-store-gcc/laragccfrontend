# 13 — Tracking: Web Pixels + CAPI

## Overview

| Platform | Browser (deferred) | Server CAPI | Dedup key |
|----------|-------------------|-------------|-----------|
| Meta | fbq | Graph API `/events` | `event_id` |
| TikTok | ttq | Events API | `event_id` |
| Snapchat | snaptr | CAPI v3 `/{pixel_id}/events` | `event_id` / `client_dedup_id` |

**Rule:** Web pixels = **no hashing** on PII in browser.  
**Rule:** CAPI = **SHA-256** after normalization per platform.

---

## Event list

| Event | When | Web | CAPI |
|-------|------|-----|------|
| PageView | Each route | ✓ | optional |
| ViewContent | PDP load | ✓ | ✓ |
| AddToCart | PDP CTA | ✓ | ✓ |
| InitiateCheckout | Checkout dialog open | ✓ | ✓ |
| Purchase | Order success | ✓ | ✓ |
| AddToWishlist | optional | | |

---

## Deferred loading (speed)

```tsx
// layout.tsx — DO NOT sync load in <head>
import Script from 'next/script';

<Script id="meta-pixel" strategy="lazyOnload" src="..." />
<Script id="tiktok-pixel" strategy="lazyOnload" src="..." />
<Script id="snap-pixel" strategy="lazyOnload" src="..." />
```

Initialize pixels in `onLoad` callbacks. Queue events before init with stub arrays.

Use `partytown` only if team knows it — default **lazyOnload** is enough.

---

## `event_id` generation (dedup)

```ts
export function createEventId(): string {
  return `evt_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
}
```

- Create at **InitiateCheckout** (or first AddToCart on session)
- Reuse **same** `event_id` for web Purchase and server Purchase
- Store in order row

---

## Meta (Facebook)

### Web Pixel (no hash)

```js
fbq('track', 'Purchase', {
  value: 32.0,
  currency: 'KWD',
  content_ids: ['LARA-MAG-bundle_2'],
}, { eventID: event_id });
```

Pass `eventID` option for dedup with CAPI.

### CAPI payload (hashed)

Endpoint: `POST https://graph.facebook.com/v21.0/{PIXEL_ID}/events?access_token={TOKEN}`

```json
{
  "data": [{
    "event_name": "Purchase",
    "event_time": 1735689600,
    "event_id": "evt_1735689600_abc123",
    "action_source": "website",
    "event_source_url": "https://larabeauty.store/thank-you",
    "user_data": {
      "ph": ["<sha256>"],
      "fn": ["<sha256>"],
      "country": ["<sha256>"],
      "client_ip_address": "1.2.3.4",
      "client_user_agent": "Mozilla/5.0...",
      "fbc": "fb.1....",
      "fbp": "fb.1...."
    },
    "custom_data": {
      "currency": "KWD",
      "value": 32.0,
      "content_ids": ["LARA-MAG-bundle_2"]
    }
  }]
}
```

### Meta phone hash normalization

```python
def normalize_meta_phone(kuwait_local: str) -> str:
    # Input after normalizeKuwaitPhone: "96551234567"
    return kuwait_local  # digits only, country code, no plus, no leading zero on local

def hash_meta(value: str) -> str:
    import hashlib
    return hashlib.sha256(value.strip().lower().encode("utf-8")).hexdigest()
```

Phone: hash `96551234567` NOT `+96551234567` for Meta.

### Meta first name

Split first token of name, lowercase, hash.

### Meta country

Hash `kw` (ISO 3166-1 alpha-2 lowercase).

---

## TikTok

### Web

```js
ttq.track('CompletePayment', {
  value: 32.0,
  currency: 'KWD',
  content_id: 'LARA-MAG-bundle_2',
}, { event_id });
```

### CAPI phone — E.164 WITH `+` before hash

```python
def normalize_tiktok_phone(kuwait_normalized: str) -> str:
    # "96551234567" -> "+96551234567"
    if not kuwait_normalized.startswith('+'):
        return '+' + kuwait_normalized
    return kuwait_normalized

def hash_tiktok(value: str) -> str:
    import hashlib
    return hashlib.sha256(value.encode("utf-8")).hexdigest()
```

TikTok docs: E.164 format **with +** then SHA-256.

### TikTok Events API

`POST https://business-api.tiktok.com/open_api/v1.3/event/track/`

Headers: `Access-Token: {TIKTOK_ACCESS_TOKEN}`

Include: `event_id`, `event`, `timestamp`, `properties`, `context.user` with hashed phone/email.

---

## Snapchat

### Web

```js
snaptr('track', 'PURCHASE', {
  price: 32.0,
  currency: 'KWD',
  transaction_id: order_id,
  item_ids: ['LARA-MAG'],
  client_dedup_id: event_id,
});
```

### CAPI v3

`POST https://tr.snapchat.com/v3/{PIXEL_ID}/events?access_token={TOKEN}`

```json
{
  "data": [{
    "event_name": "PURCHASE",
    "event_time": 1735689600,
    "event_id": "evt_1735689600_abc123",
    "action_source": "WEB",
    "event_source_url": "https://larabeauty.store/thank-you",
    "user_data": {
      "ph": ["<sha256>"],
      "fn": ["<sha256>"],
      "country": ["<sha256>"]
    },
    "custom_data": {
      "currency": "KWD",
      "value": "32.00",
      "order_id": "LB-20260601-00042"
    }
  }]
}
```

### Snap phone normalization

Digits only with country code, **no** `+`, no leading zero on local part — then SHA-256 lowercase hex.

Example: `96551234567` → hash (same as Meta).

---

## Comparison table (phone Kuwait example)

Local input: `51234567`

| Step | Meta | TikTok | Snap |
|------|------|--------|------|
| Normalized | `96551234567` | `+96551234567` | `96551234567` |
| Hash input | `96551234567` | `+96551234567` | `96551234567` |
| Algorithm | SHA256 lower | SHA256 | SHA256 lower hex |

---

## Backend implementation

`app/utils/hash_pii.py` — functions for each platform  
`app/services/capi_*.py` — httpx async post  
Call from `orders` service after commit.

**Do not block order response** on CAPI failure — log and retry queue (optional v1: log only).

---

## Frontend cookies to pass in order `attribution`

| Key | Source |
|-----|--------|
| fbp | `_fbp` cookie |
| fbc | `_fbc` cookie or fbclid URL |
| ttclid | URL param or cookie |
| ttp | `_ttp` cookie |
| sc_click_id | Snap click id |

---

## Env vars

See [16-ENV-VARIABLES.md](./16-ENV-VARIABLES.md) for `META_PIXEL_ID`, `META_CAPI_TOKEN`, etc.

---

## Testing

- Meta Test Events tool + `test_event_code`
- TikTok test event code
- Snap Pixel Helper

Verify dedup: one Purchase in Meta UI per order, not two.
