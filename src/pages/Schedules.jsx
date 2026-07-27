import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';

const INTERVALS = [1, 5, 15, 60];

export default function Schedules() {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await api('/api/websites');
      setWebsites(data.websites || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateInterval = async (id, interval_min) => {
    setSavingId(id);
    setError('');
    try {
      await api(`/api/websites/${id}`, {
        method: 'PATCH',
        body: { interval_min: Number(interval_min) },
      });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Schedules</h1>
        <p className="mt-1 text-sm text-muted">
          How often each site is checked. The server ticks every minute and runs due sites.
        </p>
      </div>

      {error && <div className="rounded-xl bg-down-soft px-3 py-2 text-sm text-down">{error}</div>}

      {loading ? (
        <p className="text-muted">Loading schedules…</p>
      ) : websites.length === 0 ? (
        <EmptyState
          title="No websites yet — add one to start monitoring"
          description="Schedules are per website. Add a site first, then pick 1 / 5 / 15 / 60 minutes."
          action={
            <Link
              to="/app/websites"
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"
            >
              Add website
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">URL</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Interval</th>
              </tr>
            </thead>
            <tbody>
              {websites.map((w) => (
                <tr key={w.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium max-w-[280px] truncate">{w.url}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={w.status} />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={w.interval_min}
                      disabled={savingId === w.id}
                      onChange={(e) => updateInterval(w.id, e.target.value)}
                      className="rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
                    >
                      {INTERVALS.map((n) => (
                        <option key={n} value={n}>
                          Every {n} min
                        </option>
                      ))}
                    </select>
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
