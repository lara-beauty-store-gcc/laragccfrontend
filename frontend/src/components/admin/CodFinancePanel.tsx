'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Calculator, Save } from 'lucide-react';
import { applyFixedFinanceRules, type CodFinanceConfig } from '@/lib/cod-finance-shared';
import type { CodFinanceProductId } from '@/lib/cod-finance-fixed';
import { buildCodFinanceModel, type CodFinanceProjection } from '@/lib/cod-financial-model';

type LiveStats = {
  validClicks: number;
  orders: number;
  revenueAed: number;
  avgOrderValueAed: number;
  confirmationRateLive: number | null;
  liveAovUsd: number;
};

type ProductOption = {
  id: CodFinanceProductId;
  label: string;
  costUsd: number;
};

type FixedFeeLine = {
  label: string;
  amountUsd: number;
  unit: string;
  isPercent?: boolean;
};

function moneyUsd(value: number) {
  const sign = value < 0 ? '-' : '';
  return `${sign}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function pctDisplay(decimal: number) {
  return `${Math.round(decimal * 1000) / 10}%`;
}

function clampRate(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function patchDraft(current: CodFinanceConfig, patch: Partial<CodFinanceConfig>) {
  return applyFixedFinanceRules({ ...current, ...patch });
}

export function CodFinancePanel({
  authHeaders,
  query,
}: {
  authHeaders: Record<string, string>;
  query: string;
}) {
  const [draft, setDraft] = useState<CodFinanceConfig | null>(null);
  const [live, setLive] = useState<LiveStats | null>(null);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [fixedFees, setFixedFees] = useState<FixedFeeLine[]>([]);
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
      setDraft(applyFixedFinanceRules(data.config));
      setLive(data.live);
      setProducts(Array.isArray(data.products) ? data.products : []);
      setFixedFees(Array.isArray(data.fixedFees) ? data.fixedFees : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'finance_failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFinance();
  }, [query, authHeaders.Authorization]);

  const config = draft ? applyFixedFinanceRules(draft) : null;

  const model = useMemo(() => {
    if (!config) return null;
    const leads = live && live.validClicks > 0 ? live.validClicks : config.leadsAtScale;
    return buildCodFinanceModel(
      { ...config, leadsAtScale: leads },
      live && live.validClicks > 0
        ? live
        : { validClicks: 0, orders: 0, revenueAed: 0, avgOrderValueAed: 0 },
    );
  }, [config, live]);

  const projection = model?.liveProjection;

  async function saveSettings(next: CodFinanceConfig) {
    setSaving(true);
    setError('');
    try {
      const normalized = applyFixedFinanceRules(next);
      const res = await fetch('/api/admin/cod/finance', {
        method: 'PATCH',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationRate: normalized.confirmationRate,
          deliveryRate: normalized.deliveryRate,
          costPerLeadUsd: normalized.costPerLeadUsd,
          pcsPerOrder: normalized.pcsPerOrder,
          priceAovUsd: normalized.priceAovUsd,
          activeProductId: normalized.activeProductId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'save_failed');
      setDraft(applyFixedFinanceRules(data.config));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'save_failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading && !config) {
    return <div className="rounded-2xl bg-white p-10 text-center text-gray-400">Loading...</div>;
  }

  if (!config || !projection) return null;

  const activeProduct = products.find((p) => p.id === config.activeProductId);

  return (
    <div dir="ltr" className="mx-auto max-w-5xl space-y-6 text-left">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-[#134E3A] p-2.5 text-white">
            <Calculator className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Finance</h2>
            <p className="text-sm text-gray-500">All amounts USD · fixed service fees applied automatically</p>
          </div>
        </div>

        <FunnelBar projection={projection} confirmationRate={config.confirmationRate} deliveryRate={config.deliveryRate} />

        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <ProductField
            label="Product"
            value={config.activeProductId}
            products={products}
            onChange={(id) => setDraft((d) => (d ? patchDraft(d, { activeProductId: id }) : d))}
          />
          <UsdField
            label="AOV"
            suffix="USD / order"
            hint={`COD collected: ${projection.delivered} x ${moneyUsd(config.priceAovUsd)} = ${moneyUsd(projection.codCollectedUsd)}`}
            value={config.priceAovUsd}
            onChange={(v) => setDraft((d) => (d ? patchDraft(d, { priceAovUsd: v }) : d))}
          />
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <RateField
            label="Confirmation"
            value={config.confirmationRate}
            liveHint={live?.confirmationRateLive ? `Live: ${pctDisplay(live.confirmationRateLive)}` : null}
            onChange={(v) => setDraft((d) => (d ? patchDraft(d, { confirmationRate: v }) : d))}
          />
          <RateField
            label="Delivery"
            value={config.deliveryRate}
            onChange={(v) => setDraft((d) => (d ? patchDraft(d, { deliveryRate: v }) : d))}
          />
          <UsdField
            label="Ads cost"
            suffix="USD / lead"
            hint={`${projection.totalLeads} leads x ${moneyUsd(config.costPerLeadUsd)} = ${moneyUsd(projection.costs.adSpendUsd)}`}
            value={config.costPerLeadUsd}
            onChange={(v) => setDraft((d) => (d ? patchDraft(d, { costPerLeadUsd: v }) : d))}
          />
          <PcsField
            label="Pcs / order"
            hint={`${unitsLabel(projection, config)} x ${moneyUsd(config.productCostPerUnitUsd)} (${activeProduct?.label ?? 'product'})`}
            value={config.pcsPerOrder}
            onChange={(v) => setDraft((d) => (d ? patchDraft(d, { pcsPerOrder: v }) : d))}
          />
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ResultCard label="Ad spend" value={moneyUsd(projection.costs.adSpendUsd)} />
          <ResultCard label="Total cost" value={moneyUsd(projection.costs.totalChargeUsd)} />
          <ResultCard
            label="Net profit"
            value={moneyUsd(projection.netProfitUsd)}
            highlight={projection.netProfitUsd >= 0 ? 'positive' : 'negative'}
          />
          <ResultCard
            label="Total profit"
            value={moneyUsd(projection.profitWithoutStockUsd)}
            highlight={projection.profitWithoutStockUsd >= 0 ? 'positive' : 'negative'}
            hint={`Net + stock (${projection.remainingStockPcs} pcs)`}
          />
        </div>

        <CostBreakdown config={config} projection={projection} />

        <button
          type="button"
          onClick={() => void saveSettings(config)}
          disabled={saving}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#134E3A] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          <Save className="h-4 w-4" aria-hidden />
          {saving ? 'Saving...' : 'Save settings'}
        </button>
      </section>

      <section className="rounded-2xl border border-[#134E3A]/15 bg-[#fcf8f2] p-5">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">Fixed service charges</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {fixedFees.map((fee) => (
            <div key={fee.label} className="flex items-center justify-between gap-3 rounded-xl border border-white bg-white px-4 py-3 text-sm">
              <span className="text-gray-600">{fee.label}</span>
              <span className="font-bold text-gray-900">
                {fee.isPercent ? pctDisplay(fee.amountUsd) : moneyUsd(fee.amountUsd)}{' '}
                <span className="text-[10px] font-normal text-gray-400">{fee.unit}</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function unitsLabel(projection: CodFinanceProjection, config: CodFinanceConfig) {
  const units = projection.delivered * config.pcsPerOrder;
  return `${projection.delivered} delivered x ${config.pcsPerOrder} pcs = ${units} units`;
}

function FunnelBar({
  projection,
  confirmationRate,
  deliveryRate,
}: {
  projection: CodFinanceProjection;
  confirmationRate: number;
  deliveryRate: number;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm">
      <FunnelChip label="Leads" value={String(projection.totalLeads)} />
      <ArrowRight className="h-4 w-4 text-gray-300" aria-hidden />
      <FunnelChip label={`Confirmed (${pctDisplay(confirmationRate)})`} value={String(projection.confirmed)} />
      <ArrowRight className="h-4 w-4 text-gray-300" aria-hidden />
      <FunnelChip label={`Delivered (${pctDisplay(deliveryRate)})`} value={String(projection.delivered)} accent />
    </div>
  );
}

function FunnelChip({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl px-4 py-2 ${accent ? 'bg-[#134E3A]/10' : 'bg-white'}`}>
      <p className="text-[10px] font-bold uppercase text-gray-500">{label}</p>
      <p className="text-lg font-extrabold text-gray-900">{value}</p>
    </div>
  );
}

