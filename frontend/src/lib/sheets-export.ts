import { businessConfig } from '@/config/business';

export type SheetsOrderItem = {
  product: string;
  url: string;
  sku: string;
  quantity: number;
  totalPrice: number;
};
const JAVA_ARRAY_REF = /^\[L[\w.$]+;@[0-9a-f]+$/i;

export type RawSheetItem = {
  product?: unknown;
  name?: unknown;
  productName?: unknown;
  title?: unknown;
  label?: unknown;
  shortName?: unknown;
  url?: unknown;
  product_url?: unknown;
  slug?: unknown;
  productId?: unknown;
  sku?: unknown;
  quantity?: unknown;
  qty?: unknown;
  quantite?: unknown;
  totalPrice?: unknown;
  totalprice?: unknown;
  lineTotal?: unknown;
  lineTotalAed?: unknown;
  lineTotalKwd?: unknown;
  price?: unknown;
  unitPriceAed?: unknown;
  unitPriceKwd?: unknown;
};

export type SheetOrderContext = {
  siteBaseUrl: string;
  sourceUrl?: string;
  customerName?: string;
  phone?: string;
  country?: string;
  currency?: string;
  date?: string;
  orderIds?: string[];
};

export function isGarbageSerializedValue(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (JAVA_ARRAY_REF.test(trimmed)) return true;
  if (trimmed === '[object Object]') return true;
  if (trimmed === 'undefined' || trimmed === 'null') return true;
  return false;
}

export function serializeProductValue(value: unknown): string {
  if (value == null) return '';

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return isGarbageSerializedValue(trimmed) ? '' : trimmed;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    const lines = value
      .map((entry) => {
        if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
          const obj = entry as RawSheetItem;
          const name = serializeProductValue(
            obj.name ?? obj.productName ?? obj.product ?? obj.title ?? obj.label ?? obj.shortName,
          );
          if (!name) return '';
          const qty = Math.max(1, Number(obj.quantity ?? obj.qty ?? obj.quantite) || 1);
          return formatProductLabel(name, qty);
        }
        return serializeProductValue(entry);
      })
      .filter(Boolean);

    return joinProductLabels(lines);
  }

  if (typeof value === 'object') {
    const obj = value as RawSheetItem;
    const name = serializeProductValue(
      obj.name ?? obj.productName ?? obj.product ?? obj.title ?? obj.label ?? obj.shortName,
    );
    if (!name) return '';
    const qty = Math.max(1, Number(obj.quantity ?? obj.qty ?? obj.quantite) || 1);
    return formatProductLabel(name, qty);
  }

  const fallback = String(value).trim();
  return isGarbageSerializedValue(fallback) ? '' : fallback;
}

export function formatProductLabel(name: string, quantity: number): string {
  const cleanName = name.trim();
  if (!cleanName) return '';
  const qty = Math.max(1, Math.floor(quantity));
  return qty > 1 ? `${cleanName} x${qty}` : cleanName;
}

export function joinProductLabels(lines: string[]): string {
  return lines.map((line) => line.trim()).filter(Boolean).join('\n');
}

function pickSlug(raw: RawSheetItem): string {
  const slug = String(raw.slug || raw.productId || '').trim();
  return slug.replace(/^\/+|\/+$/g, '');
}

function pickUrl(raw: RawSheetItem, ctx: Pick<SheetOrderContext, 'siteBaseUrl' | 'sourceUrl'>): string {
  const direct = String(raw.url || raw.product_url || '').trim();
  if (direct) return direct;

  const slug = pickSlug(raw);
  if (slug) return `${ctx.siteBaseUrl.replace(/\/$/, '')}/products/${slug}`;

  return (ctx.sourceUrl || ctx.siteBaseUrl).replace(/\/$/, '');
}

function pickQuantity(raw: RawSheetItem): number {
  return Math.max(1, Number(raw.quantity ?? raw.qty ?? raw.quantite) || 1);
}

