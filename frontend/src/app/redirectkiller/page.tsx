'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Copy,
  ExternalLink,
  Link2,
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';

type RedirectRow = {
  slug: string;
  destination: string;
  label: string;
  clicks: number;
  active: boolean;
  shortUrl: string;
  updatedAt: string;
};

type SiteDestination = {
  label: string;
  path: string;
  group: 'pages' | 'products';
};

const PASSWORD_KEY = 'lara_redirectkiller_password';

export default function RedirectkillerPage() {
  const [password, setPassword] = useState('');
  const [savedPassword, setSavedPassword] = useState('');
  const [redirects, setRedirects] = useState<RedirectRow[]>([]);
  const [destinations, setDestinations] = useState<SiteDestination[]>([]);
  const [baseUrl, setBaseUrl] = useState('https://larabeauty.store');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slug, setSlug] = useState('');
  const [destination, setDestination] = useState('/lp');
  const [label, setLabel] = useState('');
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editDestination, setEditDestination] = useState('');
  const [editLabel, setEditLabel] = useState('');
  const [copiedSlug, setCopiedSlug] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem(PASSWORD_KEY);
    if (stored) {
      setSavedPassword(stored);
      setPassword(stored);
    }
  }, []);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${savedPassword}`,
      'Content-Type': 'application/json',
    }),
    [savedPassword],
  );

  const loadRedirects = useCallback(async () => {
    if (!savedPassword) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/redirectkiller/redirects', { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'load_failed');
      setRedirects(Array.isArray(data.redirects) ? data.redirects : []);
      setDestinations(Array.isArray(data.destinations) ? data.destinations : []);
      if (data.baseUrl) setBaseUrl(String(data.baseUrl));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'load_failed');
    } finally {
      setLoading(false);
    }
  }, [authHeaders, savedPassword]);

  useEffect(() => {
    if (savedPassword) void loadRedirects();
  }, [savedPassword, loadRedirects]);

  function savePassword(e: React.FormEvent) {
    e.preventDefault();
    sessionStorage.setItem(PASSWORD_KEY, password.trim());
    setSavedPassword(password.trim());
  }

  function logout() {
    sessionStorage.removeItem(PASSWORD_KEY);
    setSavedPassword('');
    setPassword('');
    setRedirects([]);
  }

  async function createRedirect(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/redirectkiller/redirects', {
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

  function startEdit(row: RedirectRow) {
    setEditingSlug(row.slug);
    setEditDestination(row.destination);
    setEditLabel(row.label);
  }

  function cancelEdit() {
    setEditingSlug(null);
    setEditDestination('');
    setEditLabel('');
  }

  async function saveEdit(row: RedirectRow) {
    setError('');
    try {
      const res = await fetch(`/api/redirectkiller/redirects/${encodeURIComponent(row.slug)}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({
          destination: editDestination,
          label: editLabel || row.slug,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'update_failed');
      cancelEdit();
      await loadRedirects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'update_failed');
    }
  }

  async function toggleActive(row: RedirectRow) {
    setError('');
    try {
      const res = await fetch(`/api/redirectkiller/redirects/${encodeURIComponent(row.slug)}`, {
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
    if (!confirm(`Delete /r/${row.slug}?`)) return;
    setError('');
    try {
      const res = await fetch(`/api/redirectkiller/redirects/${encodeURIComponent(row.slug)}`, {
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

  async function copyText(text: string, slugKey: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSlug(slugKey);
      window.setTimeout(() => setCopiedSlug(''), 1500);
    } catch {
      setError('copy_failed');
    }
  }

  if (!savedPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1f18] via-[#134E3A] to-[#0a1612] px-4 py-16">
        <div className="mx-auto max-w-md">
          <form
            onSubmit={savePassword}
            className="rounded-[2rem] border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur"
          >
            <div className="mb-6 flex items-center gap-3 text-primary">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <Link2 className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h1 className="font-arabic text-xl font-extrabold">Redirect Killer</h1>
                <p className="text-xs text-muted">Short links for ads · params preserved</p>
              </div>
            </div>

            <p className="mb-5 text-sm leading-relaxed text-muted">
              Create slugs like <span className="font-mono text-primary">/r/killer</span> that redirect to any page.
              UTM and fbclid params pass through automatically.
            </p>

            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Lock className="h-4 w-4 text-secondary" aria-hidden />
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-5 w-full rounded-2xl border border-border px-4 py-3.5 text-sm outline-none ring-primary focus:ring-2"
              placeholder="REDIRECTKILLER_ADMIN_PASSWORD"
              required
            />
            <button
              type="submit"
              className="w-full rounded-2xl bg-primary px-4 py-3.5 text-sm font-bold text-white transition hover:opacity-95"
            >
              Enter dashboard
            </button>
            <p className="mt-4 text-center text-xs text-muted">
              Set <span className="font-mono">REDIRECTKILLER_ADMIN_PASSWORD</span> in EasyPanel
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f1e8] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Redirect Killer</p>
            <h1 className="mt-1 font-arabic text-3xl font-extrabold text-primary">Short Link Manager</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Ad link: <span className="font-mono text-primary">{baseUrl}/r/killer?utm_source=meta</span>
              <br />
              Lands on: <span className="font-mono text-foreground">/lp?utm_source=meta&fbclid=…</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void loadRedirects()}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-white px-4 py-2.5 text-sm font-semibold"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden />
              Refresh
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-2xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-muted"
            >
              Logout
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
          className="mb-8 grid gap-4 rounded-[2rem] border border-border bg-white p-6 shadow-card lg:grid-cols-4"
        >
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">Slug</label>
            <div className="flex items-center rounded-2xl border border-border bg-surface-rose/40">
              <span className="px-3 text-xs font-mono text-muted">/r/</span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-r-2xl bg-transparent px-1 py-3 text-sm outline-none"
                placeholder="killer"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">Label</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none ring-primary focus:ring-2"
              placeholder="Meta warmup"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">Destination</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none ring-primary focus:ring-2 sm:max-w-xs"
              >
                {destinations.map((item) => (
                  <option key={item.path} value={item.path}>
                    {item.label} ({item.path})
                  </option>
                ))}
              </select>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full rounded-2xl border border-border px-4 py-3 text-sm font-mono outline-none ring-primary focus:ring-2"
                placeholder="/lp or /products/..."
              />
            </div>
          </div>

          <div className="lg:col-span-4">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Create redirect
            </button>
          </div>
        </form>

        <div className="overflow-hidden rounded-[2rem] border border-border bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#0f1f18] text-right text-white">
                <tr>
                  <th className="px-5 py-4 font-arabic font-bold">Short link</th>
                  <th className="px-5 py-4 font-arabic font-bold">Destination</th>
                  <th className="px-5 py-4 font-arabic font-bold">Clicks</th>
                  <th className="px-5 py-4 font-arabic font-bold">Status</th>
                  <th className="px-5 py-4 font-arabic font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {redirects.map((row) => {
                  const editing = editingSlug === row.slug;
                  return (
                    <tr key={row.slug} className="border-t border-border align-top">
                      <td className="px-5 py-5">
                        {editing ? (
                          <input
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            className="mb-2 w-full rounded-xl border border-border px-3 py-2 text-sm"
                            placeholder="Label"
                          />
                        ) : (
                          <p className="font-semibold text-foreground">{row.label}</p>
                        )}
                        <p className="mt-1 font-mono text-xs text-primary">{row.shortUrl}</p>
                        <p className="mt-1 text-[11px] text-muted">/r/{row.slug}</p>
                      </td>
                      <td className="px-5 py-5">
                        {editing ? (
                          <div className="space-y-2">
                            <select
                              value={editDestination}
                              onChange={(e) => setEditDestination(e.target.value)}
                              className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                            >
                              {destinations.map((item) => (
                                <option key={`${row.slug}-${item.path}`} value={item.path}>
                                  {item.label} ({item.path})
                                </option>
                              ))}
                            </select>
                            <input
                              value={editDestination}
                              onChange={(e) => setEditDestination(e.target.value)}
                              className="w-full rounded-xl border border-border px-3 py-2 font-mono text-xs"
                            />
                          </div>
                        ) : (
                          <p className="break-all font-mono text-xs text-muted">{row.destination}</p>
                        )}
                      </td>
                      <td className="px-5 py-5 text-lg font-extrabold text-foreground">{row.clicks}</td>
                      <td className="px-5 py-5">
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
                      <td className="px-5 py-5">
                        <div className="flex flex-wrap gap-2">
                          {editing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => void saveEdit(row)}
                                className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white"
                              >
                                <Check className="h-3.5 w-3.5" aria-hidden />
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold"
                              >
                                <X className="h-3.5 w-3.5" aria-hidden />
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEdit(row)}
                                className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold"
                              >
                                <Pencil className="h-3.5 w-3.5" aria-hidden />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => void copyText(row.shortUrl, row.slug)}
                                className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold"
                              >
                                {copiedSlug === row.slug ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" aria-hidden />
                                )}
                                Copy
                              </button>
                              <a
                                href={`${row.shortUrl}?utm_source=test`}
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
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-5 text-sm leading-relaxed text-muted shadow-card">
            <p className="font-bold text-foreground">How params work</p>
            <p className="mt-2">
              Put this in ads: <span className="font-mono text-primary">{baseUrl}/r/killer?utm_source=meta</span>
            </p>
            <p className="mt-1">
              Visitor lands on: <span className="font-mono text-foreground">/lp?utm_source=meta</span> (+ fbclid etc.)
            </p>
            <p className="mt-1">Sheet receives the landing URL, not the /r/ link.</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5 text-sm shadow-card">
            <p className="font-bold text-foreground">Quick links</p>
            <div className="mt-3 space-y-2">
              <Link href="/lp" className="inline-flex items-center gap-2 text-primary hover:underline">
                <ExternalLink className="h-4 w-4" aria-hidden />
                Open /lp warmup page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
