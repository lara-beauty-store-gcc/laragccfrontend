import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

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
  items: Array<{
    product: string;
    url: string;
    sku: string;
    quantity: number;
    totalPrice: number;
  }>;
};

export async function persistOrdersLocally(input: PersistOrderInput) {
  const store = await readStore();
  const createdAt = new Date().toISOString();
  const orderIds: string[] = [];
  const rows: StoredOrderRow[] = [];

  for (const item of input.items) {
    store.counter += 1;
    const orderId = String(store.counter).padStart(5, '0');
    orderIds.push(orderId);
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
