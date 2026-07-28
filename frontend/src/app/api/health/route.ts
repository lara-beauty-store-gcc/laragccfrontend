import { listUnsyncedOrderBatches } from '@/lib/order-store';
import { sheetsWebhookConfigured } from '@/lib/sheets-webhook';

export async function GET() {
  const batches = await listUnsyncedOrderBatches();

  return Response.json({
    status: 'ok',
    service: 'lara-beauty-store',
    market: 'UAE',
    countryCode: 'AE',
    currency: 'AED',
    deployTag: 'restore-problem-image-v23-2026-07-28',
    repo: 'laragccfrontend',
    sheetsWebhook: sheetsWebhookConfigured() ? 'configured' : 'missing',
    unsyncedOrders: batches.reduce((sum, batch) => sum + batch.orderIds.length, 0),
    timestamp: new Date().toISOString(),
  });
}
