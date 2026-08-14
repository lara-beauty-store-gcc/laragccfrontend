import { getRedirect, recordRedirectClick } from '@/lib/redirect-store';
import { resolveDestination, siteBaseUrl } from '@/lib/redirect-resolve';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const rule = await getRedirect(params.slug);

  if (!rule || !rule.active) {
    return Response.redirect(siteBaseUrl(), 302);
  }

  await recordRedirectClick(params.slug);
  const destination = resolveDestination(rule.destination, req);

  return Response.redirect(destination, 302);
}
