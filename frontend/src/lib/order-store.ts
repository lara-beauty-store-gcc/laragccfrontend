import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { generateLaraOrderIds } from '@/lib/order-ids';
import { extractRedirectSlugFromUrl } from '@/lib/redirect-resolve';
import type { GeoLookupResult } from '@/lib/geoip';

export type StoredOrderRow = {
  orderId: string;
  createdAt: string;
  customerName: string;
  phone: string;
  country: string;
  currency: string;
  area: string;
  product: string;
  url: string;
  sku: string;
  quantity: number;
  totalPrice: number;
  sourceUrl: string;
  sheetSynced: boolean;
  clientIp?: string;
  geoCountry?: string | null;
  isVpn?: boolean;
  isValidGeo?: boolean;
  geoReason?: string;
  redirectSlug?: string | null;
  userAgent?: string;
};

type OrderStore = {
  counter: number;
  orders: StoredOrderRow[];
};

const DATA_DIR = process.env.ORDERS_DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'orders.json');

async function readStore(): Promise<OrderStore> {
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw) as OrderStore;
    return {
      counter: Number(parsed.counter) || 0,
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    };
  } catch {
    return { counter: 0, orders: [] };
  }
}

async function writeStore(store: OrderStore) {
  await mkdir(DATA_DIR, { recursive: true });
  await fsWriteAtomic(DATA_FILE, JSON.stringify(store, null, 2));
}

async function fsWriteAtomic(file: string, content: string) {
  const tmp = `${file}.tmp`;
  await writeFile(tmp, content, 'utf8');
  await writeFile(file, content, 'utf8');
}

export type PersistOrderInput = {
  customerName: string;
  phone: string;
  country: string;
  currency: string;
  area: string;
  sourceUrl: string;
  redirectSlug?: string | null;
  clientIp?: string;
  geo?: GeoLookupResult;
  userAgent?: string;
  items: Array<{
    product: string;
    url: string;
    sku: string;
    quantity: number;
    totalPrice: number;
  }>;
};

export async function persistOrdersLocally(input: PersistOrderInput, presetOrderIds?: string[]) {
  const store = await readStore();
  const createdAt = new Date().toISOString();
  const orderIds =
    presetOrderIds && presetOrderIds.length === input.items.length
      ? presetOrderIds.map(String)
      : generateLaraOrderIds(input.items.length);
  const rows: StoredOrderRow[] = [];
  const redirectSlug = input.redirectSlug ?? extractRedirectSlugFromUrl(input.sourceUrl);

  for (let index = 0; index < input.items.length; index += 1) {
    const item = input.items[index];
    const orderId = orderIds[index];
    store.counter += 1;
    rows.push({
      orderId,
      createdAt,
      customerName: input.customerName,
      phone: input.phone,
      country: input.country,
      currency: input.currency,
      area: input.area,
      product: item.product,
      url: item.url,
      sku: item.sku,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
      sourceUrl: input.sourceUrl,
      sheetSynced: false,
      clientIp: input.clientIp,
      geoCountry: input.geo?.country ?? null,
      isVpn: input.geo?.isVpn,
      isValidGeo: input.geo?.isValid,
      geoReason: input.geo?.reason,
      redirectSlug,
      userAgent: input.userAgent,
    });
  }

  store.orders.push(...rows);
  await writeStore(store);

  return { orderIds, rows };
}

export async function markOrdersSynced(orderIds: string[]) {
  const store = await readStore();
  const idSet = new Set(orderIds);
  let changed = false;

  store.orders = store.orders.map((row) => {
    if (!idSet.has(row.orderId) || row.sheetSynced) return row;
    changed = true;
    return { ...row, sheetSynced: true };
  });

  if (changed) await writeStore(store);
}

export async function listUnsyncedOrders() {
  const store = await readStore();
  return store.orders.filter((row) => !row.sheetSynced);
}

export type UnsyncedOrderBatch = {
  key: string;
  createdAt: string;
  customerName: string;
  phone: string;
  country: string;
  currency: string;
  area: string;
  sourceUrl: string;
  orderIds: string[];
  items: Array<{
    product: string;
    url: string;
    sku: string;
    quantity: number;
    totalPrice: number;
  }>;
};

