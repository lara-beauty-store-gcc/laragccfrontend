'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Copy, Lock, Plus, Save, Search, Trash2, X } from 'lucide-react';

type RedirectRow = {
  slug: string;
  destination: string;
  label: string;
  clicks: number;
  active: boolean;
  shortUrl: string;
  updatedAt: string;
};

const PASSWORD_KEY = 'lara_redirectkiller_password';

type ModalMode = 'create' | 'edit' | null;

function normalizeSlugInput(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function RedirectkillerPage() {
  const [password, setPassword] = useState('');
  const [savedPassword, setSavedPassword] = useState('');
  const [redirects, setRedirects] = useState<RedirectRow[]>([]);
  const [baseUrl, setBaseUrl] = useState('https://larabeauty.store');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingRow, setEditingRow] = useState<RedirectRow | null>(null);
  const [slug, setSlug] = useState('');
  const [destination, setDestination] = useState('/lp');
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return redirects;
    return redirects.filter(
      (row) =>
        row.slug.includes(q) ||
        row.destination.toLowerCase().includes(q) ||
        row.label.toLowerCase().includes(q) ||
        row.shortUrl.toLowerCase().includes(q),
    );
  }, [redirects, search]);

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

  function openCreateModal() {
    setEditingRow(null);
    setSlug('');
    setDestination('/lp');
    setLabel('');
    setModalMode('create');
    setError('');
  }

  function openEditModal(row: RedirectRow) {
    setEditingRow(row);
    setSlug(row.slug);
    setDestination(row.destination);
    setLabel(row.label);
    setModalMode('edit');
    setError('');
  }

  function closeModal() {
    setModalMode(null);
    setEditingRow(null);
    setSlug('');
    setDestination('/lp');
    setLabel('');
  }

  async function saveModal(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const cleanSlug = normalizeSlugInput(slug);
    const cleanDestination = destination.trim();
    const cleanLabel = label.trim() || cleanSlug;

    if (!cleanSlug || cleanSlug.length < 2) {
      setError('invalid_slug');
      setSaving(false);
      return;
    }

    if (!cleanDestination) {
      setError('invalid_destination');
      setSaving(false);
      return;
    }

    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/redirectkiller/redirects', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            slug: cleanSlug,
            destination: cleanDestination,
            label: cleanLabel,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'create_failed');
      } else if (modalMode === 'edit' && editingRow) {
        const res = await fetch(`/api/redirectkiller/redirects/${encodeURIComponent(editingRow.slug)}`, {
          method: 'PATCH',
          headers: authHeaders,
          body: JSON.stringify({
            destination: cleanDestination,
            label: cleanLabel,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'update_failed');
      }

      closeModal();
      await loadRedirects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'save_failed');
    } finally {
      setSaving(false);
    }
  }

  async function removeRedirect(row: RedirectRow) {
    if (!confirm(`Delete /ads/${row.slug}?`)) return;
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
      <div className="flex min-h-screen items-center justify-center bg-[#ececec] px-4">
        <form onSubmit={savePassword} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#134E3A]/10">
              <Lock className="h-6 w-6 text-[#134E3A]" aria-hidden />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Redirect Killer</h1>
            <p className="mt-2 text-sm text-gray-500">Enter your admin password to continue</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#134E3A] focus:ring-2 focus:ring-[#134E3A]/20"
            placeholder="Password"
            required
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-[#134E3A] px-4 py-3 text-sm font-bold text-white hover:bg-[#0f3d2e]"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ececec]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Redirect Killer</h1>
            <p className="mt-1 text-sm text-gray-500">Short ad links with query params preserved</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-[#134E3A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f3d2e]"
            >
              <Plus className="h-4 w-4" aria-hidden />
              New redirect
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600"
            >
              Logout
            </button>
          </div>
        </div>

        {error && !modalMode ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search redirects..."
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#134E3A] focus:ring-2 focus:ring-[#134E3A]/10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Destination</th>
                  <th className="px-5 py-3">URL</th>
                  <th className="px-5 py-3">Clicks</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                      No redirects yet. Click &quot;New redirect&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.slug} className="border-t border-gray-100 hover:bg-gray-50/60">
                      <td className="px-5 py-4 align-top">
                        <p className="font-semibold text-gray-900">{row.slug}</p>
                        {row.label !== row.slug ? (
                          <p className="mt-0.5 text-xs text-gray-400">{row.label}</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-4 align-top">
                        <p className="font-mono text-xs text-gray-600">{row.destination}</p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <button
                          type="button"
                          onClick={() => void copyText(row.shortUrl, row.slug)}
                          className="group flex max-w-xs items-start gap-2 text-left"
                        >
                          <span className="break-all font-mono text-xs text-[#134E3A] group-hover:underline">
                            {row.shortUrl}
                          </span>
                          <Copy className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
                        </button>
                        {copiedSlug === row.slug ? (
                          <p className="mt-1 text-[11px] font-semibold text-emerald-600">Copied</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-4 align-top font-bold text-gray-900">{row.clicks}</td>
                      <td className="px-5 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(row)}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <a
                            href={`${row.shortUrl}?utm_source=test`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            Test
                          </a>
                          <button
                            type="button"
                            onClick={() => void removeRedirect(row)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Ad link example: {baseUrl}/ads/killer?utm_source=meta → lands on /lp?utm_source=meta
        </p>
      </div>

      {modalMode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-[1px]">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="redirect-modal-title"
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute left-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>

            <h2 id="redirect-modal-title" className="mb-6 text-center text-xl font-bold text-gray-900">
              {modalMode === 'create' ? 'New redirect' : 'Edit redirect'}
            </h2>

            {error ? (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <form onSubmit={(e) => void saveModal(e)} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                  Slug <span className="font-normal text-gray-400">(lowercase, no spaces)</span>
                </label>
                <div className="flex overflow-hidden rounded-xl border border-gray-200 focus-within:border-[#134E3A] focus-within:ring-2 focus-within:ring-[#134E3A]/10">
                  <span className="flex items-center border-r border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-500">
                    /ads/
                  </span>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(normalizeSlugInput(e.target.value))}
                    disabled={modalMode === 'edit'}
                    className="min-w-0 flex-1 px-4 py-3 text-sm outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="summer-sale"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-800">Destination path</label>
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#134E3A] focus:ring-2 focus:ring-[#134E3A]/10"
                  placeholder="/lp"
                  required
                />
                <p className="mt-2 text-xs leading-relaxed text-gray-400">
                  Use a path like /products/slug or a full URL. Query params from the ad link are appended
                  automatically.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                  Label <span className="font-normal text-gray-400">(optional, for your reference)</span>
                </label>
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#134E3A] focus:ring-2 focus:ring-[#134E3A]/10"
                  placeholder="TikTok summer campaign"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#134E3A] px-4 py-3 text-sm font-bold text-white hover:bg-[#0f3d2e] disabled:opacity-60"
                >
                  <Save className="h-4 w-4" aria-hidden />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
