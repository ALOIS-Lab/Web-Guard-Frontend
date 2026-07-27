import { useEffect, useState } from 'react';
import { api } from '../api';
import EmptyState from '../components/EmptyState';

function formatWhen(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function severityStyles(severity) {
  if (severity === 'critical') return 'border-l-down bg-down-soft/30';
  if (severity === 'warning') return 'border-l-checking bg-checking-soft/40';
  return 'border-l-brand bg-brand-soft/30';
}

function severityBadge(severity) {
  if (severity === 'critical') return 'bg-down-soft text-down';
  if (severity === 'warning') return 'bg-checking-soft text-checking';
  return 'bg-brand-soft text-brand';
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api('/api/alerts');
        if (!cancelled) setAlerts(data.alerts || []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Alerts</h1>
        <p className="mt-1 text-sm text-muted">
          Down-alerts recorded when a check fails.
        </p>
      </div>

      {error && <div className="rounded-xl bg-down-soft px-3 py-2 text-sm text-down">{error}</div>}

      {loading ? (
        <p className="text-muted">Loading alerts…</p>
      ) : alerts.length === 0 ? (
        <EmptyState
          title="No alerts yet"
          description="When a monitored site goes down, an alert row is saved here and an email is sent (if SMTP is configured)."
        />
      ) : (
        <ul className="space-y-3">
          {alerts.map((a) => (
            <li
              key={a.id}
              className={`rounded-2xl border border-border bg-surface p-4 border-l-4 ${severityStyles(
                a.severity || 'critical'
              )}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${severityBadge(
                        a.severity || 'critical'
                      )}`}
                    >
                      {a.severity || 'critical'}
                    </span>
                    <p className="font-semibold text-ink">
                      {a.title || 'Website alert'}
                    </p>
                  </div>
                  <p className="mt-1 text-sm font-medium text-ink break-all">{a.url}</p>
                  <p className="mt-1 text-sm text-muted">{a.message}</p>
                </div>
                <time className="text-xs text-muted whitespace-nowrap">
                  {formatWhen(a.created_at)}
                </time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
