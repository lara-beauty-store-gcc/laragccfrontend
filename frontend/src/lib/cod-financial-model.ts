import type { CodFinanceConfig } from '@/lib/cod-finance-shared';

export type CodFinanceLive = {
  validClicks: number;
  orders: number;
  revenueAed: number;
  avgOrderValueAed: number;
  confirmationRateLive: number | null;
  deliveryRateLive: number | null;
};

export type CodFinanceProjection = {
  totalLeads: number;
  confirmed: number;
  delivered: number;
  returned: number;
  deliveredOverLeads: number;
  codCollectedUsd: number;
  invoiceCodNetworkUsd: number;
  costs: {
    leadEntryUsd: number;
    confirmationUsd: number;
    deliveredWarehouseUsd: number;
    shippingUsd: number;
    deliveredFeesUsd: number;
    codNetworkFeesUsd: number;
    serviceCodTotalUsd: number;
    productCostUsd: number;
    adSpendUsd: number;
    totalChargeUsd: number;
  };
  netProfitUsd: number;
  profitPerDeliveredUsd: number;
  profitPerLeadUsd: number;
  maxCostPerLeadUsd: number;
  roiPercent: number;
  remainingStockPcs: number;
  remainingStockValueUsd: number;
  profitWithoutStockUsd: number;
};

