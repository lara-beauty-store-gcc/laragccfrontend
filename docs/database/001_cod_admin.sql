-- COD Admin Dashboard schema (PostgreSQL)
-- Run on api.larabeauty.store database (laragccbackend)

BEGIN;

CREATE TABLE IF NOT EXISTS redirect_rules (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  destination TEXT NOT NULL,
  label VARCHAR(255) NOT NULL DEFAULT '',
  clicks_valid BIGINT NOT NULL DEFAULT 0,
  clicks_total BIGINT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS click_events (
  id BIGSERIAL PRIMARY KEY,
  event_key VARCHAR(64) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL,
  path_prefix VARCHAR(16) NOT NULL,
  ip INET,
  country_code CHAR(2),
  is_vpn BOOLEAN NOT NULL DEFAULT FALSE,
  is_proxy BOOLEAN NOT NULL DEFAULT FALSE,
  is_tor BOOLEAN NOT NULL DEFAULT FALSE,
  is_hosting BOOLEAN NOT NULL DEFAULT FALSE,
  is_valid BOOLEAN NOT NULL DEFAULT FALSE,
  geo_reason VARCHAR(64) NOT NULL DEFAULT '',
  user_agent TEXT,
  referer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_click_events_created_at ON click_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_click_events_slug_created_at ON click_events (slug, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_click_events_valid_created_at ON click_events (is_valid, created_at DESC);

CREATE TABLE IF NOT EXISTS cod_orders (
  id BIGSERIAL PRIMARY KEY,
  order_number VARCHAR(64) NOT NULL,
  batch_key VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  phone_e164 VARCHAR(32) NOT NULL,
  country_code CHAR(2) NOT NULL DEFAULT 'AE',
  currency CHAR(3) NOT NULL DEFAULT 'AED',
  area_notes TEXT,
  source_url TEXT,
  redirect_slug VARCHAR(120),
  client_ip INET,
  geo_country CHAR(2),
  is_vpn BOOLEAN NOT NULL DEFAULT FALSE,
  is_valid_geo BOOLEAN NOT NULL DEFAULT FALSE,
  geo_reason VARCHAR(64),
  payment_method VARCHAR(32) NOT NULL DEFAULT 'COD',
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  sheet_synced BOOLEAN NOT NULL DEFAULT FALSE,
  sheet_sync_error TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cod_orders_created_at ON cod_orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cod_orders_batch_key ON cod_orders (batch_key);
CREATE INDEX IF NOT EXISTS idx_cod_orders_redirect_slug ON cod_orders (redirect_slug);
CREATE INDEX IF NOT EXISTS idx_cod_orders_phone ON cod_orders (phone_e164);

CREATE TABLE IF NOT EXISTS cod_order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES cod_orders(id) ON DELETE CASCADE,
  order_number VARCHAR(64) NOT NULL,
  sku VARCHAR(120),
  product_name TEXT NOT NULL,
  product_url TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  line_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cod_order_items_order_id ON cod_order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_cod_order_items_order_number ON cod_order_items (order_number);

CREATE OR REPLACE VIEW cod_daily_metrics AS
SELECT
  DATE_TRUNC('day', ce.created_at)::date AS day,
  COUNT(*) FILTER (WHERE ce.is_valid) AS valid_clicks,
  COUNT(DISTINCT o.id) AS orders,
  COALESCE(SUM(o.total_amount), 0) AS revenue
FROM click_events ce
FULL OUTER JOIN cod_orders o
  ON DATE_TRUNC('day', ce.created_at) = DATE_TRUNC('day', o.created_at)
GROUP BY 1
ORDER BY 1 DESC;

COMMIT;
