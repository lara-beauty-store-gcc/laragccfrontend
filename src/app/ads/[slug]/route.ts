import { handleTrackedRedirect } from '@/lib/redirect-handler';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  return handleTrackedRedirect(req, params.slug, '/ads/');
}
