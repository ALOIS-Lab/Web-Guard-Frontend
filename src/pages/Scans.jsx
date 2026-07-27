import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';

function formatWhen(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function TestStatusTag({ status }) {
  if (!status) {
    return (
      <span className="inline-flex rounded-full bg-canvas px-2.5 py-1 text-xs font-semibold text-muted">
        No result
      </span>
    );
  }
  const styles = {
    pass: 'bg-healthy-soft text-healthy',
    warn: 'bg-checking-soft text-checking',
    fail: 'bg-down-soft text-down',
  };
  const labels = { pass: 'Pass', warn: 'Warn', fail: 'Fail' };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] || styles.warn
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

function BrokenLinksDetails({ details }) {
  if (!details) return null;
  const broken = details.broken || [];
  const slow = details.slow || [];
  const redirectHeavy = details.redirectHeavy || [];

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-4 text-sm">
        <div className="rounded-xl bg-canvas px-3 py-2">
          <p className="text-xs text-muted">Checked</p>
          <p className="font-semibold text-ink">{details.checked ?? 0}</p>
        </div>
        <div className="rounded-xl bg-canvas px-3 py-2">
          <p className="text-xs text-muted">Internal / External</p>
          <p className="font-semibold text-ink">
            {details.internalCount ?? 0} / {details.externalCount ?? 0}
          </p>
        </div>
        <div className="rounded-xl bg-canvas px-3 py-2">
          <p className="text-xs text-muted">Broken (int / ext)</p>
          <p className="font-semibold text-ink">
            {details.brokenInternal ?? 0} / {details.brokenExternal ?? 0}
          </p>
        </div>
        <div className="rounded-xl bg-canvas px-3 py-2">
          <p className="text-xs text-muted">Slow / redirects</p>
          <p className="font-semibold text-ink">
            {details.slowCount ?? 0} / {details.redirectHeavyCount ?? 0}
          </p>
        </div>
      </div>

      {broken.length === 0 && slow.length === 0 && redirectHeavy.length === 0 ? (
        <p className="text-sm text-muted">No broken, slow, or heavy-redirect links.</p>
      ) : null}

      {broken.length > 0 ? (
        <div>
          <h4 className="text-sm font-semibold text-ink mb-2">Broken links</h4>
          <ul className="space-y-2 text-sm">
            {broken.map((b) => (
              <li key={`b-${b.url}`} className="break-all rounded-lg bg-canvas px-3 py-2">
                <span className="text-down font-medium">
                  {b.statusCode != null ? `HTTP ${b.statusCode}` : b.error || 'Error'}
                </span>
                <span className="text-muted">
                  {' '}
                  · {b.scope} · {b.responseMs != null ? `${b.responseMs} ms` : '—'}
                  {b.redirectHops ? ` · ${b.redirectHops} hop(s)` : ''}
                </span>
                <div className="text-ink">{b.url}</div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {slow.length > 0 ? (
        <div>
          <h4 className="text-sm font-semibold text-ink mb-2">Slow links (&gt;3s)</h4>
          <ul className="space-y-2 text-sm">
            {slow.map((b) => (
              <li key={`s-${b.url}`} className="break-all rounded-lg bg-canvas px-3 py-2">
                <span className="text-checking font-medium">{b.responseMs} ms</span>
                <span className="text-muted">
                  {' '}
                  · {b.scope} · HTTP {b.statusCode ?? '—'}
                </span>
                <div className="text-ink">{b.url}</div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {redirectHeavy.length > 0 ? (
        <div>
          <h4 className="text-sm font-semibold text-ink mb-2">Heavy redirects (4+ hops)</h4>
          <ul className="space-y-2 text-sm">
            {redirectHeavy.map((b) => (
              <li key={`r-${b.url}`} className="break-all rounded-lg bg-canvas px-3 py-2">
                <span className="text-checking font-medium">{b.redirectHops} hops</span>
                <span className="text-muted">
                  {' '}
                  · {b.responseMs} ms · HTTP {b.statusCode ?? '—'}
                </span>
                <div className="text-ink">{b.url}</div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function BrokenLinksPanel({ websiteId }) {
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(true);

  const load = useCallback(async () => {
    if (!websiteId) {
      setTest(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api(`/api/websites/${websiteId}/tests`);
      const bl = (data.tests || []).find((t) => t.test_type === 'broken_links') || null;
      setTest(bl?.status ? bl : null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [websiteId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!websiteId) return null;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-ink">Broken links</h2>
        <p className="text-sm text-muted">
          Link health from the latest successful scan. SEO results live under{' '}
          <span className="font-medium text-ink">SEO Testing</span>.
        </p>
      </div>

      {error && <div className="rounded-xl bg-down-soft px-3 py-2 text-sm text-down">{error}</div>}

      {loading ? (
        <p className="text-muted text-sm">Loading link results…</p>
      ) : (
        <div className="rounded-2xl border border-border bg-surface">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-full px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-left hover:bg-canvas/60"
          >
            <div className="min-w-0">
              <p className="font-medium text-ink">Broken Links</p>
              <p className="text-sm text-muted truncate">
                {test ? test.summary : 'Run a scan to see results here.'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <TestStatusTag status={test?.status} />
              <span className="text-xs text-muted">{expanded ? 'Hide' : 'Details'}</span>
            </div>
          </button>
          {expanded && test ? (
            <div className="px-4 pb-4 border-t border-border pt-3">
              <p className="text-xs text-muted mb-3">
                Last run {formatWhen(test.created_at)}
                {test.scan_id ? ` · scan #${test.scan_id}` : ''}
              </p>
              <BrokenLinksDetails details={test.details} />
            </div>
          ) : null}
          {expanded && !test ? (
            <div className="px-4 pb-4 border-t border-border pt-3">
              <p className="text-sm text-muted">Run a scan to see results here.</p>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}

export default function Scans() {
  const [websites, setWebsites] = useState([]);
  const [scans, setScans] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [testsKey, setTestsKey] = useState(0);

  const load = useCallback(async () => {
    setError('');
    try {
      const [w, s] = await Promise.all([api('/api/websites'), api('/api/scans')]);
      setWebsites(w.websites || []);
      setScans(s.scans || []);
      setSelectedId((prev) => {
        if (prev) return prev;
        return w.websites?.length ? String(w.websites[0].id) : '';
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runScan = async () => {
    if (!selectedId) return;
    setScanning(true);
    setError('');
    try {
      await api(`/api/websites/${selectedId}/scan`, { method: 'POST' });
      await load();
      setTestsKey((k) => k + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  const filteredScans = selectedId
    ? scans.filter((s) => String(s.website_id) === String(selectedId))
    : scans;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Scans</h1>
        <p className="mt-1 text-sm text-muted">
          Trigger uptime checks, review history, and inspect broken-link results.
        </p>
      </div>

      {error && <div className="rounded-xl bg-down-soft px-3 py-2 text-sm text-down">{error}</div>}

      <div className="rounded-2xl border border-border bg-surface p-5 flex flex-wrap items-end gap-3">
        <label className="flex-1 min-w-[200px]">
          <span className="text-sm font-medium text-ink">Website</span>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={websites.length === 0}
            className="mt-1.5 w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-50"
          >
            {websites.length === 0 ? (
              <option value="">No websites yet</option>
            ) : (
              websites.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.url}
                </option>
              ))
            )}
          </select>
        </label>
        <button
          type="button"
          disabled={!selectedId || scanning}
          onClick={runScan}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {scanning ? 'Scanning…' : 'Scan now'}
        </button>
      </div>

      {loading ? (
        <p className="text-muted">Loading scans…</p>
      ) : filteredScans.length === 0 ? (
        <EmptyState
          title="No scans yet — add a website and run a check"
          description="Manual or scheduled scans will appear in this table with status code and response time."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">URL</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Response</th>
                <th className="px-4 py-3 font-medium">Checked at</th>
              </tr>
            </thead>
            <tbody>
              {filteredScans.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium max-w-[260px] truncate">{s.url}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-4 py-3 text-muted">{s.status_code ?? '—'}</td>
                  <td className="px-4 py-3 text-muted">
                    {s.response_ms != null ? `${s.response_ms} ms` : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">{formatWhen(s.checked_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <BrokenLinksPanel key={`${selectedId}-${testsKey}`} websiteId={selectedId} />
    </div>
  );
}
