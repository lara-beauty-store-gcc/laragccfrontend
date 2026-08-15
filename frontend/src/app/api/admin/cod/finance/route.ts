import { isCodAdminAuthorized, unauthorizedResponse, codAdminConfigured } from '@/lib/cod-admin-auth';
import { buildCodMetrics } from '@/lib/cod-metrics';
import {
  mergeFinanceVariablePatch,
  readFinanceConfig,
  writeFinanceConfig,
  type CodFinanceVariablePatch,
} from '@/lib/cod-finance-config';
import {
  COD_FINANCE_PRODUCT_OPTIONS,
  FIXED_UAE_SERVICE_FEE_LINES,
} from '@/lib/cod-finance-fixed';
import { buildCodFinanceModel } from '@/lib/cod-financial-model';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!codAdminConfigured()) return Response.json({ error: 'admin_not_configured' }, { status: 503 });
  if (!isCodAdminAuthorized(req)) return unauthorizedResponse();

  const url = new URL(req.url);
  const config = await readFinanceConfig();
  const metrics = await buildCodMetrics({
    from: url.searchParams.get('from'),
    to: url.searchParams.get('to'),
    slug: url.searchParams.get('slug'),
  });

  const model = buildCodFinanceModel(config, {
    validClicks: metrics.totals.validClicks,
    orders: metrics.totals.orders,
    revenueAed: metrics.totals.revenue,
    avgOrderValueAed: metrics.totals.avgOrderValue,
  });

  return Response.json({
    config,
    live: model.live,
    metrics: metrics.totals,
    fixedFees: FIXED_UAE_SERVICE_FEE_LINES,
    products: COD_FINANCE_PRODUCT_OPTIONS,
  });
}

export async function PATCH(req: Request) {
  if (!codAdminConfigured()) return Response.json({ error: 'admin_not_configured' }, { status: 503 });
  if (!isCodAdminAuthorized(req)) return unauthorizedResponse();

  try {
    const body = (await req.json()) as Partial<CodFinanceVariablePatch>;
    const current = await readFinanceConfig();
    const next = mergeFinanceVariablePatch(current, body);
    await writeFinanceConfig(next);
    return Response.json({ ok: true, config: next });
  } catch {
    return Response.json({ error: 'save_failed' }, { status: 400 });
  }
}
