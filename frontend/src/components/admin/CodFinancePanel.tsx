'use client';

import { useEffect, useState } from 'react';
import { Calculator, Save, TrendingDown, TrendingUp } from 'lucide-react';

type FinanceModel = {
  config: {
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
    totalStockPcs: number;
    leadsAtScale: number;
  };
  live: {
    validClicks: number;
    orders: number;
    revenueAed: number;
    avgOrderValueAed: number;
    confirmationRateLive: number | null;
    liveAovUsd: number;
  };
  breakeven: {
    breakevenDeliveryRate: number;
    breakevenConfirmationRate: number;
    maxAffordableCplUsd: number;
    currentProfitPerLeadUsd: number;
    isAboveBreakeven: boolean;
  };
  liveProjection: Projection;
  scaleProjection: Projection;
  summary: {
    aovAed: number;
    aovUsd: number;
    avgPiecesPerOrder: number;
    netPerDeliveredExAdsUsd: number;
  };
};

type Projection = {
  totalLeads: number;
  confirmed: number;
  delivered: number;
  returned: number;
  deliveredOverLeads: number;
  codCollectedUsd: number;
  invoiceCodNetworkUsd: number;
  costs: {
    adSpendUsd: number;
    productCostUsd: number;
    serviceCodTotalUsd: number;
    leadEntryUsd: number;
    confirmationUsd: number;
    deliveredWarehouseUsd: number;
    shippingUsd: number;
    deliveredFeesUsd: number;
    codNetworkFeesUsd: number;
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

function moneyUsd(value: number) {
  const sign = value < 0 ? '-' : '';
  return `${sign}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function pct(value: number) {
  return `${Math.round(value * 1000) / 10}%`;
}

function InputRow({
  label,
  hint,
  value,
  onChange,
  step = '0.01',
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  step?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">{label}</label>
      {hint ? <p className="mb-1 text-[11px] text-gray-400">{hint}</p> : null}
      <input
        type="number"
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#134E3A] focus:ring-2 focus:ring-[#134E3A]/10"
      />
    </div>
  );
}

export function CodFinancePanel({
  authHeaders,
  query,
}: {
  authHeaders: Record<string, string>;
  query: string;
}) {
  const [model, setModel] = useState<FinanceModel | null>(null);
  const [draft, setDraft] = useState<FinanceModel['config'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadFinance() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/cod/finance?${query}`, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'finance_failed');
      setModel(data.model);
      setDraft(data.model.config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'finance_failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFinance();
  }, [query]);

  async function saveConfig() {
    if (!draft) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/cod/finance', {
        method: 'PATCH',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'save_failed');
      await loadFinance();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'save_failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading && !model) {
    return <div className="rounded-2xl bg-white p-8 text-center text-gray-400">Loading finance model...</div>;
  }

  if (!model || !draft) return null;

  const p = model.liveProjection;
  const s = model.scaleProjection;

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-[#134E3A]" aria-hidden />
              <h2 className="text-lg font-bold text-gray-900">Inputs & Assumptions (UAE)</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputRow
                label="Leads at scale"
                hint={`Live valid clicks: ${model.live.validClicks}`}
                value={draft.leadsAtScale}
                onChange={(v) => setDraft({ ...draft, leadsAtScale: v })}
                step="1"
              />
              <InputRow
                label="Cost per Lead (USD)"
                value={draft.costPerLeadUsd}
                onChange={(v) => setDraft({ ...draft, costPerLeadUsd: v })}
              />
              <InputRow
                label="Confirmation Rate"
                hint={model.live.confirmationRateLive ? `Live: ${pct(model.live.confirmationRateLive)}` : 'Sheet default 60%'}
                value={draft.confirmationRate}
                onChange={(v) => setDraft({ ...draft, confirmationRate: v })}
              />
              <InputRow
                label="Delivery Rate"
                value={draft.deliveryRate}
                onChange={(v) => setDraft({ ...draft, deliveryRate: v })}
              />
              <InputRow
                label="AOV (USD)"
                hint={`Live AOV: ${model.live.avgOrderValueAed.toFixed(0)} AED`}
                value={draft.priceAovUsd}
                onChange={(v) => setDraft({ ...draft, priceAovUsd: v })}
              />
              <InputRow
                label="AED → USD"
                hint="Default 1 AED = 0.2725 USD"
                value={draft.aedToUsd}
                onChange={(v) => setDraft({ ...draft, aedToUsd: v })}
              />
              <InputRow
                label="Product Cost / Unit (USD)"
                value={draft.productCostPerUnitUsd}
                onChange={(v) => setDraft({ ...draft, productCostPerUnitUsd: v })}
              />
              <InputRow
                label="Total Stock (pcs)"
                value={draft.totalStockPcs}
                onChange={(v) => setDraft({ ...draft, totalStockPcs: v })}
                step="1"
              />
            </div>
            <button
              type="button"
              onClick={() => void saveConfig()}
              disabled={saving}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#134E3A] px-4 py-2.5 text-sm font-bold text-white"
            >
              <Save className="h-4 w-4" aria-hidden />
              {saving ? 'Saving...' : 'Save assumptions'}
            </button>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Your COD Cost Structure (UAE)</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <CostChip label="Lead entry" value={moneyUsd(draft.leadEntryFeeUsd)} sub="Per lead" />
              <CostChip label="Confirmation" value={moneyUsd(draft.confirmationFeeUsd)} sub="Per confirmed order" />
              <CostChip label="Warehouse / delivered" value={moneyUsd(draft.deliveredWarehouseFeeUsd)} sub="Per delivered" />
              <CostChip label="Shipping" value={moneyUsd(draft.shippingFeePerConfirmedUsd)} sub="Per confirmed" />
              <CostChip label="Delivery fee" value={moneyUsd(draft.deliveredFeeUsd)} sub="Per delivered" />
              <CostChip label="COD network fee" value={pct(draft.codFeePercent)} sub="Of COD collected" />
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            <SummaryCard label="AOV (AED)" value={`${model.summary.aovAed.toFixed(0)} AED`} />
            <SummaryCard label="AOV (USD)" value={moneyUsd(model.summary.aovUsd)} />
            <SummaryCard label="Net / Delivered (ex-ads)" value={moneyUsd(model.summary.netPerDeliveredExAdsUsd)} accent />
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-[#fcf8f2] p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Breakeven Thresholds</h3>
            <div className="space-y-3">
              <ThresholdCard
                title="Current profit / lead"
                value={moneyUsd(model.breakeven.currentProfitPerLeadUsd)}
                ok={model.breakeven.currentProfitPerLeadUsd >= 0}
                note={model.breakeven.isAboveBreakeven ? 'Above breakeven at current rates' : 'Below breakeven'}
              />
              <ThresholdCard
                title="Max affordable CPL"
                value={moneyUsd(model.breakeven.maxAffordableCplUsd)}
                ok={draft.costPerLeadUsd <= model.breakeven.maxAffordableCplUsd}
                note={`Current CPL: ${moneyUsd(draft.costPerLeadUsd)}`}
              />
              <ThresholdCard
                title="Breakeven delivery rate"
                value={pct(model.breakeven.breakevenDeliveryRate)}
                ok={draft.deliveryRate >= model.breakeven.breakevenDeliveryRate}
                note={`Need ≥ ${pct(model.breakeven.breakevenDeliveryRate)} · Current: ${pct(draft.deliveryRate)}`}
              />
              <ThresholdCard
                title="Breakeven confirmation rate"
                value={pct(model.breakeven.breakevenConfirmationRate)}
                ok={draft.confirmationRate >= model.breakeven.breakevenConfirmationRate}
                note={`Need ≥ ${pct(model.breakeven.breakevenConfirmationRate)} · Current: ${pct(draft.confirmationRate)}`}
              />
            </div>
          </section>

          <PnLCard title={`Live P&L (${p.totalLeads} valid clicks)`} projection={p} />
          <PnLCard title={`Scale P&L (${s.totalLeads} leads — sheet model)`} projection={s} />
        </div>
      </div>
    </div>
  );
}

