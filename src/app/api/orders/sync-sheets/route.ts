import { listUnsyncedOrderBatches } from '@/lib/order-store';
import { sheetsWebhookConfigured } from '@/lib/sheets-webhook';
import { syncUnsyncedOrdersToSheets } from '@/lib/sheets-sync';

function isAuthorized(req: Request) {
  const secret = process.env.SHEETS_WEBHOOK_SECRET || process.env.ORDERS_SYNC_SECRET || '';
  if (!secret) return false;

  const auth = req.headers.get('authorization') || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const headerSecret = req.headers.get('x-sync-secret') || bearer;

  return headerSecret === secret;
}

export async function GET() {
  const batches = await listUnsyncedOrderBatches();
  const pendingOrders = batches.reduce((sum, batch) => sum + batch.orderIds.length, 0);

  return Response.json({
    configured: sheetsWebhookConfigured(),
    pendingBatches: batches.length,
    pendingOrders,
  });
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (!sheetsWebhookConfigured()) {
    return Response.json({ error: 'sheets_not_configured' }, { status: 503 });
  }

  const result = await syncUnsyncedOrdersToSheets();
  return Response.json({ ok: true, ...result });
}
