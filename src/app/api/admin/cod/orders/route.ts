import { isCodAdminAuthorized, unauthorizedResponse, codAdminConfigured } from '@/lib/cod-admin-auth';
import { listOrderBatches } from '@/lib/order-store';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!codAdminConfigured()) {
    return Response.json({ error: 'admin_not_configured' }, { status: 503 });
  }
  if (!isCodAdminAuthorized(req)) return unauthorizedResponse();

  const url = new URL(req.url);
  const orders = await listOrderBatches({
    from: url.searchParams.get('from') || undefined,
    to: url.searchParams.get('to') || undefined,
    slug: url.searchParams.get('slug') || undefined,
    limit: Number(url.searchParams.get('limit') || 200),
  });

  return Response.json({ orders });
}
