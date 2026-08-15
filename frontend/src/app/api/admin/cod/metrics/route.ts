import { isCodAdminAuthorized, unauthorizedResponse, codAdminConfigured } from '@/lib/cod-admin-auth';
import { buildCodMetrics } from '@/lib/cod-metrics';
import { readFinanceConfig } from '@/lib/cod-finance-config';
import { buildCodFinanceModel } from '@/lib/cod-financial-model';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!codAdminConfigured()) {
    return Response.json({ error: 'admin_not_configured' }, { status: 503 });
  }
  if (!isCodAdminAuthorized(req)) return unauthorizedResponse();

  const url = new URL(req.url);
  const metrics = await buildCodMetrics({
    from: url.searchParams.get('from'),
    to: url.searchParams.get('to'),
    slug: url.searchParams.get('slug'),
  });

  const config = await readFinanceConfig();
  const model = buildCodFinanceModel(config, {
    validClicks: metrics.totals.validClicks,
    orders: metrics.totals.orders,
    revenueAed: metrics.totals.revenue,
    avgOrderValueAed: metrics.totals.avgOrderValue,
  });
  const projection = model.liveProjection;

  return Response.json({
    ...metrics,
    finance: {
      aedToUsd: config.aedToUsd,
      confirmationRate: config.confirmationRate,
      deliveryRate: config.deliveryRate,
      revenueUsd: Math.round(metrics.totals.revenue * config.aedToUsd * 100) / 100,
      avgOrderValueUsd: Math.round(metrics.totals.avgOrderValue * config.aedToUsd * 100) / 100,
      totalCostUsd: projection.costs.totalChargeUsd,
      netProfitUsd: projection.netProfitUsd,
      totalProfitUsd: projection.profitWithoutStockUsd,
      codCollectedUsd: projection.codCollectedUsd,
    },
  });
}
