export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'lara-beauty-store',
    market: 'UAE',
    countryCode: 'AE',
    currency: 'AED',
    deployTag: 'gulf-dialect-copy-v17-2026-07-28',
    repo: 'laragccfrontend',
    timestamp: new Date().toISOString(),
  });
}
