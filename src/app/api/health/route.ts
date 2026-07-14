export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'lara-beauty-store',
    timestamp: new Date().toISOString(),
  });
}
