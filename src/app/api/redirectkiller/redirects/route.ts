import { adsRedirectUrl } from '@/lib/redirect-prefix';
import { isRedirectkillerAuthorized } from '@/lib/redirectkiller-auth';
import { createRedirect, listRedirects } from '@/lib/redirect-store';
import { siteBaseUrl } from '@/lib/redirect-resolve';
import { getSiteDestinations } from '@/lib/site-destinations';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!isRedirectkillerAuthorized(req)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  const redirects = await listRedirects();
  const baseUrl = siteBaseUrl();

  return Response.json({
    baseUrl,
    redirectPrefix: `${baseUrl}/ads/`,
    destinations: getSiteDestinations(),
    redirects: redirects.map((item) => ({
      ...item,
      shortUrl: adsRedirectUrl(baseUrl, item.slug),
    })),
  });
}

export async function POST(req: Request) {
  if (!isRedirectkillerAuthorized(req)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      slug?: string;
      destination?: string;
      label?: string;
      active?: boolean;
    };

    const rule = await createRedirect({
      slug: String(body.slug || ''),
      destination: String(body.destination || ''),
      label: body.label,
      active: body.active,
    });

    const baseUrl = siteBaseUrl();
    return Response.json({
      ok: true,
      redirect: { ...rule, shortUrl: adsRedirectUrl(baseUrl, rule.slug) },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'create_failed';
    const status = message === 'slug_exists' ? 409 : 400;
    return Response.json({ error: message }, { status });
  }
}
