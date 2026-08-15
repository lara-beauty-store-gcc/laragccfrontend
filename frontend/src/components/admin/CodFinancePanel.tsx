'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calculator, Save } from 'lucide-react';
import type { CodFinanceConfig } from '@/lib/cod-finance-config';
import type { CodFinanceProductId } from '@/lib/cod-finance-fixed';
import { productCostUsd } from '@/lib/cod-finance-fixed';
import { buildCodFinanceModel } from '@/lib/cod-financial-model';

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
      setDraft(data.config);
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

  const model = useMemo(() => {
    if (!draft) return null;
    const leads = live && live.validClicks > 0 ? live.validClicks : draft.leadsAtScale;
    return buildCodFinanceModel(
      { ...draft, leadsAtScale: leads },
      live && live.validClicks > 0
        ? live
        : { validClicks: 0, orders: 0, revenueAed: 0, avgOrderValueAed: 0 },
    );
  }, [draft, live]);

  const projection = model?.liveProjection;

  async function saveSettings(next: CodFinanceConfig) {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/cod/finance', {
        method: 'PATCH',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationRate: next.confirmationRate,
          deliveryRate: next.deliveryRate,
          costPerLeadUsd: next.costPerLeadUsd,
          pcsPerOrder: next.pcsPerOrder,
          priceAovUsd: next.priceAovUsd,
          activeProductId: next.activeProductId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'save_failed');
      setDraft(data.config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'save_failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading && !draft) {
    return <div className="rounded-2xl bg-white p-10 text-center text-gray-400">Loading...</div>;
  }

  if (!draft || !projection) return null;

  const leadsUsed = projection.totalLeads;
  const unitsUsed = projection.delivered * draft.pcsPerOrder;
  const activeProduct = products.find((p) => p.id === draft.activeProductId);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
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
            <p className="text-sm text-gray-500">
              {leadsUsed} valid clicks · all amounts USD · service charges fixed below
            </p>
          </div>
        </div>

        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <ProductField
            label="Product"
            value={draft.activeProductId}
            products={products}
            onChange={(id) =>
              setDraft({
                ...draft,
                activeProductId: id,
                productCostPerUnitUsd: productCostUsd(id),
              })
            }
          />
          <UsdField
            label="AOV"
            suffix="USD / order"
            hint={
              live?.avgOrderValueAed
                ? `Live store: ${live.avgOrderValueAed.toFixed(0)} AED (~${moneyUsd(model?.live.liveAovUsd ?? draft.priceAovUsd)})`
                : `${projection.delivered} delivered × ${moneyUsd(draft.priceAovUsd)} = ${moneyUsd(projection.codCollectedUsd)} COD`
            }
            value={draft.priceAovUsd}
            onChange={(v) => setDraft({ ...draft, priceAovUsd: v })}
          />
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <RateField
            label="Confirmation"
            value={draft.confirmationRate}
            liveHint={live?.confirmationRateLive ? `Live: ${pctDisplay(live.confirmationRateLive)}` : null}
            onChange={(v) => setDraft({ ...draft, confirmationRate: v })}
          />
          <RateField
            label="Delivery"
            value={draft.deliveryRate}
            onChange={(v) => setDraft({ ...draft, deliveryRate: v })}
          />
          <UsdField
            label="Ads cost"
            suffix="USD / lead"
            hint={`${leadsUsed} leads → ${moneyUsd(projection.costs.adSpendUsd)} ad spend`}
            value={draft.costPerLeadUsd}
            onChange={(v) => setDraft({ ...draft, costPerLeadUsd: v })}
          />
          <PcsField
            label="Pcs / order"
            hint={`${projection.delivered} delivered × ${draft.pcsPerOrder} pcs = ${unitsUsed} units · ${moneyUsd(draft.productCostPerUnitUsd)}/pc ${activeProduct?.label ?? ''}`}
            value={draft.pcsPerOrder}
            onChange={(v) => setDraft({ ...draft, pcsPerOrder: v })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            hint="Net profit + remaining stock value"
          />
        </div>

        <button
          type="button"
          onClick={() => void saveSettings(draft)}
          disabled={saving}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#134E3A] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          <Save className="h-4 w-4" aria-hidden />
          {saving ? 'Saving...' : 'Save settings'}
        </button>
      </section>

      <section className="rounded-2xl border border-[#134E3A]/15 bg-[#fcf8f2] p-5">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">Fixed service charges (always applied)</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {fixedFees.map((fee) => (
            <div key={fee.label} className="flex items-center justify-between gap-3 rounded-xl border border-white bg-white px-4 py-3 text-sm">
              <span className="text-gray-600">{fee.label}</span>
              <span className="font-bold text-gray-900">
                {fee.isPercent ? pctDisplay(fee.amountUsd) : moneyUsd(fee.amountUsd)} <span className="text-[10px] font-normal text-gray-400">{fee.unit}</span>
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="rounded-xl border border-white bg-white px-4 py-3 text-sm">
              <span className="text-gray-600">{product.label} cost</span>
              <span className="mt-1 block font-bold text-gray-900">{moneyUsd(product.costUsd)} / unit</span>
            </div>
          ))}
        </div>
      </section>
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
