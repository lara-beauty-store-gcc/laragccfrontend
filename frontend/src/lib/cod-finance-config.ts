import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { runtimeEnv } from '@/lib/runtime-env';
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

const DATA_DIR = process.env.ORDERS_DATA_DIR || path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'cod-finance-config.json');

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

export const DEFAULT_UAE_FINANCE_CONFIG: CodFinanceConfig = applyFixedFinanceRules({
  country: 'UAE',
  currency: 'AED',
  aedToUsd: Number(runtimeEnv('COD_AED_TO_USD', '0.2725')) || 0.2725,
  costPerLeadUsd: Number(runtimeEnv('COD_COST_PER_LEAD_USD', '10')) || 10,
  confirmationRate: Number(runtimeEnv('COD_CONFIRMATION_RATE', '0.60')) || 0.6,
  deliveryRate: Number(runtimeEnv('COD_DELIVERY_RATE', '0.60')) || 0.6,
  priceAovUsd: Number(runtimeEnv('COD_PRICE_AOV_USD', '65')) || 65,
  activeProductId: 'magnesium-sleep',
  productCostPerUnitUsd: productCostUsd('magnesium-sleep'),
  leadEntryFeeUsd: FIXED_UAE_SERVICE_FEES.leadEntryFeeUsd,
  confirmationFeeUsd: FIXED_UAE_SERVICE_FEES.confirmationFeeUsd,
  deliveredWarehouseFeeUsd: FIXED_UAE_SERVICE_FEES.deliveredWarehouseFeeUsd,
  shippingFeePerConfirmedUsd: FIXED_UAE_SERVICE_FEES.shippingFeePerConfirmedUsd,
  deliveredFeeUsd: FIXED_UAE_SERVICE_FEES.deliveredFeeUsd,
  codFeePercent: FIXED_UAE_SERVICE_FEES.codFeePercent,
  pcsPerOrder: Number(runtimeEnv('COD_PCS_PER_ORDER', '1')) || 1,
  totalStockPcs: Number(runtimeEnv('COD_TOTAL_STOCK_PCS', '100')) || 100,
  leadsAtScale: Number(runtimeEnv('COD_LEADS_AT_SCALE', '150')) || 150,
});

export type CodFinanceVariablePatch = Pick<
  CodFinanceConfig,
  'confirmationRate' | 'deliveryRate' | 'costPerLeadUsd' | 'pcsPerOrder' | 'priceAovUsd' | 'activeProductId'
>;

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

export async function readFinanceConfig(): Promise<CodFinanceConfig> {
  try {
    const raw = await readFile(CONFIG_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<CodFinanceConfig>;
    return applyFixedFinanceRules({ ...DEFAULT_UAE_FINANCE_CONFIG, ...parsed });
  } catch {
    return DEFAULT_UAE_FINANCE_CONFIG;
  }
}

export async function writeFinanceConfig(config: CodFinanceConfig) {
  await mkdir(DATA_DIR, { recursive: true });
  const next = applyFixedFinanceRules(config);
  await writeFile(CONFIG_FILE, JSON.stringify(next, null, 2), 'utf8');
}

export function aedFromUsd(usd: number, aedToUsd: number) {
  if (!aedToUsd) return 0;
  return usd / aedToUsd;
}

export function usdFromAed(aed: number, aedToUsd: number) {
  return aed * aedToUsd;
}
