import { listUnsyncedOrderBatches } from '@/lib/order-store';
import {
  apiBaseUrl,
  sheetsWebhookUrl,
  stripeCheckoutReady,
  stripeConfigured,
  stripeEnvDiagnostics,
  stripePublishableKey,
} from '@/lib/runtime-env';
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
      deployTag: 'stripe-health-hints-v63-2026-09-16',
      repo: 'laragccfrontend',
      orderFlow: 'sheets-only-then-api-fallback',
      apiUrl: apiBaseUrl() ? 'configured' : 'missing',
      sheetsWebhook: sheetsWebhookConfigured() ? 'configured' : 'missing',
      stripeCheckout: stripeConfigured() ? 'configured' : 'missing',
      stripePublishableKey: stripePublishableKey() ? 'configured' : 'missing',
      stripeCardReady: stripeCheckoutReady() ? 'ready' : 'missing',
      stripeEnv: stripeEnvDiagnostics(),
      stripeSetupHint:
        stripeCheckoutReady()
          ? 'ok'
          : 'Add STRIPE_SECRET_KEY + STRIPE_PUBLISHABLE_KEY to THIS store service in EasyPanel, then restart container',
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
