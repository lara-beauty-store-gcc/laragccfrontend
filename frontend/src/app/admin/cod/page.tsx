'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Calculator,
  Calendar,
  Eye,
  Lock,
  Package,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  X,
} from 'lucide-react';
import { CodFinancePanel } from '@/components/admin/CodFinancePanel';

type MetricsResponse = {
  totals: {
    validClicks: number;
    orders: number;
    revenue: number;
    conversionRate: number;
    avgOrderValue: number;
    lineItems: number;
  };
  finance: {
    aedToUsd: number;
    confirmationRate: number;
    deliveryRate: number;
    revenueUsd: number;
    avgOrderValueUsd: number;
    totalCostUsd: number;
    netProfitUsd: number;
    totalProfitUsd: number;
    codCollectedUsd: number;
  };
  byDay: Array<{ date: string; clicks: number; orders: number; revenue: number }>;
  topSlugs: Array<{ slug: string; clicks: number; orders: number; conversionRate: number }>;
};

type OrderBatch = {
  batchKey: string;
  createdAt: string;
  customerName: string;
  phone: string;
  country: string;
  currency: string;
  area: string;
  sourceUrl: string;
  redirectSlug: string | null;
  clientIp?: string;
  geoCountry?: string | null;
  isVpn?: boolean;
  isValidGeo?: boolean;
  geoReason?: string;
  sheetSynced: boolean;
  orderIds: string[];
  items: Array<{
    orderId: string;
    product: string;
    url: string;
    sku: string;
    quantity: number;
    totalPrice: number;
  }>;
  totalPrice: number;
  itemCount: number;
};

type ClickEvent = {
  id: string;
  slug: string;
  pathPrefix: string;
  createdAt: string;
  ip: string;
  country: string | null;
  isValid: boolean;
  geoReason: string;
};

const AUTH_KEY = 'lara_cod_admin_basic';

