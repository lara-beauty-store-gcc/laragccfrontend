import {
  FIXED_UAE_SERVICE_FEES,
  productCostUsd,
  COD_PRODUCT_COSTS_USD,
  type CodFinanceProductId,
} from '@/lib/cod-finance-fixed';

export type CodFinanceConfig = {
  country: 'UAE';
  currency: 'AED';
  aedToUsd: number;
  costPerLeadUsd: number;
  confirmationRate: number;
  deliveryRate: number;
  priceAovUsd: number;
  activeProductId: CodFinanceProductId;
  productCostPerUnitUsd: number;
  leadEntryFeeUsd: number;
  confirmationFeeUsd: number;
  deliveredWarehouseFeeUsd: number;
  shippingFeePerConfirmedUsd: number;
  deliveredFeeUsd: number;
  codFeePercent: number;
  pcsPerOrder: number;
  totalStockPcs: number;
  leadsAtScale: number;
};

export type CodFinanceVariablePatch = Pick<
  CodFinanceConfig,
  | 'confirmationRate'
  | 'deliveryRate'
  | 'costPerLeadUsd'
  | 'pcsPerOrder'
  | 'priceAovUsd'
  | 'activeProductId'
  | 'totalStockPcs'
  | 'leadsAtScale'
>;

export function applyFixedFinanceRules(config: CodFinanceConfig): CodFinanceConfig {
  const fallback: CodFinanceProductId = 'magnesium-sleep';
  const activeProductId =
    config.activeProductId && config.activeProductId in COD_PRODUCT_COSTS_USD
      ? config.activeProductId
      : fallback;
  return {
    ...config,
    activeProductId,
    ...FIXED_UAE_SERVICE_FEES,
    productCostPerUnitUsd: productCostUsd(activeProductId),
  };
}

export function pickFinanceVariables(config: CodFinanceConfig): CodFinanceVariablePatch {
  return {
    confirmationRate: config.confirmationRate,
    deliveryRate: config.deliveryRate,
    costPerLeadUsd: config.costPerLeadUsd,
    pcsPerOrder: config.pcsPerOrder,
    priceAovUsd: config.priceAovUsd,
    activeProductId: config.activeProductId,
    totalStockPcs: config.totalStockPcs,
    leadsAtScale: config.leadsAtScale,
  };
}

export function mergeFinanceVariablePatch(
  current: CodFinanceConfig,
  patch: Partial<CodFinanceVariablePatch>,
): CodFinanceConfig {
  return applyFixedFinanceRules({
    ...current,
    ...patch,
    country: 'UAE',
    currency: 'AED',
  });
}

export function aedFromUsd(usd: number, aedToUsd: number) {
  if (!aedToUsd) return 0;
  return usd / aedToUsd;
}

export function usdFromAed(aed: number, aedToUsd: number) {
  return aed * aedToUsd;
}
