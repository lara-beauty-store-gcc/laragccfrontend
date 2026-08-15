'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Calculator, RefreshCw, Save, TrendingDown, TrendingUp } from 'lucide-react';
import type { CodFinanceConfig } from '@/lib/cod-finance-config';
import { buildCodFinanceModel } from '@/lib/cod-financial-model';

type LiveStats = {
  validClicks: number;
  orders: number;
  revenueAed: number;
  avgOrderValueAed: number;
  confirmationRateLive: number | null;
  liveAovUsd: number;
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

function NumberField({
  label,
  hint,
  suffix,
  value,
  onChange,
  step = '0.01',
}: {
  label: string;
  hint?: string;
  suffix?: string;
  value: number;
  onChange: (value: number) => void;
  step?: string;
}) {
  return (
    <label className="block rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-500">{label}</span>
      {hint ? <span className="mb-2 block text-[11px] text-gray-400">{hint}</span> : null}
      <div className="flex items-center gap-2">
        <input
          type="number"
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-[#134E3A] focus:ring-2 focus:ring-[#134E3A]/10"
        />
        {suffix ? <span className="shrink-0 text-xs font-bold text-gray-400">{suffix}</span> : null}
      </div>
    </label>
  );
}

function PercentField({
  label,
  hint,
  value,
  onChange,
  liveHint,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  liveHint?: string | null;
}) {
  const display = Math.round(value * 1000) / 10;

  return (
    <label className="block rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-500">{label}</span>
      {hint ? <span className="mb-2 block text-[11px] text-gray-400">{hint}</span> : null}
      {liveHint ? <span className="mb-2 block text-[11px] font-medium text-emerald-700">{liveHint}</span> : null}
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={100}
          step="0.1"
          value={Number.isFinite(display) ? display : 0}
          onChange={(e) => onChange(clampRate(Number(e.target.value) / 100))}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-[#134E3A] focus:ring-2 focus:ring-[#134E3A]/10"
        />
        <span className="shrink-0 text-xs font-bold text-gray-400">%</span>
      </div>
    </label>
  );
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
  const [useLiveLeads, setUseLiveLeads] = useState(true);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'finance_failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFinance();
  }, [query, authHeaders.Authorization]);

  const leadsUsed =
    useLiveLeads && live && live.validClicks > 0 ? live.validClicks : draft?.leadsAtScale ?? 0;

  const model = useMemo(() => {
    if (!draft) return null;
    const leads =
      useLiveLeads && live && live.validClicks > 0 ? live.validClicks : draft.leadsAtScale;
    return buildCodFinanceModel(
      { ...draft, leadsAtScale: leads },
      useLiveLeads
        ? live ?? undefined
        : { validClicks: 0, orders: 0, revenueAed: 0, avgOrderValueAed: 0 },
    );
  }, [draft, live, useLiveLeads]);

  const projection = model?.liveProjection;

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
      setDraft(data.config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'save_failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading && !draft) {
    return <div className="rounded-2xl bg-white p-10 text-center text-gray-400">Loading calculator...</div>;
  }

  if (!draft || !model || !projection) return null;

  const p = projection;
  const confirmed = p.confirmed;
  const delivered = p.delivered;

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#134E3A]/15 bg-[#134E3A]/5 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#134E3A] p-2.5 text-white">
            <Calculator className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">COD Finance Calculator</h2>
            <p className="text-sm text-gray-600">All amounts in USD · updates live when you edit any field</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadFinance()}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => void saveConfig()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#134E3A] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            <Save className="h-4 w-4" aria-hidden />
            {saving ? 'Saving...' : 'Save settings'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-gray-500">Volume & conversion</h3>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setUseLiveLeads(true)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                  useLiveLeads ? 'bg-[#134E3A] text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Live clicks ({live?.validClicks ?? 0})
              </button>
              <button
                type="button"
                onClick={() => setUseLiveLeads(false)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                  !useLiveLeads ? 'bg-[#134E3A] text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Manual leads
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <NumberField
                label="Leads"
                hint={useLiveLeads ? 'Using valid clicks from selected date range' : 'Scenario lead count'}
                value={useLiveLeads ? live?.validClicks ?? draft.leadsAtScale : draft.leadsAtScale}
                onChange={(v) => {
                  setUseLiveLeads(false);
                  setDraft({ ...draft, leadsAtScale: Math.max(0, Math.round(v)) });
                }}
                step="1"
              />
              <NumberField
                label="Cost per lead (ads)"
                suffix="USD"
                value={draft.costPerLeadUsd}
                onChange={(v) => setDraft({ ...draft, costPerLeadUsd: v })}
              />
              <PercentField
                label="Confirmation rate"
                hint={`→ ${confirmed} confirmed orders`}
                liveHint={
                  live?.confirmationRateLive
                    ? `Live dashboard: ${pctDisplay(live.confirmationRateLive)}`
                    : null
                }
                value={draft.confirmationRate}
                onChange={(v) => setDraft({ ...draft, confirmationRate: v })}
              />
              <PercentField
                label="Delivery rate"
                hint={`→ ${delivered} delivered (${pctDisplay(draft.deliveryRate)} of confirmed)`}
                value={draft.deliveryRate}
                onChange={(v) => setDraft({ ...draft, deliveryRate: v })}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-gray-500">Revenue & product</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <NumberField
                label="Average order value"
                suffix="USD"
                hint={
                  live?.avgOrderValueAed
                    ? `Live store AOV: ${live.avgOrderValueAed.toFixed(0)} AED (~${moneyUsd(model.live.liveAovUsd)})`
                    : undefined
                }
                value={draft.priceAovUsd}
                onChange={(v) => setDraft({ ...draft, priceAovUsd: v })}
              />
              <NumberField
                label="Product cost"
                suffix="USD / unit"
                value={draft.productCostPerUnitUsd}
                onChange={(v) => setDraft({ ...draft, productCostPerUnitUsd: v })}
              />
              <NumberField
                label="Stock on hand"
                suffix="pcs"
                value={draft.totalStockPcs}
                onChange={(v) => setDraft({ ...draft, totalStockPcs: Math.max(0, Math.round(v)) })}
                step="1"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-gray-500">Service fees (USD)</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <NumberField
                label="Lead entry"
                suffix="/ lead"
                value={draft.leadEntryFeeUsd}
                onChange={(v) => setDraft({ ...draft, leadEntryFeeUsd: v })}
              />
              <NumberField
                label="Confirmation"
                suffix="/ confirmed"
                value={draft.confirmationFeeUsd}
                onChange={(v) => setDraft({ ...draft, confirmationFeeUsd: v })}
              />
              <NumberField
                label="Warehouse"
                suffix="/ delivered"
                value={draft.deliveredWarehouseFeeUsd}
                onChange={(v) => setDraft({ ...draft, deliveredWarehouseFeeUsd: v })}
              />
              <NumberField
                label="Shipping"
                suffix="/ confirmed"
                value={draft.shippingFeePerConfirmedUsd}
                onChange={(v) => setDraft({ ...draft, shippingFeePerConfirmedUsd: v })}
              />
              <NumberField
                label="Delivery"
                suffix="/ delivered"
                value={draft.deliveredFeeUsd}
                onChange={(v) => setDraft({ ...draft, deliveredFeeUsd: v })}
              />
              <PercentField
                label="COD network fee"
                hint={`→ ${moneyUsd(p.costs.codNetworkFeesUsd)} on ${moneyUsd(p.codCollectedUsd)} collected`}
                value={draft.codFeePercent}
                onChange={(v) => setDraft({ ...draft, codFeePercent: v })}
              />
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-gray-500">Order funnel</h3>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <FunnelStep label="Leads" value={String(leadsUsed)} />
              <ArrowRight className="h-4 w-4 text-gray-300" aria-hidden />
              <FunnelStep label={`Confirmed (${pctDisplay(draft.confirmationRate)})`} value={String(confirmed)} />
              <ArrowRight className="h-4 w-4 text-gray-300" aria-hidden />
              <FunnelStep label={`Delivered (${pctDisplay(draft.deliveryRate)})`} value={String(delivered)} accent />
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Returned / cancelled: {p.returned} · Delivered / leads: {pctDisplay(p.deliveredOverLeads)}
            </p>
          </section>

          <section className="grid gap-3 sm:grid-cols-3">
            <KpiCard
              label="Net profit"
              value={moneyUsd(p.netProfitUsd)}
              positive={p.netProfitUsd >= 0}
            />
            <KpiCard label="ROI" value={`${p.roiPercent}%`} positive={p.roiPercent >= 0} />
            <KpiCard label="Profit / lead" value={moneyUsd(p.profitPerLeadUsd)} positive={p.profitPerLeadUsd >= 0} />
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-gray-500">P&L statement (USD)</h3>
            <div className="space-y-2 text-sm">
              <StatementLine label="COD collected" formula={`${delivered} delivered × ${moneyUsd(draft.priceAovUsd)}`} value={moneyUsd(p.codCollectedUsd)} positive />
              <StatementLine label="Ad spend" formula={`${leadsUsed} leads × ${moneyUsd(draft.costPerLeadUsd)}`} value={moneyUsd(-p.costs.adSpendUsd)} />
              <StatementLine label="Product cost" formula={`${delivered} × ${moneyUsd(draft.productCostPerUnitUsd)}`} value={moneyUsd(-p.costs.productCostUsd)} />
              <StatementLine label="Lead entry fees" formula={`${leadsUsed} × ${moneyUsd(draft.leadEntryFeeUsd)}`} value={moneyUsd(-p.costs.leadEntryUsd)} />
              <StatementLine label="Confirmation fees" formula={`${confirmed} × ${moneyUsd(draft.confirmationFeeUsd)}`} value={moneyUsd(-p.costs.confirmationUsd)} />
              <StatementLine label="Warehouse fees" formula={`${delivered} × ${moneyUsd(draft.deliveredWarehouseFeeUsd)}`} value={moneyUsd(-p.costs.deliveredWarehouseUsd)} />
              <StatementLine label="Shipping fees" formula={`${confirmed} × ${moneyUsd(draft.shippingFeePerConfirmedUsd)}`} value={moneyUsd(-p.costs.shippingUsd)} />
              <StatementLine label="Delivery fees" formula={`${delivered} × ${moneyUsd(draft.deliveredFeeUsd)}`} value={moneyUsd(-p.costs.deliveredFeesUsd)} />
              <StatementLine label="COD network fees" formula={`${pctDisplay(draft.codFeePercent)} of ${moneyUsd(p.codCollectedUsd)}`} value={moneyUsd(-p.costs.codNetworkFeesUsd)} />
              <div className="border-t border-gray-100 pt-2">
                <StatementLine label="Total costs" value={moneyUsd(-p.costs.totalChargeUsd)} strong />
              </div>
              <div className={`rounded-xl px-4 py-3 ${p.netProfitUsd >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <StatementLine label="Net profit" value={moneyUsd(p.netProfitUsd)} strong positive={p.netProfitUsd >= 0} negative={p.netProfitUsd < 0} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#134E3A]/15 bg-[#fcf8f2] p-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">Breakeven thresholds</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <ThresholdChip
                label="Min confirmation"
                value={pctDisplay(model.breakeven.breakevenConfirmationRate)}
                ok={draft.confirmationRate >= model.breakeven.breakevenConfirmationRate}
              />
              <ThresholdChip
                label="Min delivery"
                value={pctDisplay(model.breakeven.breakevenDeliveryRate)}
                ok={draft.deliveryRate >= model.breakeven.breakevenDeliveryRate}
              />
              <ThresholdChip
                label="Max affordable CPL"
                value={moneyUsd(model.breakeven.maxAffordableCplUsd)}
                ok={draft.costPerLeadUsd <= model.breakeven.maxAffordableCplUsd}
              />
              <ThresholdChip
                label="Profit / delivered"
                value={moneyUsd(p.profitPerDeliveredUsd)}
                ok={p.profitPerDeliveredUsd >= 0}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function FunnelStep({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl px-4 py-3 ${accent ? 'bg-[#134E3A]/10' : 'bg-gray-50'}`}>
      <p className="text-[11px] font-bold uppercase text-gray-500">{label}</p>
      <p className="text-xl font-extrabold text-gray-900">{value}</p>
    </div>
  );
}

function KpiCard({ label, value, positive }: { label: string; value: string; positive: boolean }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[11px] font-bold uppercase text-gray-500">{label}</p>
      <p className={`mt-1 text-lg font-extrabold ${positive ? 'text-emerald-700' : 'text-red-600'}`}>{value}</p>
    </div>
  );
}

function StatementLine({
  label,
  formula,
  value,
  strong = false,
  positive = false,
  negative = false,
}: {
  label: string;
  formula?: string;
  value: string;
  strong?: boolean;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 ${strong ? 'font-bold' : ''}`}>
      <div>
        <p className="text-gray-700">{label}</p>
        {formula ? <p className="text-[11px] text-gray-400">{formula}</p> : null}
      </div>
      <span
        className={
          positive ? 'text-emerald-700' : negative || value.startsWith('-') ? 'text-red-600' : 'text-gray-900'
        }
      >
        {value}
      </span>
    </div>
  );
}

function ThresholdChip({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white bg-white px-4 py-3">
      <div>
        <p className="text-[11px] font-bold uppercase text-gray-500">{label}</p>
        <p className="font-bold text-gray-900">{value}</p>
      </div>
      {ok ? (
        <TrendingUp className="h-4 w-4 text-emerald-600" aria-hidden />
      ) : (
        <TrendingDown className="h-4 w-4 text-red-500" aria-hidden />
      )}
    </div>
  );
}
