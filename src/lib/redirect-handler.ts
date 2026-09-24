import { clientIp } from '@/lib/client-ip';
import { logClickEvent } from '@/lib/click-store';
import { lookupGeo } from '@/lib/geoip';
import { getRedirect, recordRedirectClick } from '@/lib/redirect-store';
import { resolveDestination, siteBaseUrl } from '@/lib/redirect-resolve';

export async function handleTrackedRedirect(
  req: Request,
  slug: string,
  pathPrefix: '/r/' | '/ads/',
) {
  const rule = await getRedirect(slug);

  if (!rule || !rule.active) {
    return Response.redirect(siteBaseUrl(), 302);
  }

  const ip = clientIp(req);
  const geo = await lookupGeo(ip);
  await logClickEvent({
    slug,
    pathPrefix,
    geo,
    userAgent: req.headers.get('user-agent') || '',
    referer: req.headers.get('referer') || '',
  });

  if (geo.isValid) {
    await recordRedirectClick(slug);
  }

  const destination = resolveDestination(rule.destination, req);
  return Response.redirect(destination, 302);
}
