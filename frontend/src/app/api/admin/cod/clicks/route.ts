import { isCodAdminAuthorized, unauthorizedResponse, codAdminConfigured } from '@/lib/cod-admin-auth';
import { listClickEvents } from '@/lib/click-store';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!codAdminConfigured()) {
    return Response.json({ error: 'admin_not_configured' }, { status: 503 });
  }
  if (!isCodAdminAuthorized(req)) return unauthorizedResponse();

  const url = new URL(req.url);
  const clicks = await listClickEvents({
    from: url.searchParams.get('from') || undefined,
    to: url.searchParams.get('to') || undefined,
    slug: url.searchParams.get('slug') || undefined,
    validOnly: url.searchParams.get('validOnly') !== 'false',
  });

  return Response.json({ clicks: clicks.slice(-500).reverse() });
}
