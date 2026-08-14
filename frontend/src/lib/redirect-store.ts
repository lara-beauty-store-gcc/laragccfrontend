import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

export type RedirectRule = {
  slug: string;
  destination: string;
  label: string;
  clicks: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type RedirectStore = {
  redirects: RedirectRule[];
};

const DATA_DIR = process.env.ORDERS_DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'redirects.json');

const DEFAULT_REDIRECTS: Omit<RedirectRule, 'createdAt' | 'updatedAt' | 'clicks'>[] = [
  { slug: 'tiktok', destination: '/products/magnesium-sleep', label: 'TikTok Ads', active: true },
  { slug: 'snap', destination: '/products/magnesium-sleep', label: 'Snap Ads', active: true },
  { slug: 'shop', destination: '/#products', label: 'General shop', active: true },
  { slug: 'mg', destination: '/products/magnesium-sleep', label: 'Magnesium Sleep', active: true },
  { slug: 'energy', destination: '/products/epimedium-energy', label: 'Epimedium Energy', active: true },
  { slug: 'focus', destination: '/products/focus-clarity', label: 'Focus Clarity', active: true },
];

function nowIso() {
  return new Date().toISOString();
}

function normalizeSlug(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^\/r\//, '')
    .replace(/^\//, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function readStore(): Promise<RedirectStore> {
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw) as RedirectStore;
    return { redirects: Array.isArray(parsed.redirects) ? parsed.redirects : [] };
  } catch {
    const created = nowIso();
    return {
      redirects: DEFAULT_REDIRECTS.map((item) => ({
        ...item,
        clicks: 0,
        createdAt: created,
        updatedAt: created,
      })),
    };
  }
}

async function writeStore(store: RedirectStore) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
}

export async function listRedirects() {
  const store = await readStore();
  return store.redirects.sort((a, b) => a.slug.localeCompare(b.slug));
}

export async function getRedirect(slug: string) {
  const normalized = normalizeSlug(slug);
  const store = await readStore();
  return store.redirects.find((item) => item.slug === normalized) ?? null;
}

export async function createRedirect(input: {
  slug: string;
  destination: string;
  label?: string;
  active?: boolean;
}) {
  const slug = normalizeSlug(input.slug);
  const destination = input.destination.trim();
  const label = String(input.label || slug).trim();

  if (!slug || slug.length < 2) throw new Error('invalid_slug');
  if (!destination) throw new Error('invalid_destination');

  const store = await readStore();
  if (store.redirects.some((item) => item.slug === slug)) throw new Error('slug_exists');

  const createdAt = nowIso();
  const rule: RedirectRule = {
    slug,
    destination,
    label,
    clicks: 0,
    active: input.active !== false,
    createdAt,
    updatedAt: createdAt,
  };

  store.redirects.push(rule);
  await writeStore(store);
  return rule;
}

export async function updateRedirect(
  slug: string,
  patch: Partial<Pick<RedirectRule, 'destination' | 'label' | 'active'>>,
) {
  const normalized = normalizeSlug(slug);
  const store = await readStore();
  const index = store.redirects.findIndex((item) => item.slug === normalized);
  if (index < 0) throw new Error('not_found');

  const current = store.redirects[index];
  store.redirects[index] = {
    ...current,
    destination: patch.destination?.trim() || current.destination,
    label: patch.label?.trim() || current.label,
    active: patch.active ?? current.active,
    updatedAt: nowIso(),
  };

  await writeStore(store);
  return store.redirects[index];
}

export async function deleteRedirect(slug: string) {
  const normalized = normalizeSlug(slug);
  const store = await readStore();
  const next = store.redirects.filter((item) => item.slug !== normalized);
  if (next.length === store.redirects.length) throw new Error('not_found');
  await writeStore({ redirects: next });
}

export async function recordRedirectClick(slug: string) {
  const normalized = normalizeSlug(slug);
  const store = await readStore();
  const index = store.redirects.findIndex((item) => item.slug === normalized);
  if (index < 0) return null;

  store.redirects[index] = {
    ...store.redirects[index],
    clicks: store.redirects[index].clicks + 1,
    updatedAt: nowIso(),
  };
  await writeStore(store);
  return store.redirects[index];
}

export { normalizeSlug };
