export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'lara-beauty-store',
    market: 'UAE',
    countryCode: 'AE',
    currency: 'AED',
    deployTag: 'cross-sell-v8-2026-07-27',
    repo: 'laragccfrontend',
    timestamp: new Date().toISOString(),
  });
}
