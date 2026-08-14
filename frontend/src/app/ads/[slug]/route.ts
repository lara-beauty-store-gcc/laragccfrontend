import { getRedirect, recordRedirectClick } from '@/lib/redirect-store';
import { resolveDestination, siteBaseUrl } from '@/lib/redirect-resolve';

export const dynamic = 'force-dynamic';

async function handleRedirect(req: Request, slug: string) {
  const rule = await getRedirect(slug);

  if (!rule || !rule.active) {
    return Response.redirect(siteBaseUrl(), 302);
  }

  await recordRedirectClick(slug);
  const destination = resolveDestination(rule.destination, req);

  return Response.redirect(destination, 302);
}

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  return handleRedirect(req, params.slug);
}