export { pickQuantity };

function pickTotalPrice(raw: RawSheetItem, quantity: number): number {
  const candidates = [
    raw.totalPrice,
    raw.totalprice,
    raw.lineTotal,
    raw.lineTotalAed,
    raw.lineTotalKwd,
    raw.price,
  ];

  for (const candidate of candidates) {
    const n = Number(candidate);
    if (Number.isFinite(n) && n > 0) return roundMoney(n);
  }

  const unitAed = Number(raw.unitPriceAed);
  if (Number.isFinite(unitAed) && unitAed > 0) return roundMoney(unitAed * quantity);

  const unitKwd = Number(raw.unitPriceKwd);
  if (Number.isFinite(unitKwd) && unitKwd > 0) return roundMoney(unitKwd * quantity);

  return 0;
}

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function pickProductName(raw: RawSheetItem): string {
  const fromProduct = serializeProductValue(raw.product);
  if (fromProduct) return fromProduct;

  const candidates = [raw.name, raw.productName, raw.title, raw.label, raw.shortName];
  for (const candidate of candidates) {
    const serialized = serializeProductValue(candidate);
    if (serialized) return serialized;
  }

  return '';
}

export function productLabelForSheet(raw: RawSheetItem): string {
  const quantity = pickQuantity(raw);
  const name = pickProductName(raw);

  if (!name) return '';
  if (name.includes('\n')) return name;

  return formatProductLabel(name, quantity);
}

export function flattenRawItems(items: unknown): RawSheetItem[] {
  if (!items) return [];

  if (Array.isArray(items)) {
    return items.flatMap((entry) => {
      if (Array.isArray(entry)) return flattenRawItems(entry);
      if (entry && typeof entry === 'object') return [entry as RawSheetItem];
      return [];
    });
  }

  if (typeof items === 'object') return [items as RawSheetItem];
  return [];
}

export function normalizeSheetItem(
  raw: RawSheetItem,
  ctx: Pick<SheetOrderContext, 'siteBaseUrl' | 'sourceUrl'>,
): SheetsOrderItem {
  const quantity = pickQuantity(raw);

  return {
    product: productLabelForSheet(raw),
    url: pickUrl(raw, ctx),
    sku: String(raw.sku || '').trim(),
    quantity,
    totalPrice: pickTotalPrice(raw, quantity),
  };
}

export function normalizeSheetItems(
  items: unknown,
  ctx: Pick<SheetOrderContext, 'siteBaseUrl' | 'sourceUrl'>,
): SheetsOrderItem[] {
  return flattenRawItems(items)
    .map((item) => normalizeSheetItem(item, ctx))
    .filter((item) => item.product || item.sku);
}

export function buildSheetRows(
  ctx: SheetOrderContext & { items: unknown },
): Array<{
  date: string;
  orderId: string;
  country: string;
  name: string;
  phone: string;
  product: string;
  url: string;
  sku: string;
  quantity: number;
  totalPrice: number;
  currency: string;
}> {
  const siteBaseUrl = ctx.siteBaseUrl.replace(/\/$/, '');
  const items = normalizeSheetItems(ctx.items, {
    siteBaseUrl,
    sourceUrl: ctx.sourceUrl,
  });

  const date = String(ctx.date || new Date().toISOString());
  const country = String(ctx.country || 'AE').trim() || 'AE';
  const name = String(ctx.customerName || '').trim();
  const phone = String(ctx.phone || '').trim();
  const currency = String(ctx.currency || 'AED').trim() || 'AED';
  const presetIds = Array.isArray(ctx.orderIds) ? ctx.orderIds.map(String) : [];

  return items.map((item, index) => ({
    date,
    orderId: presetIds[index] || '',
    country,
    name,
    phone,
    product: item.product,
    url: item.url,
    sku: item.sku,
    quantity: item.quantity,
    totalPrice: item.totalPrice,
    currency,
  }));
}