function CostBreakdown({ config, projection }: { config: CodFinanceConfig; projection: CodFinanceProjection }) {
  const p = projection;
  const c = p.costs;
  const units = p.delivered * config.pcsPerOrder;

  const lines = [
    { label: 'COD collected', formula: `${p.delivered} x ${moneyUsd(config.priceAovUsd)}`, value: p.codCollectedUsd, positive: true },
    { label: 'Ad spend', formula: `${p.totalLeads} x ${moneyUsd(config.costPerLeadUsd)}`, value: -c.adSpendUsd },
    { label: 'Product cost', formula: `${units} units x ${moneyUsd(config.productCostPerUnitUsd)}`, value: -c.productCostUsd },
    { label: 'Lead entry', formula: `${p.totalLeads} x ${moneyUsd(config.leadEntryFeeUsd)}`, value: -c.leadEntryUsd },
    { label: 'Confirmation', formula: `${p.confirmed} x ${moneyUsd(config.confirmationFeeUsd)}`, value: -c.confirmationUsd },
    { label: 'Warehouse', formula: `${p.delivered} x ${moneyUsd(config.deliveredWarehouseFeeUsd)}`, value: -c.deliveredWarehouseUsd },
    { label: 'Shipping', formula: `${p.confirmed} x ${moneyUsd(config.shippingFeePerConfirmedUsd)}`, value: -c.shippingUsd },
    { label: 'Delivery fee', formula: `${p.delivered} x ${moneyUsd(config.deliveredFeeUsd)}`, value: -c.deliveredFeesUsd },
    { label: 'COD network (5%)', formula: `${moneyUsd(p.codCollectedUsd)} x 5%`, value: -c.codNetworkFeesUsd },
  ];

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">Calculation breakdown</h3>
      <div className="space-y-2 text-sm">
        {lines.map((line) => (
          <div key={line.label} className="flex items-start justify-between gap-4 border-b border-gray-100 pb-2 last:border-0">
            <div>
              <p className="font-medium text-gray-800">{line.label}</p>
              <p className="text-[11px] text-gray-400">{line.formula}</p>
            </div>
            <span className={`shrink-0 font-bold ${line.positive ? 'text-emerald-700' : 'text-gray-900'}`}>
              {line.positive ? moneyUsd(line.value) : moneyUsd(line.value)}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-gray-200 pt-2 font-bold">
          <span>Total cost</span>
          <span>{moneyUsd(-c.totalChargeUsd)}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 font-bold text-emerald-800">
          <span>Net profit</span>
          <span>{moneyUsd(p.netProfitUsd)}</span>
        </div>
      </div>
    </div>
  );
}

function ProductField({
  label,
  value,
  products,
  onChange,
}: {
  label: string;
  value: CodFinanceProductId;
  products: ProductOption[];
  onChange: (value: CodFinanceProductId) => void;
}) {
  return (
    <label className="block rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as CodFinanceProductId)}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-lg font-bold text-gray-900 outline-none focus:border-[#134E3A] focus:ring-2 focus:ring-[#134E3A]/10"
      >
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.label} · {moneyUsd(product.costUsd)}/unit
          </option>
        ))}
      </select>
    </label>
  );
}

