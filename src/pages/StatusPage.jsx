import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import StatusBadge from '../components/StatusBadge';

function formatWhen(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function StatusPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/status/${encodeURIComponent(slug)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Not found');
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas grid place-items-center text-muted">Loading status…</div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-canvas grid place-items-center p-6">
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold text-ink">Status page not found</p>
          <p className="text-sm text-muted">{error}</p>
          <Link to="/" className="text-brand font-medium text-sm">
            Back to WebGuard
          </Link>
        </div>
      </div>
    );
  }

  const { website, uptime_percent: uptime, checks } = data;

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
        <div className="flex items-center justify-between gap-3">
          <BrandLogo size="sidebar" />
          <Link to="/" className="text-sm font-medium text-brand">
            Powered by WebGuard
          </Link>
        </div>

        <section className="rounded-2xl border border-border bg-surface p-6 space-y-3">
          <p className="text-sm text-muted">Public status</p>
          <h1 className="text-2xl font-semibold text-ink break-all">{website.url}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={website.status} />
            <span className="text-sm text-muted">
              Uptime {uptime != null ? `${uptime}%` : '—'} · Last check{' '}
              {formatWhen(website.last_checked)}
            </span>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="border-b border-border px-5 py-3 font-semibold text-ink">Recent checks</div>
          <ul className="divide-y divide-border">
            {(checks || []).slice(0, 20).map((c, idx) => (
              <li key={idx} className="px-5 py-3 flex justify-between text-sm gap-3">
                <StatusBadge status={c.status} />
                <span className="text-muted">
                  {c.response_ms != null ? `${c.response_ms} ms` : '—'} · {formatWhen(c.checked_at)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
