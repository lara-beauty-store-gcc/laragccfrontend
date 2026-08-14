import { getRedirect, recordRedirectClick } from '@/lib/redirect-store';
import { runtimeEnv } from '@/lib/runtime-env';

export const dynamic = 'force-dynamic';

function siteBaseUrl() {
  return runtimeEnv('NEXT_PUBLIC_SITE_URL', 'https://larabeauty.store').replace(/\/$/, '');
}

function resolveDestination(raw: string, req: Request) {
  const trimmed = raw.trim();
  if (!trimmed) return siteBaseUrl();

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const base = siteBaseUrl();
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const url = new URL(path, base);

  const incoming = new URL(req.url);
  incoming.searchParams.forEach((value, key) => {
    if (!url.searchParams.has(key)) url.searchParams.set(key, value);
  });

  return url.toString();
}

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const rule = await getRedirect(params.slug);

  if (!rule || !rule.active) {
    return Response.redirect(siteBaseUrl(), 302);
  }

  await recordRedirectClick(params.slug);
  const destination = resolveDestination(rule.destination, req);

  return Response.redirect(destination, 302);
}
