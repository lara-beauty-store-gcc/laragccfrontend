import { isCodAdminAuthorized, unauthorizedResponse, codAdminConfigured } from '@/lib/cod-admin-auth';
import { getOrderBatchByKey } from '@/lib/order-store';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!codAdminConfigured()) {
    return Response.json({ error: 'admin_not_configured' }, { status: 503 });
  }
  if (!isCodAdminAuthorized(_req)) return unauthorizedResponse();

  const order = await getOrderBatchByKey(decodeURIComponent(params.id));
  if (!order) {
    return Response.json({ error: 'not_found' }, { status: 404 });
  }

  return Response.json({ order });
}
