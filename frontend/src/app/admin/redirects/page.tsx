'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Copy, Link2, Plus, RefreshCw, Trash2 } from 'lucide-react';

type RedirectRow = {
  slug: string;
  destination: string;
  label: string;
  clicks: number;
  active: boolean;
  shortUrl: string;
  updatedAt: string;
};

const SECRET_KEY = 'lara_redirect_admin_secret';

export default function RedirectAdminPage() {
  const [secret, setSecret] = useState('');
  const [savedSecret, setSavedSecret] = useState('');
  const [redirects, setRedirects] = useState<RedirectRow[]>([]);
  const [baseUrl, setBaseUrl] = useState('https://larabeauty.store');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slug, setSlug] = useState('');
  const [destination, setDestination] = useState('/products/magnesium-sleep');
  const [label, setLabel] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem(SECRET_KEY);
    if (stored) {
      setSavedSecret(stored);
      setSecret(stored);
    }
  }, []);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${savedSecret}`,
      'Content-Type': 'application/json',
    }),
    [savedSecret],
  );

  const loadRedirects = useCallback(async () => {
    if (!savedSecret) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/redirects', { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'load_failed');
      setRedirects(Array.isArray(data.redirects) ? data.redirects : []);
      if (data.baseUrl) setBaseUrl(String(data.baseUrl));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'load_failed');
    } finally {
      setLoading(false);
    }
  }, [authHeaders, savedSecret]);

  useEffect(() => {
    if (savedSecret) void loadRedirects();
  }, [savedSecret, loadRedirects]);

  function saveSecret(e: React.FormEvent) {
    e.preventDefault();
    sessionStorage.setItem(SECRET_KEY, secret.trim());
    setSavedSecret(secret.trim());
  }

  function logout() {
    sessionStorage.removeItem(SECRET_KEY);
    setSavedSecret('');
    setSecret('');
    setRedirects([]);
  }

  async function createRedirect(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/admin/redirects', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ slug, destination, label: label || slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'create_failed');
      setSlug('');
      setLabel('');
      await loadRedirects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'create_failed');
    }
  }

  async function toggleActive(row: RedirectRow) {
    setError('');
    try {
      const res = await fetch(`/api/admin/redirects/${encodeURIComponent(row.slug)}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ active: !row.active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'update_failed');
      await loadRedirects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'update_failed');
    }
  }

  async function removeRedirect(row: RedirectRow) {
    if (!confirm(`تحذف الرابط /r/${row.slug} ؟`)) return;
    setError('');
    try {
      const res = await fetch(`/api/admin/redirects/${encodeURIComponent(row.slug)}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'delete_failed');
      await loadRedirects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'delete_failed');
    }
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setError('copy_failed');
    }
  }

  if (!savedSecret) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-12">
        <form onSubmit={saveSecret} className="w-full rounded-3xl border border-border bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <Link2 className="h-5 w-5" aria-hidden />
            <h1 className="font-arabic text-lg font-extrabold">Redirect Admin</h1>
          </div>
          <p className="mb-4 text-sm leading-relaxed text-muted">
            أدخلي secret admin باش تديري روابط `/r/tiktok` و `/r/snap` للإعلانات.
          </p>
          <label className="mb-2 block text-sm font-semibold text-foreground">Admin Secret</label>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="mb-4 w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none ring-primary focus:ring-2"
            placeholder="نفس SHEETS_WEBHOOK_SECRET"
            required
          />
          <button
            type="submit"
            className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:opacity-95"
          >
            دخول
          </button>
          <p className="mt-4 text-xs text-muted">
            EasyPanel: `REDIRECT_ADMIN_SECRET` أو `SHEETS_WEBHOOK_SECRET`
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-arabic text-2xl font-extrabold text-primary">Redirect Dashboard</h1>
          <p className="mt-1 text-sm text-muted">روابط قصيرة للإعلانات: {baseUrl}/r/slug</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadRedirects()}
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden />
            تحديث
          </button>
          <button
            type="button"
            onClick={logout}
            className="rounded-2xl border border-border bg-white px-4 py-2 text-sm font-semibold text-muted"
          >
            خروج
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form
        onSubmit={createRedirect}
        className="mb-6 grid gap-3 rounded-3xl border border-border bg-white p-5 shadow-card sm:grid-cols-2"
      >
        <div>
          <label className="mb-1 block text-xs font-bold text-muted">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none ring-primary focus:ring-2"
            placeholder="tiktok"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-muted">Label</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none ring-primary focus:ring-2"
            placeholder="TikTok Ads"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-bold text-muted">Destination</label>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none ring-primary focus:ring-2"
            placeholder="/products/magnesium-sleep"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white"
          >
            <Plus className="h-4 w-4" aria-hidden />
            إضافة redirect
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-surface-rose text-right">
              <tr>
                <th className="px-4 py-3 font-arabic font-bold">الرابط</th>
                <th className="px-4 py-3 font-arabic font-bold">الوجهة</th>
                <th className="px-4 py-3 font-arabic font-bold">Clicks</th>
                <th className="px-4 py-3 font-arabic font-bold">الحالة</th>
                <th className="px-4 py-3 font-arabic font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {redirects.map((row) => (
                <tr key={row.slug} className="border-t border-border">
                  <td className="px-4 py-4 align-top">
                    <p className="font-semibold text-foreground">{row.label}</p>
                    <p className="mt-1 font-mono text-xs text-primary">{row.shortUrl}</p>
                    <p className="mt-1 text-xs text-muted">/r/{row.slug}</p>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <p className="break-all font-mono text-xs text-muted">{row.destination}</p>
                  </td>
                  <td className="px-4 py-4 align-top font-bold text-foreground">{row.clicks}</td>
                  <td className="px-4 py-4 align-top">
                    <button
                      type="button"
                      onClick={() => void toggleActive(row)}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        row.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {row.active ? 'Active' : 'Off'}
                    </button>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void copyText(row.shortUrl)}
                        className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold"
                      >
                        <Copy className="h-3.5 w-3.5" aria-hidden />
                        Copy
                      </button>
                      <a
                        href={row.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                        Test
                      </a>
                      <button
                        type="button"
                        onClick={() => void removeRedirect(row)}
                        className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface-rose px-4 py-3 text-xs leading-relaxed text-muted">
        <p className="font-bold text-foreground">روابط جاهزة للإعلانات:</p>
        <p className="mt-1">{baseUrl}/r/tiktok → Magnesium Sleep</p>
        <p>{baseUrl}/r/snap → Magnesium Sleep</p>
        <p>{baseUrl}/r/shop → Homepage products</p>
      </div>

      <Link href="/" className="mt-6 inline-block text-sm font-semibold text-primary">
        ← رجوع للمتجر
      </Link>
    </div>
  );
}