function CostChip({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <p className="text-xs font-bold uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-gray-900">{value}</p>
      <p className="text-[11px] text-gray-400">{sub}</p>
    </div>
  );
}

function SummaryCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${accent ? 'border-[#134E3A]/20 bg-[#134E3A]/5' : 'border-gray-100 bg-white'}`}>
      <p className="text-[11px] font-bold uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-gray-900">{value}</p>
    </div>
  );
}

function ThresholdCard({
  title,
  value,
  ok,
  note,
}: {
  title: string;
  value: string;
  ok: boolean;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-gray-500">{title}</p>
          <p className="mt-1 text-xl font-extrabold text-gray-900">{value}</p>
          <p className="mt-1 text-xs text-gray-500">{note}</p>
        </div>
        {ok ? (
          <TrendingUp className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
        ) : (
          <TrendingDown className="h-5 w-5 shrink-0 text-red-500" aria-hidden />
        )}
      </div>
    </div>
  );
}

function PnLCard({ title, projection: p }: { title: string; projection: Projection }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">{title}</h3>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl bg-gray-50 px-2 py-3">
          <p className="font-bold text-gray-900">{p.totalLeads}</p>
          <p className="text-gray-500">Leads</p>
        </div>
        <div className="rounded-xl bg-gray-50 px-2 py-3">
          <p className="font-bold text-gray-900">{p.confirmed}</p>
          <p className="text-gray-500">Confirmed</p>
        </div>
        <div className="rounded-xl bg-gray-50 px-2 py-3">
          <p className="font-bold text-gray-900">{p.delivered}</p>
          <p className="text-gray-500">Delivered</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <PnLLine label="COD Collected" value={moneyUsd(p.codCollectedUsd)} positive />
        <PnLLine label="Ad Spend" value={moneyUsd(-p.costs.adSpendUsd)} />
        <PnLLine label="Product Costs" value={moneyUsd(-p.costs.productCostUsd)} />
        <PnLLine label="Confirmation Fees" value={moneyUsd(-p.costs.confirmationUsd)} />
        <PnLLine label="Fulfillment / Warehouse" value={moneyUsd(-p.costs.deliveredWarehouseUsd)} />
        <PnLLine label="Shipping Fees" value={moneyUsd(-p.costs.shippingUsd)} />
        <PnLLine label="Delivery Fees" value={moneyUsd(-p.costs.deliveredFeesUsd)} />
        <PnLLine label="COD Network Fees" value={moneyUsd(-p.costs.codNetworkFeesUsd)} />
        <PnLLine label="Lead Entry Fees" value={moneyUsd(-p.costs.leadEntryUsd)} />
        <div className="border-t border-gray-100 pt-2">
          <PnLLine label="Total Costs" value={moneyUsd(-p.costs.totalChargeUsd)} strong />
        </div>
        <div className="rounded-xl bg-[#134E3A]/5 px-4 py-3">
          <PnLLine label="Net Profit" value={moneyUsd(p.netProfitUsd)} strong positive={p.netProfitUsd >= 0} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <MiniStat label="ROI" value={`${p.roiPercent}%`} />
        <MiniStat label="Per Lead" value={moneyUsd(p.profitPerLeadUsd)} />
        <MiniStat label="Per Delivered" value={moneyUsd(p.profitPerDeliveredUsd)} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500">
        <p>Invoice COD network: {moneyUsd(p.invoiceCodNetworkUsd)}</p>
        <p>Delivered / leads: {pct(p.deliveredOverLeads)}</p>
        <p>Remaining stock: {p.remainingStockPcs} pcs</p>
        <p>Profit w/ stock value: {moneyUsd(p.profitWithoutStockUsd)}</p>
      </div>
    </section>
  );
}

function PnLLine({
  label,
  value,
  strong = false,
  positive = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
  positive?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 ${strong ? 'font-bold' : ''}`}>
      <span className="text-gray-600">{label}</span>
      <span className={positive ? 'text-emerald-700' : value.startsWith('-') ? 'text-red-600' : 'text-gray-900'}>{value}</span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 px-2 py-3">
      <p className="font-bold text-gray-900">{value}</p>
      <p className="text-gray-500">{label}</p>
    </div>
  );
}
