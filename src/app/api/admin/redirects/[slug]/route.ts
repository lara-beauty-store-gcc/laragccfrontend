import { isRedirectAdminAuthorized } from '@/lib/redirect-auth';
import { deleteRedirect, updateRedirect } from '@/lib/redirect-store';
import { runtimeEnv } from '@/lib/runtime-env';

export const dynamic = 'force-dynamic';

function siteBaseUrl() {
  return runtimeEnv('NEXT_PUBLIC_SITE_URL', 'https://larabeauty.store').replace(/\/$/, '');
}

export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  if (!isRedirectAdminAuthorized(req)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      destination?: string;
      label?: string;
      active?: boolean;
    };

    const rule = await updateRedirect(params.slug, body);
    const baseUrl = siteBaseUrl();

    return Response.json({
      ok: true,
      redirect: { ...rule, shortUrl: `${baseUrl}/r/${rule.slug}` },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'update_failed';
    const status = message === 'not_found' ? 404 : 400;
    return Response.json({ error: message }, { status });
  }
}

export async function DELETE(req: Request, { params }: { params: { slug: string } }) {
  if (!isRedirectAdminAuthorized(req)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    await deleteRedirect(params.slug);
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'delete_failed';
    const status = message === 'not_found' ? 404 : 400;
    return Response.json({ error: message }, { status });
  }
}
