import { stripeConfigured, stripePublishableKey } from '@/lib/runtime-env';

export const dynamic = 'force-dynamic';

export async function GET() {
  const secretOk = stripeConfigured();
  const publishableKey = stripePublishableKey();

  return Response.json({
    cardPayments: secretOk,
    publishableKey: publishableKey || null,
    ready: secretOk && Boolean(publishableKey),
  });
}
