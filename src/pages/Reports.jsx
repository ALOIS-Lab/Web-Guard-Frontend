import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import EmptyState from '../components/EmptyState';

function UptimeChart({ points = [] }) {
  if (!points.length) {
    return <p className="text-sm text-muted py-8 text-center">No data in this range</p>;
  }
  const w = 560;
  const h = 120;
  const pad = 8;
  const maxMs = Math.max(1, ...points.map((p) => p.ms || 0));
  const coords = points.map((p, i) => {
    const x = pad + (i / Math.max(1, points.length - 1)) * (w - pad * 2);
    const y = h - pad - ((p.ms || 0) / maxMs) * (h - pad * 2);
    return `${x},${y}`;
  });
  const bars = points.map((p, i) => {
    const bw = Math.max(2, (w - pad * 2) / points.length - 1);
    const x = pad + i * ((w - pad * 2) / points.length);
    const up = p.up === 1;
    return (
      <rect
        key={i}
        x={x}
        y={h - 14}
        width={bw}
        height={6}
        rx={2}
        className={up ? 'fill-healthy' : 'fill-down'}
      />
    );
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-brand"
        points={coords.join(' ')}
      />
      {bars}
    </svg>
  );
}

export default function Reports() {
  const [range, setRange] = useState('24h');
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await api(`/api/reports/uptime?range=${range}`);
        if (!cancelled) {
          setSeries(data.series || []);
          if (data.series?.[0]) setSelectedId(data.series[0].website_id);
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
  }, [range]);

  const selected = useMemo(
    () => series.find((s) => s.website_id === selectedId) || series[0] || null,
    [series, selectedId]
  );

  const overall = useMemo(() => {
    if (!series.length) return { uptime: null, avgMs: null, total: 0 };
    let total = 0;
    let healthyUnits = 0;
    let msSum = 0;
    let msCount = 0;
    for (const s of series) {
      total += s.total || 0;
      if (s.uptime != null && s.total) healthyUnits += (s.uptime / 100) * s.total;
      if (s.avg_ms != null) {
        msSum += s.avg_ms * (s.total || 1);
        msCount += s.total || 1;
      }
    }
    return {
      uptime: total ? Math.round((healthyUnits / total) * 1000) / 10 : null,
      avgMs: msCount ? Math.round(msSum / msCount) : null,
      total,
    };
  }, [series]);

  if (loading) return <p className="text-muted">Loading reports…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Reports</h1>
          <p className="mt-1 text-sm text-muted">Uptime and latency charts from real checks.</p>
        </div>
        <div className="flex gap-2">
          {['24h', '7d', '30d'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                range === r ? 'bg-brand text-white' : 'border border-border'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="rounded-xl bg-down-soft px-3 py-2 text-sm text-down">{error}</div>}

      {!series.length || overall.total === 0 ? (
        <EmptyState
          title="No report data yet"
          description="Run scans to populate uptime charts."
          action={
            <Link to="/app/scans" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white">
              Go to Scans
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-sm text-muted">Overall uptime ({range})</p>
              <p className="mt-2 text-3xl font-semibold text-healthy">
                {overall.uptime != null ? `${overall.uptime}%` : '—'}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-sm text-muted">Average response</p>
              <p className="mt-2 text-3xl font-semibold text-info">
                {overall.avgMs != null ? `${overall.avgMs} ms` : '—'}
              </p>
            </div>
          </div>

          {selected ? (
            <section className="rounded-2xl border border-border bg-surface p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold text-ink">Latency chart</h2>
                <select
                  value={selected.website_id}
                  onChange={(e) => setSelectedId(Number(e.target.value))}
                  className="rounded-xl border border-border px-3 py-2 text-sm"
                >
                  {series.map((s) => (
                    <option key={s.website_id} value={s.website_id}>
                      {s.url}
                    </option>
                  ))}
                </select>
              </div>
              <UptimeChart points={selected.points || []} />
              <p className="text-xs text-muted">
                Uptime {selected.uptime != null ? `${selected.uptime}%` : '—'} · Avg{' '}
                {selected.avg_ms != null ? `${selected.avg_ms} ms` : '—'} · {selected.total} checks
              </p>
            </section>
          ) : null}

          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="min-w-full text-sm">
              <thead className="border-b border-border text-left text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Website</th>
                  <th className="px-4 py-3 font-medium">Checks</th>
                  <th className="px-4 py-3 font-medium">Uptime</th>
                  <th className="px-4 py-3 font-medium">Avg response</th>
                </tr>
              </thead>
              <tbody>
                {series.map((r) => (
                  <tr key={r.website_id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium max-w-[280px] truncate">{r.url}</td>
                    <td className="px-4 py-3 text-muted">{r.total}</td>
                    <td className="px-4 py-3 text-healthy font-medium">
                      {r.uptime != null ? `${r.uptime}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {r.avg_ms != null ? `${r.avg_ms} ms` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
