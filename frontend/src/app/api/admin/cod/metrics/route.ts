import { isCodAdminAuthorized, unauthorizedResponse, codAdminConfigured } from '@/lib/cod-admin-auth';
import { buildCodMetrics } from '@/lib/cod-metrics';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!codAdminConfigured()) {
    return Response.json({ error: 'admin_not_configured' }, { status: 503 });
  }
  if (!isCodAdminAuthorized(req)) return unauthorizedResponse();

  const url = new URL(req.url);
  const metrics = await buildCodMetrics({
    from: url.searchParams.get('from'),
    to: url.searchParams.get('to'),
    slug: url.searchParams.get('slug'),
  });

  return Response.json(metrics);
}
