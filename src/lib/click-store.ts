import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import type { GeoLookupResult } from '@/lib/geoip';

export type ClickEvent = {
  id: string;
  slug: string;
  pathPrefix: '/r/' | '/ads/';
  createdAt: string;
  ip: string;
  country: string | null;
  isVpn: boolean;
  isProxy: boolean;
  isTor: boolean;
  isHosting: boolean;
  isValid: boolean;
  geoReason: string;
  userAgent: string;
  referer: string;
};

type ClickStore = {
  events: ClickEvent[];
};

const DATA_DIR = process.env.ORDERS_DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'click-events.json');

async function readStore(): Promise<ClickStore> {
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw) as ClickStore;
    return { events: Array.isArray(parsed.events) ? parsed.events : [] };
  } catch {
    return { events: [] };
  }
}

async function writeStore(store: ClickStore) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
}

function eventId() {
  return `clk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function logClickEvent(input: {
  slug: string;
  pathPrefix: '/r/' | '/ads/';
  geo: GeoLookupResult;
  userAgent?: string;
  referer?: string;
}) {
  const store = await readStore();
  const event: ClickEvent = {
    id: eventId(),
    slug: input.slug,
    pathPrefix: input.pathPrefix,
    createdAt: new Date().toISOString(),
    ip: input.geo.ip,
    country: input.geo.country,
    isVpn: input.geo.isVpn,
    isProxy: input.geo.isProxy,
    isTor: input.geo.isTor,
    isHosting: input.geo.isHosting,
    isValid: input.geo.isValid,
    geoReason: input.geo.reason,
    userAgent: input.userAgent || '',
    referer: input.referer || '',
  };

  store.events.push(event);
  await writeStore(store);
  return event;
}

export async function listClickEvents(filters?: {
  from?: string;
  to?: string;
  slug?: string;
  validOnly?: boolean;
}) {
  const store = await readStore();
  const fromMs = filters?.from ? Date.parse(filters.from) : null;
  const toMs = filters?.to ? Date.parse(`${filters.to}T23:59:59.999Z`) : null;
  const slug = filters?.slug?.trim().toLowerCase();

  return store.events.filter((event) => {
    const ts = Date.parse(event.createdAt);
    if (fromMs && ts < fromMs) return false;
    if (toMs && ts > toMs) return false;
    if (slug && event.slug !== slug) return false;
    if (filters?.validOnly && !event.isValid) return false;
    return true;
  });
}

export async function countValidClicks(filters?: { from?: string; to?: string; slug?: string }) {
  const events = await listClickEvents({ ...filters, validOnly: true });
  return events.length;
}