function PcsField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">{label}</span>
      {hint ? <span className="mb-2 block text-[11px] text-gray-400">{hint}</span> : null}
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          step="1"
          value={Number.isFinite(value) ? value : 1}
          onChange={(e) => onChange(Math.max(1, Math.round(Number(e.target.value))))}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-2xl font-extrabold text-gray-900 outline-none focus:border-[#134E3A] focus:ring-2 focus:ring-[#134E3A]/10"
        />
        <span className="text-lg font-bold text-gray-400">pcs</span>
      </div>
    </label>
  );
}

function UsdField({
  label,
  suffix,
  hint,
  value,
  onChange,
}: {
  label: string;
  suffix?: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">{label}</span>
      {hint ? <span className="mb-2 block text-[11px] text-gray-400">{hint}</span> : null}
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-gray-400">$</span>
        <input
          type="number"
          min={0}
          step="0.01"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-2xl font-extrabold text-gray-900 outline-none focus:border-[#134E3A] focus:ring-2 focus:ring-[#134E3A]/10"
        />
        {suffix ? <span className="shrink-0 text-[11px] font-bold text-gray-400">{suffix}</span> : null}
      </div>
    </label>
  );
}

function RateField({
  label,
  value,
  liveHint,
  onChange,
}: {
  label: string;
  value: number;
  liveHint?: string | null;
  onChange: (value: number) => void;
}) {
  const display = Math.round(value * 1000) / 10;

  return (
    <label className="block rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">{label}</span>
      {liveHint ? <span className="mb-2 block text-[11px] font-medium text-emerald-700">{liveHint}</span> : null}
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={100}
          step="0.1"
          value={Number.isFinite(display) ? display : 0}
          onChange={(e) => onChange(clampRate(Number(e.target.value) / 100))}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-2xl font-extrabold text-gray-900 outline-none focus:border-[#134E3A] focus:ring-2 focus:ring-[#134E3A]/10"
        />
        <span className="text-lg font-bold text-gray-400">%</span>
      </div>
    </label>
  );
}

function ResultCard({
  label,
  value,
  hint,
  highlight,
}: {
  label: string;
  value: string;
  hint?: string;
  highlight?: 'positive' | 'negative';
}) {
  const color =
    highlight === 'positive' ? 'text-emerald-700' : highlight === 'negative' ? 'text-red-600' : 'text-gray-900';

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 text-center">
      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-2 text-xl font-extrabold ${color}`}>{value}</p>
      {hint ? <p className="mt-1 text-[10px] text-gray-400">{hint}</p> : null}
    </div>
  );
}