function batchKey(row: StoredOrderRow) {
  return `${row.createdAt}|${row.customerName}|${row.phone}|${row.area}`;
}

export async function listUnsyncedOrderBatches(): Promise<UnsyncedOrderBatch[]> {
  const unsynced = await listUnsyncedOrders();
  const batches = new Map<string, UnsyncedOrderBatch>();

  for (const row of unsynced) {
    const key = batchKey(row);
    const existing = batches.get(key);
    const item = {
      product: row.product,
      url: row.url,
      sku: row.sku,
      quantity: row.quantity,
      totalPrice: row.totalPrice,
    };

    if (existing) {
      existing.orderIds.push(row.orderId);
      existing.items.push(item);
      continue;
    }

    batches.set(key, {
      key,
      createdAt: row.createdAt,
      customerName: row.customerName,
      phone: row.phone,
      country: row.country,
      currency: row.currency,
      area: row.area,
      sourceUrl: row.sourceUrl,
      orderIds: [row.orderId],
      items: [item],
    });
  }

  return Array.from(batches.values());
}

function inDateRange(createdAt: string, from?: string, to?: string) {
  const ts = Date.parse(createdAt);
  if (from && ts < Date.parse(from)) return false;
  if (to && ts > Date.parse(`${to}T23:59:59.999Z`)) return false;
  return true;
}

export async function listOrders(filters?: {
  from?: string;
  to?: string;
  slug?: string;
  limit?: number;
}) {
  const store = await readStore();
  const slug = filters?.slug?.trim().toLowerCase();
  const limit = filters?.limit ?? 500;

  return store.orders
    .filter((row) => {
      if (!inDateRange(row.createdAt, filters?.from, filters?.to)) return false;
      if (slug && row.redirectSlug !== slug) return false;
      return true;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export type OrderBatch = {
  batchKey: string;
  createdAt: string;
  customerName: string;
  phone: string;
  country: string;
  currency: string;
  area: string;
  sourceUrl: string;
  redirectSlug: string | null;
  clientIp?: string;
  geoCountry?: string | null;
  isVpn?: boolean;
  isValidGeo?: boolean;
  geoReason?: string;
  sheetSynced: boolean;
  orderIds: string[];
  items: Array<{
    orderId: string;
    product: string;
    url: string;
    sku: string;
    quantity: number;
    totalPrice: number;
  }>;
  totalPrice: number;
  itemCount: number;
};

export async function listOrderBatches(filters?: { from?: string; to?: string; slug?: string; limit?: number }) {
  const rows = await listOrders(filters);
  const batches = new Map<string, OrderBatch>();

  for (const row of rows) {
    const key = batchKey(row);
    const existing = batches.get(key);
    const item = {
      orderId: row.orderId,
      product: row.product,
      url: row.url,
      sku: row.sku,
      quantity: row.quantity,
      totalPrice: row.totalPrice,
    };

    if (existing) {
      existing.orderIds.push(row.orderId);
      existing.items.push(item);
      existing.totalPrice += row.totalPrice;
      existing.itemCount += row.quantity;
      existing.sheetSynced = existing.sheetSynced && row.sheetSynced;
      continue;
    }

    batches.set(key, {
      batchKey: key,
      createdAt: row.createdAt,
      customerName: row.customerName,
      phone: row.phone,
      country: row.country,
      currency: row.currency,
      area: row.area,
      sourceUrl: row.sourceUrl,
      redirectSlug: row.redirectSlug ?? null,
      clientIp: row.clientIp,
      geoCountry: row.geoCountry,
      isVpn: row.isVpn,
      isValidGeo: row.isValidGeo,
      geoReason: row.geoReason,
      sheetSynced: row.sheetSynced,
      orderIds: [row.orderId],
      items: [item],
      totalPrice: row.totalPrice,
      itemCount: row.quantity,
    });
  }

  const limit = filters?.limit ?? 200;
  return Array.from(batches.values())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export async function getOrderBatchByKey(batchKeyValue: string) {
  const batches = await listOrderBatches({ limit: 1000 });
  return batches.find((batch) => batch.batchKey === batchKeyValue || batch.orderIds.includes(batchKeyValue)) ?? null;
}
