import { isRedirectAdminAuthorized } from '@/lib/redirect-auth';
import { createRedirect, listRedirects } from '@/lib/redirect-store';
import { runtimeEnv } from '@/lib/runtime-env';

export const dynamic = 'force-dynamic';

function siteBaseUrl() {
  return runtimeEnv('NEXT_PUBLIC_SITE_URL', 'https://larabeauty.store').replace(/\/$/, '');
}

export async function GET(req: Request) {
  if (!isRedirectAdminAuthorized(req)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  const redirects = await listRedirects();
  const baseUrl = siteBaseUrl();

  return Response.json({
    baseUrl,
    redirectPrefix: `${baseUrl}/r/`,
    redirects: redirects.map((item) => ({
      ...item,
      shortUrl: `${baseUrl}/r/${item.slug}`,
    })),
  });
}

export async function POST(req: Request) {
  if (!isRedirectAdminAuthorized(req)) {
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
      redirect: { ...rule, shortUrl: `${baseUrl}/r/${rule.slug}` },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'create_failed';
    const status = message === 'slug_exists' ? 409 : 400;
    return Response.json({ error: message }, { status });
  }
}
