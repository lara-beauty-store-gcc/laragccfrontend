import { listUnsyncedOrderBatches } from '@/lib/order-store';
import { sheetsWebhookConfigured } from '@/lib/sheets-webhook';

export async function GET() {
  const batches = await listUnsyncedOrderBatches();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  return Response.json(
    {
      status: 'ok',
      service: 'lara-beauty-store',
      market: 'UAE',
      countryCode: 'AE',
      currency: 'AED',
      deployTag: 'fix-orders-sheets-api-v28-2026-07-28',
      repo: 'laragccfrontend',
      orderFlow: 'api-first',
      apiUrl: apiUrl ? 'configured' : 'missing',
      sheetsWebhook: sheetsWebhookConfigured() ? 'configured' : 'missing',
      unsyncedOrders: batches.reduce((sum, batch) => sum + batch.orderIds.length, 0),
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    },
  );
}
