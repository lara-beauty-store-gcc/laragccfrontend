import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { runtimeEnv } from '@/lib/runtime-env';

export type CodFinanceConfig = {
  country: 'UAE';
  currency: 'AED';
  aedToUsd: number;
  costPerLeadUsd: number;
  confirmationRate: number;
  deliveryRate: number;
  priceAovUsd: number;
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

export const DEFAULT_UAE_FINANCE_CONFIG: CodFinanceConfig = {
  country: 'UAE',
  currency: 'AED',
  aedToUsd: Number(runtimeEnv('COD_AED_TO_USD', '0.2725')) || 0.2725,
  costPerLeadUsd: Number(runtimeEnv('COD_COST_PER_LEAD_USD', '10')) || 10,
  confirmationRate: Number(runtimeEnv('COD_CONFIRMATION_RATE', '0.60')) || 0.6,
  deliveryRate: Number(runtimeEnv('COD_DELIVERY_RATE', '0.60')) || 0.6,
  priceAovUsd: Number(runtimeEnv('COD_PRICE_AOV_USD', '65')) || 65,
  productCostPerUnitUsd: Number(runtimeEnv('COD_PRODUCT_COST_USD', '9')) || 9,
  leadEntryFeeUsd: Number(runtimeEnv('COD_LEAD_ENTRY_FEE_USD', '0.50')) || 0.5,
  confirmationFeeUsd: Number(runtimeEnv('COD_CONFIRMATION_FEE_USD', '1.00')) || 1,
  deliveredWarehouseFeeUsd: Number(runtimeEnv('COD_DELIVERED_WAREHOUSE_FEE_USD', '2.00')) || 2,
  shippingFeePerConfirmedUsd: Number(runtimeEnv('COD_SHIPPING_FEE_USD', '4.99')) || 4.99,
  deliveredFeeUsd: Number(runtimeEnv('COD_DELIVERED_FEE_USD', '1.00')) || 1,
  codFeePercent: Number(runtimeEnv('COD_NETWORK_FEE_PERCENT', '0.05')) || 0.05,
  pcsPerOrder: Number(runtimeEnv('COD_PCS_PER_ORDER', '1')) || 1,
  totalStockPcs: Number(runtimeEnv('COD_TOTAL_STOCK_PCS', '100')) || 100,
  leadsAtScale: Number(runtimeEnv('COD_LEADS_AT_SCALE', '150')) || 150,
};

export async function readFinanceConfig(): Promise<CodFinanceConfig> {
  try {
    const raw = await readFile(CONFIG_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<CodFinanceConfig>;
    return { ...DEFAULT_UAE_FINANCE_CONFIG, ...parsed };
  } catch {
    return DEFAULT_UAE_FINANCE_CONFIG;
  }
}

export async function writeFinanceConfig(config: CodFinanceConfig) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
}

export function aedFromUsd(usd: number, aedToUsd: number) {
  if (!aedToUsd) return 0;
  return usd / aedToUsd;
}

export function usdFromAed(aed: number, aedToUsd: number) {
  return aed * aedToUsd;
}
