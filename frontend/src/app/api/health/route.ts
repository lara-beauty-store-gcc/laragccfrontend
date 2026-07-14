export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'lara-beauty-store',
    market: 'UAE',
    countryCode: 'AE',
    currency: 'AED',
    deployTag: 'uae-v3-force-rebuild',
    repo: 'laragccfrontend',
    timestamp: new Date().toISOString(),
  });
}
