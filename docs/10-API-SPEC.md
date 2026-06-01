# 10 — API Specification

Base URL: `https://api.larabeauty.store`  
Prefix: `/api/v1`

## `GET /health`

```json
{ "status": "ok" }
```

## `GET /api/v1/products`

Returns all products with bundles.

```json
{
  "products": [
    {
      "id": "uuid",
      "slug": "magnesium-sleep-gummies",
      "name_ar": "علكات المغنيسيوم لتحسين جودة النوم",
      "name_en": "Magnesium Sleep Gummies",
      "category_ar": "النوم والاسترخاء",
      "images": ["/images/sample/magnesium-hero.jpg"],
      "rating": 4.9,
      "review_count": 124,
      "bundles": [
        { "id": "bundle_1", "qty": 1, "price_kwd": 16.0 },
        { "id": "bundle_2", "qty": 2, "price_kwd": 23.0 },
        { "id": "bundle_3", "qty": 3, "price_kwd": 29.0 }
      ]
    }
  ]
}
```

## `GET /api/v1/products/{slug}`

Single product + cross_sell slugs array.

## `POST /api/v1/orders`

Creates COD order.

### Request

```json
{
  "customer": {
    "name": "فاطمة العتيبي",
    "phone": "51234567"
  },
  "lines": [
    {
      "product_id": "uuid",
      "bundle_id": "bundle_2",
      "quantity": 1
    }
  ],
  "upsell": {
    "product_id": "uuid",
    "accepted": true
  },
  "attribution": {
    "event_id": "evt_1735689600_abc123",
    "fbp": "fb.1.xxx",
    "fbc": "fb.1.xxx",
    "ttclid": "",
    "ttp": "",
    "sc_click_id": "",
    "user_agent": "Mozilla/5.0...",
    "page_url": "https://larabeauty.store/products/magnesium-sleep-gummies"
  }
}
```

### Response `201`

```json
{
  "order_id": "LB-20260601-00042",
  "total_kwd": 32.0,
  "currency": "KWD",
  "status": "pending_confirmation",
  "message_ar": "تم استلام طلبك — بنتصل فيك لتأكيد التوصيل"
}
```

### Errors

| Code | When |
|------|------|
| 400 | Invalid phone, empty cart, bad bundle |
| 422 | Validation errors |
| 429 | Rate limit |
| 500 | Server error |

## `POST /api/v1/events` (optional bridge)

Frontend sends server-side assist when needed:

```json
{
  "event_name": "AddToCart",
  "event_id": "evt_...",
  "event_source_url": "https://larabeauty.store/...",
  "custom_data": {
    "currency": "KWD",
    "value": 23.0,
    "content_ids": ["LARA-MAG-bundle_2"]
  },
  "customer": {
    "phone": "51234567",
    "name": ""
  }
}
```

Backend forwards to CAPI with hashed PII when phone/name present.

## CORS

```
Access-Control-Allow-Origin: https://larabeauty.store
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## Idempotency

Optional header `X-Idempotency-Key` on order create — prevent double-submit from upsell timer.
