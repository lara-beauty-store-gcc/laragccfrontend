'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Save } from 'lucide-react';

type CodFeesConfig = {
  leadEntryFeeUsd: number;
  confirmationFeeUsd: number;
  deliveredWarehouseFeeUsd: number;
  shippingFeePerConfirmedUsd: number;
  deliveredFeeUsd: number;
  codFeePercent: number;
  productCostPerUnitUsd: number;
  costPerLeadUsd: number;
};

function moneyUsd(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function pct(value: number) {
  return `${Math.round(value * 1000) / 10}%`;
}

function FeeInput({
  label,
  hint,
  value,
  onChange,
  step = '0.01',
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (value: number) => void;
  step?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">{label}</label>
      <p className="mb-2 text-[11px] text-gray-400">{hint}</p>
      <input
        type="number"
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-[#134E3A] focus:ring-2 focus:ring-[#134E3A]/10"
      />
    </div>
  );
}

export function CodFinancePanel({
  authHeaders,
}: {
  authHeaders: Record<string, string>;
  query: string;
}) {
  const [fees, setFees] = useState<CodFeesConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadFees() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/cod/finance', { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'fees_failed');
      setFees(data.fees);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'fees_failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFees();
  }, [authHeaders.Authorization]);

  async function saveFees() {
    if (!fees) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/cod/finance', {
        method: 'PATCH',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(fees),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'save_failed');
      setFees(data.fees);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'save_failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading && !fees) {
    return <div className="rounded-2xl bg-white p-8 text-center text-gray-400">Loading fees...</div>;
  }

  if (!fees) return null;

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-[#134E3A]" aria-hidden />
          <div>
            <h2 className="text-lg font-bold text-gray-900">COD Fees (UAE)</h2>
            <p className="text-sm text-gray-500">Service fees only — same structure as your Google Sheet.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <FeeInput
            label="Lead entry"
            hint="Per lead"
            value={fees.leadEntryFeeUsd}
            onChange={(v) => setFees({ ...fees, leadEntryFeeUsd: v })}
          />
          <FeeInput
            label="Confirmation"
            hint="Per confirmed order"
            value={fees.confirmationFeeUsd}
            onChange={(v) => setFees({ ...fees, confirmationFeeUsd: v })}
          />
          <FeeInput
            label="Warehouse"
            hint="Per delivered order"
            value={fees.deliveredWarehouseFeeUsd}
            onChange={(v) => setFees({ ...fees, deliveredWarehouseFeeUsd: v })}
          />
          <FeeInput
            label="Shipping"
            hint="Per confirmed order"
            value={fees.shippingFeePerConfirmedUsd}
            onChange={(v) => setFees({ ...fees, shippingFeePerConfirmedUsd: v })}
          />
          <FeeInput
            label="Delivery"
            hint="Per delivered order"
            value={fees.deliveredFeeUsd}
            onChange={(v) => setFees({ ...fees, deliveredFeeUsd: v })}
          />
          <FeeInput
            label="COD network"
            hint="Percent of COD collected (e.g. 0.05 = 5%)"
            value={fees.codFeePercent}
            onChange={(v) => setFees({ ...fees, codFeePercent: v })}
            step="0.001"
          />
          <FeeInput
            label="Product cost"
            hint="Per unit sold"
            value={fees.productCostPerUnitUsd}
            onChange={(v) => setFees({ ...fees, productCostPerUnitUsd: v })}
          />
          <FeeInput
            label="Cost per lead (ads)"
            hint="Ad spend per lead"
            value={fees.costPerLeadUsd}
            onChange={(v) => setFees({ ...fees, costPerLeadUsd: v })}
          />
        </div>

        <button
          type="button"
          onClick={() => void saveFees()}
          disabled={saving}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#134E3A] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          <Save className="h-4 w-4" aria-hidden />
          {saving ? 'Saving...' : 'Save fees'}
        </button>
      </section>

      <section className="rounded-2xl border border-[#134E3A]/15 bg-[#fcf8f2] p-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Current fee summary</h3>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <SummaryRow label="Lead entry" value={`${moneyUsd(fees.leadEntryFeeUsd)} / lead`} />
          <SummaryRow label="Confirmation" value={`${moneyUsd(fees.confirmationFeeUsd)} / confirmed`} />
          <SummaryRow label="Warehouse" value={`${moneyUsd(fees.deliveredWarehouseFeeUsd)} / delivered`} />
          <SummaryRow label="Shipping" value={`${moneyUsd(fees.shippingFeePerConfirmedUsd)} / confirmed`} />
          <SummaryRow label="Delivery" value={`${moneyUsd(fees.deliveredFeeUsd)} / delivered`} />
          <SummaryRow label="COD network" value={`${pct(fees.codFeePercent)} of collected COD`} />
          <SummaryRow label="Product cost" value={`${moneyUsd(fees.productCostPerUnitUsd)} / unit`} />
          <SummaryRow label="Ad CPL" value={`${moneyUsd(fees.costPerLeadUsd)} / lead`} />
        </div>
      </section>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/80 bg-white px-4 py-2.5">
      <span className="text-gray-600">{label}</span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}
