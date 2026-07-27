import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

function formatWhen(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function WebsiteDetail() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [website, setWebsite] = useState(null);
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await api(`/api/websites/${id}/checks`);
        if (!cancelled) {
          setWebsite(data.website);
          setChecks(data.checks || []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const scanNow = async () => {
    setScanning(true);
    setError('');
    try {
      await api(`/api/websites/${id}/scan`, { method: 'POST' });
      const data = await api(`/api/websites/${id}/checks`);
      setWebsite(data.website);
      setChecks(data.checks || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  const copyStatus = async () => {
    if (!website?.slug) return;
    const url = `${window.location.origin}/status/${website.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Status page link copied.', 'success');
    } catch {
      showToast(url, 'success');
    }
  };

  if (loading) return <p className="text-muted">Loading site…</p>;
  if (!website) {
    return (
      <EmptyState
        title="Website not found"
        description={error || 'This site may have been removed.'}
        action={
          <Link to="/app/websites" className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white">
            Back to Monitors
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/app/websites" className="text-sm font-medium text-brand hover:text-brand-dark">
            ← Monitors
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-ink break-all">{website.url}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
            <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand">
              HTTP / HTTPS
            </span>
            <StatusBadge status={website.status} />
            <span>Every {website.interval_min} min</span>
            <span>Last checked {formatWhen(website.last_checked)}</span>
          </div>
          <p className="mt-2 text-sm text-muted">
            Owner: <span className="text-ink font-medium">{website.owner_email || '—'}</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            SSL expires: {formatWhen(website.ssl_expires_at)} · Domain expires:{' '}
            {formatWhen(website.domain_expires_at)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyStatus}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold"
          >
            Copy status link
          </button>
          <Link
            to={`/status/${website.slug}`}
            target="_blank"
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold"
          >
            Open status page
          </Link>
          <button
            type="button"
            onClick={scanNow}
            disabled={scanning}
            className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {scanning ? 'Scanning…' : 'Scan now'}
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl bg-down-soft px-3 py-2 text-sm text-down">{error}</div>}

      {website.failure_snapshot ? (
        <section className="rounded-2xl border border-border bg-surface p-5 space-y-2">
          <h2 className="font-semibold text-ink">Failure snapshot</h2>
          <p className="text-xs text-muted">{formatWhen(website.failure_snapshot.created_at)}</p>
          <pre className="max-h-48 overflow-auto rounded-xl bg-canvas p-3 text-xs text-ink whitespace-pre-wrap">
            {website.failure_snapshot.body_snippet || 'No body captured'}
          </pre>
        </section>
      ) : null}

      {checks.length === 0 ? (
        <EmptyState title="No scans yet" description="Run a scan to record status and latency." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Response</th>
                <th className="px-4 py-3 font-medium">Checked at</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-muted">{c.status_code ?? '—'}</td>
                  <td className="px-4 py-3 text-muted">
                    {c.response_ms != null ? `${c.response_ms} ms` : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">
                    {formatWhen(c.checked_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
