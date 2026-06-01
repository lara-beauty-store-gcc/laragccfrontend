# 11 — Database Schema

Database name: **`larabeauty`**  
Connection (EasyPanel internal):

```
postgres://larabeauty:larabeauty@larabeauty_database:5432/larabeauty?sslmode=disable
```

## Tables

### `products`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| slug | VARCHAR UNIQUE | |
| name_ar | TEXT | |
| name_en | TEXT | |
| sku_base | VARCHAR | |
| category_ar | VARCHAR | |
| description_ar | TEXT | nullable |
| images | JSONB | array of paths |
| rating | DECIMAL(2,1) | default 4.9 |
| review_count | INT | default 0 |
| cross_sell_order | JSONB | array of product ids |
| is_active | BOOLEAN | default true |
| sort_order | INT | |
| created_at | TIMESTAMPTZ | |

### `product_bundles`

| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR PK | bundle_1, bundle_2, bundle_3 |
| product_id | UUID FK | |
| qty | INT | 1, 2, 3 |
| price_kwd | DECIMAL(10,3) | |
| label_ar | VARCHAR | "علبة واحدة" etc |

### `orders`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| order_number | VARCHAR UNIQUE | LB-YYYYMMDD-##### |
| customer_name | TEXT | |
| customer_phone | VARCHAR | normalized 965XXXXXXXX |
| subtotal_kwd | DECIMAL | |
| total_kwd | DECIMAL | |
| currency | CHAR(3) | KWD |
| status | ENUM | pending_confirmation, confirmed, shipped, cancelled |
| upsell_product_id | UUID nullable | |
| upsell_accepted | BOOLEAN | |
| upsell_price_kwd | DECIMAL nullable | 9.000 |
| event_id | VARCHAR | pixel dedup |
| attribution | JSONB | fbp, fbc, ttclid, etc |
| sheet_synced | BOOLEAN | default false |
| created_at | TIMESTAMPTZ | |

### `order_lines`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| order_id | UUID FK | |
| product_id | UUID FK | |
| bundle_id | VARCHAR | |
| product_name_ar | TEXT | snapshot |
| qty_pieces | INT | |
| unit_price_kwd | DECIMAL | |
| line_total_kwd | DECIMAL | |

## Seed migration

Insert 3 products + 9 bundle rows (3 per product) per [03-PRODUCTS-CATALOG.md](./03-PRODUCTS-CATALOG.md).

## Indexes

- `orders(created_at DESC)`
- `orders(customer_phone)`
- `products(slug)`

## Order number generation

Sequence or `MAX+1` per day with pad — implement in service layer.
