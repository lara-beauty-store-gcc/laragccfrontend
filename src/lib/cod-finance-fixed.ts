export const FIXED_UAE_SERVICE_FEES = {
  leadEntryFeeUsd: 0.5,
  confirmationFeeUsd: 1,
  deliveredWarehouseFeeUsd: 2,
  shippingFeePerConfirmedUsd: 4.99,
  deliveredFeeUsd: 1,
  codFeePercent: 0.05,
} as const;

export const COD_PRODUCT_COSTS_USD = {
  'magnesium-sleep': { label: 'Magnesium', costUsd: 4.6 },
  'focus-clarity': { label: 'Focus', costUsd: 4.9 },
  'epimedium-energy': { label: 'Energy', costUsd: 4.9 },
} as const;

export type CodFinanceProductId = keyof typeof COD_PRODUCT_COSTS_USD;

export const COD_FINANCE_PRODUCT_OPTIONS = Object.entries(COD_PRODUCT_COSTS_USD).map(([id, product]) => ({
  id: id as CodFinanceProductId,
  label: product.label,
  costUsd: product.costUsd,
}));

export const FIXED_UAE_SERVICE_FEE_LINES = [
  { label: 'Lead entered', amountUsd: FIXED_UAE_SERVICE_FEES.leadEntryFeeUsd, unit: 'per lead' },
  { label: 'Lead confirmed', amountUsd: FIXED_UAE_SERVICE_FEES.confirmationFeeUsd, unit: 'per confirmed' },
  { label: 'Delivered (warehouse)', amountUsd: FIXED_UAE_SERVICE_FEES.deliveredWarehouseFeeUsd, unit: 'per delivered' },
  { label: 'Shipping', amountUsd: FIXED_UAE_SERVICE_FEES.shippingFeePerConfirmedUsd, unit: 'per confirmed' },
  { label: 'Delivery fee', amountUsd: FIXED_UAE_SERVICE_FEES.deliveredFeeUsd, unit: 'per delivered' },
  { label: 'COD network', amountUsd: FIXED_UAE_SERVICE_FEES.codFeePercent, unit: '5% of collected COD', isPercent: true },
] as const;

export function productCostUsd(productId: CodFinanceProductId) {
  return COD_PRODUCT_COSTS_USD[productId]?.costUsd ?? COD_PRODUCT_COSTS_USD['magnesium-sleep'].costUsd;
}
