import { getRedirect } from '@/lib/redirect-store';
import { runtimeEnv } from '@/lib/runtime-env';

export function siteBaseUrl() {
  return runtimeEnv('NEXT_PUBLIC_SITE_URL', 'https://larabeauty.store').replace(/\/$/, '');
}

export function mergeQueryParams(destination: URL, incoming: URL) {
  incoming.searchParams.forEach((value, key) => {
    if (!destination.searchParams.has(key)) destination.searchParams.set(key, value);
  });
}

export function resolveDestinationPath(raw: string, incomingSearch = '') {
  const trimmed = raw.trim();
  if (!trimmed) return siteBaseUrl();

  if (/^https?:\/\//i.test(trimmed)) {
    const url = new URL(trimmed);
    if (incomingSearch) mergeQueryParams(url, new URL(incomingSearch, siteBaseUrl()));
    return url.toString();
  }

  const base = siteBaseUrl();
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const url = new URL(path, base);

  if (incomingSearch) mergeQueryParams(url, new URL(incomingSearch, base));

  return url.toString();
}

export function resolveDestination(raw: string, req: Request) {
  const incoming = new URL(req.url);
  return resolveDestinationPath(raw, `${incoming.pathname}${incoming.search}`);
}

export async function resolveCanonicalSourceUrl(rawSourceUrl: string) {
  const base = siteBaseUrl();
  let url: URL;

  try {
    url = new URL(rawSourceUrl.trim(), base);
  } catch {
    return base;
  }

  const match = url.pathname.match(/^\/r\/([^/]+)/i);
  if (!match) return url.toString();

  const rule = await getRedirect(match[1]);
  if (!rule?.active) return url.toString();

  return resolveDestinationPath(rule.destination, `${url.pathname}${url.search}`);
}
