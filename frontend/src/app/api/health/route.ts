export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'lara-beauty-store',
    market: 'UAE',
    countryCode: 'AE',
    currency: 'AED',
    deployTag: 'uae-currency-aed-v4',
    repo: 'laragccfrontend',
    timestamp: new Date().toISOString(),
  });
}