export type CodFinanceBreakeven = {
  breakevenDeliveryRate: number;
  breakevenConfirmationRate: number;
  maxAffordableCplUsd: number;
  currentProfitPerLeadUsd: number;
  isAboveBreakeven: boolean;
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function project(config: CodFinanceConfig, totalLeads: number): CodFinanceProjection {
  const confirmed = Math.round(totalLeads * config.confirmationRate);
  const delivered = Math.round(confirmed * config.deliveryRate);
  const returned = Math.max(0, confirmed - delivered);

  const codCollectedUsd = delivered * config.priceAovUsd;

  const unitsDelivered = delivered * config.pcsPerOrder;

  const leadEntryUsd = config.leadEntryFeeUsd * totalLeads;
  const confirmationUsd = config.confirmationFeeUsd * confirmed;
  const deliveredWarehouseUsd = config.deliveredWarehouseFeeUsd * delivered;
  const shippingUsd = config.shippingFeePerConfirmedUsd * confirmed;
  const deliveredFeesUsd = config.deliveredFeeUsd * delivered;
  const codNetworkFeesUsd = codCollectedUsd * config.codFeePercent;
  const serviceCodTotalUsd =
    leadEntryUsd + confirmationUsd + deliveredWarehouseUsd + shippingUsd + deliveredFeesUsd + codNetworkFeesUsd;

  const productCostUsd = config.productCostPerUnitUsd * unitsDelivered;
  const adSpendUsd = config.costPerLeadUsd * totalLeads;
  const totalChargeUsd = productCostUsd + adSpendUsd + serviceCodTotalUsd;
  const netProfitUsd = codCollectedUsd - totalChargeUsd;
  const invoiceCodNetworkUsd = codCollectedUsd - serviceCodTotalUsd;

  const remainingStockPcs = Math.max(0, config.totalStockPcs - unitsDelivered);
  const remainingStockValueUsd = remainingStockPcs * config.productCostPerUnitUsd;
  const profitWithoutStockUsd = netProfitUsd + remainingStockValueUsd;

  return {
    totalLeads,
    confirmed,
    delivered,
    returned,
    deliveredOverLeads: totalLeads > 0 ? round2((delivered / totalLeads) * 100) / 100 : 0,
    codCollectedUsd: round2(codCollectedUsd),
    invoiceCodNetworkUsd: round2(invoiceCodNetworkUsd),
    costs: {
      leadEntryUsd: round2(leadEntryUsd),
      confirmationUsd: round2(confirmationUsd),
      deliveredWarehouseUsd: round2(deliveredWarehouseUsd),
      shippingUsd: round2(shippingUsd),
      deliveredFeesUsd: round2(deliveredFeesUsd),
      codNetworkFeesUsd: round2(codNetworkFeesUsd),
      serviceCodTotalUsd: round2(serviceCodTotalUsd),
      productCostUsd: round2(productCostUsd),
      adSpendUsd: round2(adSpendUsd),
      totalChargeUsd: round2(totalChargeUsd),
    },
    netProfitUsd: round2(netProfitUsd),
    profitPerDeliveredUsd: delivered > 0 ? round2(netProfitUsd / delivered) : 0,
    profitPerLeadUsd: totalLeads > 0 ? round2(netProfitUsd / totalLeads) : 0,
    maxCostPerLeadUsd:
      totalLeads > 0 ? round2((codCollectedUsd - productCostUsd - serviceCodTotalUsd) / totalLeads) : 0,
    roiPercent: totalChargeUsd > 0 ? round2((netProfitUsd / totalChargeUsd) * 100) : 0,
    remainingStockPcs,
    remainingStockValueUsd: round2(remainingStockValueUsd),
    profitWithoutStockUsd: round2(profitWithoutStockUsd),
  };
}

function netProfitForRates(
  config: CodFinanceConfig,
  totalLeads: number,
  confirmationRate: number,
  deliveryRate: number,
  costPerLeadUsd = config.costPerLeadUsd,
) {
  const confirmed = Math.round(totalLeads * confirmationRate);
  const delivered = Math.round(confirmed * deliveryRate);
  const codCollectedUsd = delivered * config.priceAovUsd;
  const serviceCodTotalUsd =
    config.leadEntryFeeUsd * totalLeads +
    config.confirmationFeeUsd * confirmed +
    config.deliveredWarehouseFeeUsd * delivered +
    config.shippingFeePerConfirmedUsd * confirmed +
    config.deliveredFeeUsd * delivered +
    codCollectedUsd * config.codFeePercent;
  const productCostUsd = config.productCostPerUnitUsd * delivered * config.pcsPerOrder;
  const adSpendUsd = costPerLeadUsd * totalLeads;
  return codCollectedUsd - productCostUsd - adSpendUsd - serviceCodTotalUsd;
}

function solveBreakevenDeliveryRate(config: CodFinanceConfig, totalLeads: number) {
  let best = 1;
  for (let pct = 1; pct <= 100; pct += 1) {
    const rate = pct / 100;
    if (netProfitForRates(config, totalLeads, config.confirmationRate, rate) >= 0) {
      best = rate;
      break;
    }
  }
  return round2(best);
}

function solveBreakevenConfirmationRate(config: CodFinanceConfig, totalLeads: number) {
  let best = 1;
  for (let pct = 1; pct <= 100; pct += 1) {
    const rate = pct / 100;
    if (netProfitForRates(config, totalLeads, rate, config.deliveryRate) >= 0) {
      best = rate;
      break;
    }
  }
  return round2(best);
}

export function calculateCodProjection(config: CodFinanceConfig, totalLeads: number): CodFinanceProjection {
  return project(config, totalLeads);
}

export function buildCodFinanceModel(config: CodFinanceConfig, live?: Partial<CodFinanceLive>) {
  const liveLeads = live?.validClicks && live.validClicks > 0 ? live.validClicks : config.leadsAtScale;
  const liveProjection = project(config, liveLeads);
  const scaleProjection = project(config, config.leadsAtScale);

  const liveConfirmationRate =
    live?.validClicks && live.validClicks > 0 && live?.orders
      ? round2(live.orders / live.validClicks)
      : null;

  const liveAovUsd =
    live?.avgOrderValueAed && config.aedToUsd
      ? round2(live.avgOrderValueAed * config.aedToUsd)
      : config.priceAovUsd;

  const breakeven: CodFinanceBreakeven = {
    breakevenDeliveryRate: solveBreakevenDeliveryRate(config, liveLeads),
    breakevenConfirmationRate: solveBreakevenConfirmationRate(config, liveLeads),
    maxAffordableCplUsd: liveProjection.maxCostPerLeadUsd,
    currentProfitPerLeadUsd: liveProjection.profitPerLeadUsd,
    isAboveBreakeven: liveProjection.netProfitUsd >= 0,
  };

  const deliveredCount = liveProjection.delivered || scaleProjection.delivered;
  const netPerDeliveredExAdsUsd =
    deliveredCount > 0
      ? round2(
          (liveProjection.codCollectedUsd -
            liveProjection.costs.serviceCodTotalUsd -
            liveProjection.costs.productCostUsd) /
            deliveredCount,
        )
      : 0;

  return {
    config,
    live: {
      validClicks: live?.validClicks ?? 0,
      orders: live?.orders ?? 0,
      revenueAed: live?.revenueAed ?? 0,
      avgOrderValueAed: live?.avgOrderValueAed ?? 0,
      confirmationRateLive: liveConfirmationRate,
      liveAovUsd,
    },
    breakeven,
    liveProjection,
    scaleProjection,
    summary: {
      aovAed: round2(config.priceAovUsd / config.aedToUsd),
      aovUsd: config.priceAovUsd,
      avgPiecesPerOrder: config.pcsPerOrder,
      netPerDeliveredExAdsUsd,
    },
  };
}

export type CodFinanceModel = ReturnType<typeof buildCodFinanceModel>;
