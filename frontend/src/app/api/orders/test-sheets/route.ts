import { sheetsWebhookConfigured, forwardOrderToSheets } from '@/lib/sheets-webhook';

export async function GET() {
  const result = await forwardOrderToSheets({
    customerName: 'Health Check',
    phone: '+971500000001',
    country: 'AE',
    currency: 'AED',
    area: 'Dubai — test',
    sourceUrl: 'https://larabeauty.store',
    items: [
      {
        product: 'Sheet connectivity test',
        url: 'https://larabeauty.store',
        sku: 'HEALTH-CHECK',
        quantity: 1,
        totalPrice: 0,
      },
    ],
    orderIds: [`HEALTH-${Date.now().toString(36).toUpperCase()}`],
  });

  return Response.json(
    {
      configured: sheetsWebhookConfigured(),
      result,
      timestamp: new Date().toISOString(),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