function defaultFromDate() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatUsd(value: number) {
  const sign = value < 0 ? '-' : '';
  return `${sign}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatPct(decimal: number) {
  return `${Math.round(decimal * 1000) / 10}%`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Dubai',
  }).format(new Date(value));
}

export default function CodAdminDashboardPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [auth, setAuth] = useState('');
  const [tab, setTab] = useState<'overview' | 'finance' | 'orders' | 'clicks'>('overview');
  const [from, setFrom] = useState(defaultFromDate());
  const [to, setTo] = useState(todayDate());
  const [slugFilter, setSlugFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [orders, setOrders] = useState<OrderBatch[]>([]);
  const [clicks, setClicks] = useState<ClickEvent[]>([]);
  const [preview, setPreview] = useState<OrderBatch | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(AUTH_KEY);
    if (stored) setAuth(stored);
  }, []);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Basic ${auth}`,
    }),
    [auth],
  );

  const query = useMemo(() => {
    const params = new URLSearchParams({ from, to });
    if (slugFilter.trim()) params.set('slug', slugFilter.trim());
    return params.toString();
  }, [from, to, slugFilter]);

  const loadData = useCallback(async () => {
    if (!auth) return;
    setLoading(true);
    setError('');
    try {
      const [metricsRes, ordersRes, clicksRes] = await Promise.all([
        fetch(`/api/admin/cod/metrics?${query}`, { headers: authHeaders }),
        fetch(`/api/admin/cod/orders?${query}`, { headers: authHeaders }),
        fetch(`/api/admin/cod/clicks?${query}`, { headers: authHeaders }),
      ]);

      const metricsData = await metricsRes.json();
      const ordersData = await ordersRes.json();
      const clicksData = await clicksRes.json();

      if (!metricsRes.ok) throw new Error(metricsData.error || 'metrics_failed');
      if (!ordersRes.ok) throw new Error(ordersData.error || 'orders_failed');
      if (!clicksRes.ok) throw new Error(clicksData.error || 'clicks_failed');

      setMetrics(metricsData);
      setOrders(Array.isArray(ordersData.orders) ? ordersData.orders : []);
      setClicks(Array.isArray(clicksData.clicks) ? clicksData.clicks : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'load_failed');
    } finally {
      setLoading(false);
    }
  }, [auth, authHeaders, query]);

  useEffect(() => {
    if (auth) void loadData();
  }, [auth, loadData]);

  function login(e: React.FormEvent) {
    e.preventDefault();
    const encoded = btoa(`${username.trim()}:${password}`);
    sessionStorage.setItem(AUTH_KEY, encoded);
    setAuth(encoded);
  }

  function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    setAuth('');
    setUsername('');
    setPassword('');
    setMetrics(null);
    setOrders([]);
    setClicks([]);
  }

  if (!auth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#101820] px-4">
        <form onSubmit={login} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#134E3A]/10">
              <Lock className="h-7 w-7 text-[#134E3A]" aria-hidden />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">COD Admin</h1>
            <p className="mt-2 text-sm text-gray-500">Login with backend env username & password</p>
          </div>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-3 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#134E3A]"
            placeholder="Username"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#134E3A]"
            placeholder="Password"
            required
          />
          <button type="submit" className="w-full rounded-xl bg-[#134E3A] px-4 py-3 text-sm font-bold text-white">
            Sign in
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#134E3A]">Lara Beauty</p>
            <h1 className="text-2xl font-bold text-gray-900">COD Admin Dashboard</h1>
            <p className="text-xs text-gray-500">All financial metrics shown in USD</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void loadData()}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden />
              Refresh
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-gray-500">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-gray-500">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 block text-xs font-bold uppercase text-gray-500">Slug filter</label>
            <input
              value={slugFilter}
              onChange={(e) => setSlugFilter(e.target.value)}
              placeholder="tiktok, killer..."
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <p className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden />
            Metrics count valid geo clicks only (non-VPN allowed countries)
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="mb-6 flex flex-wrap gap-2">
          {(['overview', 'finance', 'orders', 'clicks'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold capitalize ${
                tab === item ? 'bg-[#134E3A] text-white' : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {item === 'finance' ? <Calculator className="h-4 w-4" aria-hidden /> : null}
              {item === 'finance' ? 'Finance' : item}
            </button>
          ))}
        </div>

        {tab === 'finance' ? <CodFinancePanel authHeaders={authHeaders} query={query} /> : null}

        {tab === 'overview' && metrics ? (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <MetricCard icon={TrendingUp} label="Valid clicks" value={String(metrics.totals.validClicks)} />
              <MetricCard icon={ShoppingBag} label="Orders" value={String(metrics.totals.orders)} />
              <MetricCard icon={Package} label="Revenue" value={formatUsd(metrics.finance.revenueUsd)} />
              <MetricCard icon={BarChart3} label="Conversion" value={`${metrics.totals.conversionRate}%`} />
              <MetricCard icon={Calendar} label="AOV" value={formatUsd(metrics.finance.avgOrderValueUsd)} />
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <MetricCard icon={BarChart3} label="Confirmation" value={formatPct(metrics.finance.confirmationRate)} />
              <MetricCard icon={BarChart3} label="Delivery" value={formatPct(metrics.finance.deliveryRate)} />
              <MetricCard icon={Package} label="Total cost" value={formatUsd(metrics.finance.totalCostUsd)} />
              <MetricCard
                icon={TrendingUp}
                label="Net profit"
                value={formatUsd(metrics.finance.netProfitUsd)}
                accent={metrics.finance.netProfitUsd >= 0 ? 'positive' : 'negative'}
              />
              <MetricCard
                icon={TrendingUp}
                label="Total profit"
                value={formatUsd(metrics.finance.totalProfitUsd)}
                accent={metrics.finance.totalProfitUsd >= 0 ? 'positive' : 'negative'}
              />
            </div>

            <div className="mb-6 grid gap-4 lg:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4 font-semibold">Daily performance (USD)</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">Clicks</th>
                        <th className="px-5 py-3">Orders</th>
                        <th className="px-5 py-3">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.byDay.map((row) => (
                        <tr key={row.date} className="border-t border-gray-100">
                          <td className="px-5 py-3">{row.date}</td>
                          <td className="px-5 py-3">{row.clicks}</td>
                          <td className="px-5 py-3">{row.orders}</td>
                          <td className="px-5 py-3">
                            {formatUsd(row.revenue * metrics.finance.aedToUsd)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4 font-semibold">Top slugs</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-5 py-3">Slug</th>
                        <th className="px-5 py-3">Clicks</th>
                        <th className="px-5 py-3">Orders</th>
                        <th className="px-5 py-3">CR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.topSlugs.slice(0, 10).map((row) => (
                        <tr key={row.slug} className="border-t border-gray-100">
                          <td className="px-5 py-3 font-mono">{row.slug}</td>
                          <td className="px-5 py-3">{row.clicks}</td>
                          <td className="px-5 py-3">{row.orders}</td>
                          <td className="px-5 py-3">{Math.round(row.conversionRate * 100) / 100}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {tab === 'orders' ? (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Phone</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Slug</th>
                    <th className="px-5 py-3">Geo</th>
                    <th className="px-5 py-3">Sheet</th>
                    <th className="px-5 py-3">Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.batchKey} className="border-t border-gray-100 hover:bg-gray-50/70">
                      <td className="px-5 py-4 whitespace-nowrap">{formatDateTime(order.createdAt)}</td>
                      <td className="px-5 py-4 font-semibold">{order.customerName}</td>
                      <td className="px-5 py-4 font-mono text-xs">{order.phone}</td>
                      <td className="px-5 py-4 font-bold">{formatUsd(order.totalPrice * (metrics?.finance.aedToUsd ?? 0.2725))}</td>
                      <td className="px-5 py-4 font-mono text-xs">{order.redirectSlug || 'direct'}</td>
                      <td className="px-5 py-4">
                        <GeoBadge country={order.geoCountry} isVpn={order.isVpn} isValid={order.isValidGeo} />
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-[11px] font-bold ${
                            order.sheetSynced ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {order.sheetSynced ? 'Synced' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => setPreview(order)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold"
                        >
                          <Eye className="h-3.5 w-3.5" aria-hidden />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === 'clicks' ? (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Time</th>
                    <th className="px-5 py-3">Slug</th>
                    <th className="px-5 py-3">Path</th>
                    <th className="px-5 py-3">IP</th>
                    <th className="px-5 py-3">Country</th>
                    <th className="px-5 py-3">Valid</th>
                  </tr>
                </thead>
                <tbody>
                  {clicks.map((click) => (
                    <tr key={click.id} className="border-t border-gray-100">
                      <td className="px-5 py-3 whitespace-nowrap">{formatDateTime(click.createdAt)}</td>
                      <td className="px-5 py-3 font-mono">{click.slug}</td>
                      <td className="px-5 py-3 font-mono text-xs">{click.pathPrefix}</td>
                      <td className="px-5 py-3 font-mono text-xs">{click.ip}</td>
                      <td className="px-5 py-3">{click.country || '—'}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-[11px] font-bold ${
                            click.isValid ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {click.isValid ? 'Yes' : click.geoReason}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>

      {preview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Order preview</p>
                <h2 className="text-xl font-bold text-gray-900">{preview.customerName}</h2>
              </div>
              <button type="button" onClick={() => setPreview(null)} className="rounded-lg p-2 hover:bg-gray-100">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
              <Info label="Order IDs" value={preview.orderIds.join(', ')} mono />
              <Info label="Date" value={formatDateTime(preview.createdAt)} />
              <Info label="Phone" value={preview.phone} mono />
              <Info label="Area" value={preview.area || '—'} />
              <Info label="Country" value={preview.country} />
              <Info label="Total" value={formatUsd(preview.totalPrice * (metrics?.finance.aedToUsd ?? 0.2725))} />
              <Info label="Landing URL" value={preview.sourceUrl} mono />
              <Info label="Campaign slug" value={preview.redirectSlug || 'direct'} mono />
              <Info label="Client IP" value={preview.clientIp || '—'} mono />
              <Info
                label="Geo"
                value={`${preview.geoCountry || '—'} · ${preview.isValidGeo ? 'valid' : preview.geoReason || 'unknown'}`}
              />
            </div>

            <div className="border-t border-gray-100 px-6 py-5">
              <p className="mb-3 text-sm font-bold text-gray-900">Line items</p>
              <div className="space-y-3">
                {preview.items.map((item) => (
                  <div key={item.orderId} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{item.product}</p>
                        <p className="mt-1 font-mono text-xs text-gray-500">{item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatUsd(item.totalPrice * (metrics?.finance.aedToUsd ?? 0.2725))}</p>
                        <p className="text-xs text-gray-500">Qty {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 px-6 py-4 text-right">
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="rounded-xl bg-[#134E3A] px-5 py-2.5 text-sm font-bold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  accent?: 'positive' | 'negative';
}) {
  const valueColor =
    accent === 'positive' ? 'text-emerald-700' : accent === 'negative' ? 'text-red-600' : 'text-gray-900';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#134E3A]/10">
        <Icon className="h-5 w-5 text-[#134E3A]" aria-hidden />
      </div>
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${valueColor}`}>{value}</p>
    </div>
  );
}

function GeoBadge({
  country,
  isVpn,
  isValid,
}: {
  country?: string | null;
  isVpn?: boolean;
  isValid?: boolean;
}) {
  if (isValid) {
    return <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">{country || 'OK'}</span>;
  }
  if (isVpn) {
    return <span className="rounded-full bg-red-50 px-2 py-1 text-[11px] font-bold text-red-700">VPN</span>;
  }
  return <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">{country || 'Unknown'}</span>;
}

function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
      <p className={`mt-1 text-sm text-gray-900 ${mono ? 'break-all font-mono text-xs' : ''}`}>{value}</p>
    </div>
  );
}
