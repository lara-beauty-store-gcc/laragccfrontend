import { isCodAdminAuthorized, unauthorizedResponse, codAdminConfigured } from '@/lib/cod-admin-auth';
import {
  DEFAULT_UAE_FINANCE_CONFIG,
  readFinanceConfig,
  writeFinanceConfig,
  type CodFinanceConfig,
} from '@/lib/cod-finance-config';

export const dynamic = 'force-dynamic';

function pickFees(config: CodFinanceConfig) {
  return {
    leadEntryFeeUsd: config.leadEntryFeeUsd,
    confirmationFeeUsd: config.confirmationFeeUsd,
    deliveredWarehouseFeeUsd: config.deliveredWarehouseFeeUsd,
    shippingFeePerConfirmedUsd: config.shippingFeePerConfirmedUsd,
    deliveredFeeUsd: config.deliveredFeeUsd,
    codFeePercent: config.codFeePercent,
    productCostPerUnitUsd: config.productCostPerUnitUsd,
    costPerLeadUsd: config.costPerLeadUsd,
  };
}

export async function GET(req: Request) {
  if (!codAdminConfigured()) return Response.json({ error: 'admin_not_configured' }, { status: 503 });
  if (!isCodAdminAuthorized(req)) return unauthorizedResponse();

  const config = await readFinanceConfig();
  return Response.json({ fees: pickFees(config) });
}

export async function PATCH(req: Request) {
  if (!codAdminConfigured()) return Response.json({ error: 'admin_not_configured' }, { status: 503 });
  if (!isCodAdminAuthorized(req)) return unauthorizedResponse();

  try {
    const body = (await req.json()) as Partial<CodFinanceConfig>;
    const current = await readFinanceConfig();
    const next: CodFinanceConfig = {
      ...DEFAULT_UAE_FINANCE_CONFIG,
      ...current,
      ...body,
      country: 'UAE',
      currency: 'AED',
    };
    await writeFinanceConfig(next);
    return Response.json({ ok: true, fees: pickFees(next) });
  } catch {
    return Response.json({ error: 'save_failed' }, { status: 400 });
  }
}
