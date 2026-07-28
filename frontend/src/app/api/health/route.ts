import { listUnsyncedOrderBatches } from '@/lib/order-store';
import { apiBaseUrl, sheetsWebhookUrl } from '@/lib/runtime-env';
import { sheetsWebhookConfigured } from '@/lib/sheets-webhook';

export async function GET() {
  const batches = await listUnsyncedOrderBatches();

  return Response.json(
    {
      status: 'ok',
      service: 'lara-beauty-store',
      market: 'UAE',
      countryCode: 'AE',
      currency: 'AED',
      deployTag: 'fix-sheets-definitive-v29-2026-07-28',
      repo: 'laragccfrontend',
      orderFlow: 'sheets-first',
      apiUrl: apiBaseUrl() ? 'configured' : 'missing',
      sheetsWebhook: sheetsWebhookConfigured() ? 'configured' : 'missing',
      sheetsWebhookHost: sheetsWebhookUrl().replace(/^https?:\/\//, '').split('/')[0] || 'missing',
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
