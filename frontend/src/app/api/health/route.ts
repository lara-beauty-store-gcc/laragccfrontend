export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'lara-beauty-store',
    market: 'UAE',
    countryCode: 'AE',
    currency: 'AED',
    deployTag: 'thank-you-cod-v6-2026-07-27',
    repo: 'laragccfrontend',
    timestamp: new Date().toISOString(),
  });
}
