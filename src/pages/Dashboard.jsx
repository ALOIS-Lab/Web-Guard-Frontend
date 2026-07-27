import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import RadarSweep from '../components/RadarSweep';

export default function Dashboard() {
  const [websites, setWebsites] = useState([]);
  const [scans, setScans] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [w, a, s] = await Promise.all([
          api('/api/websites'),
          api('/api/alerts'),
          api('/api/scans'),
        ]);
        if (!cancelled) {
          setWebsites(w.websites || []);
          setAlerts(a.alerts || []);
          setScans(s.scans || []);
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
  }, []);

  const radarSites = useMemo(() => {
    const latestMs = new Map();
    for (const scan of scans) {
      if (latestMs.has(scan.website_id)) continue;
      if (scan.response_ms != null) latestMs.set(scan.website_id, scan.response_ms);
    }
    return websites.map((w) => ({
      id: w.id,
      url: w.url,
      status: w.status === 'partial' ? 'checking' : w.status,
      response_ms: latestMs.get(w.id) ?? null,
    }));
  }, [websites, scans]);

  const total = websites.length;
  const healthy = websites.filter((w) => w.status === 'healthy').length;
  const slow = websites.filter((w) => w.status === 'slow').length;
  const failed = websites.filter((w) => w.status === 'down' || w.status === 'partial').length;
  const checking = websites.filter((w) => w.status === 'checking').length;
  const allOk = failed === 0 && checking === 0 && total > 0;
  const lastUpdated = useMemo(() => {
    const times = websites.map((w) => w.last_checked).filter(Boolean);
    if (!times.length) return null;
    const latest = times.map((t) => new Date(t).getTime()).filter((n) => !Number.isNaN(n));
    if (!latest.length) return null;
    return new Date(Math.max(...latest));
  }, [websites]);

  if (loading) {
    return <p className="text-muted">Loading dashboard…</p>;
  }

  const quickActions = [
    {
      id: 'monitors',
      title: 'Monitors',
      badge: String(total),
      description: (
        <>
          <span className="font-semibold text-brand">{total}</span> monitored · HTTP / HTTPS
        </>
      ),
      cta: 'View monitors',
      to: '/app/websites',
      theme: 'blue',
      Icon: IconMonitors,
    },
    {
      id: 'scans',
      title: 'Scans',
      badge: String(scans.length),
      description: (
        <>
          Run checks &amp; view history · <span className="font-semibold text-accent">{scans.length}</span>{' '}
          recent
        </>
      ),
      cta: 'Open scans',
      to: '/app/scans',
      theme: 'purple',
      Icon: IconScans,
    },
    {
      id: 'reports',
      title: 'Reports',
      badge: healthy > 0 ? `${Math.round((healthy / Math.max(total, 1)) * 100)}%` : '—',
      description: (
        <>
          Uptime &amp; response times ·{' '}
          <span className="font-semibold text-healthy">{healthy} healthy</span>
        </>
      ),
      cta: 'View reports',
      to: '/app/reports',
      theme: 'green',
      Icon: IconReports,
    },
    {
      id: 'alerts',
      title: 'Alerts',
      badge: String(alerts.length),
      description: (
        <>
          <span className={`font-semibold ${alerts.length ? 'text-down' : 'text-healthy'}`}>
            {alerts.length}
          </span>{' '}
          recorded · stay ahead of outages
        </>
      ),
      cta: 'Review alerts',
      to: '/app/alerts',
      theme: 'red',
      Icon: IconAlerts,
    },
    {
      id: 'schedules',
      title: 'Schedules',
      badge: total ? String(total) : '—',
      description: (
        <>
          Adjust check intervals · <span className="font-semibold text-checking">30s – 1h</span>
        </>
      ),
      cta: 'Manage schedules',
      to: '/app/schedules',
      theme: 'orange',
      Icon: IconSchedules,
    },
    {
      id: 'settings',
      title: 'Settings',
      badge: 'You',
      description: (
        <>
          Profile, password &amp; <span className="font-semibold text-brand">appearance</span>
        </>
      ),
      cta: 'Open settings',
      to: '/app/settings',
      theme: 'slate',
      Icon: IconSettings,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Live overview of your monitored websites.</p>
      </div>

      {error && <div className="rounded-xl bg-down-soft px-3 py-2 text-sm text-down">{error}</div>}

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="flex flex-col items-center gap-3 lg:items-start">
            <RadarSweep sites={radarSites} />
            <p className="text-xs text-muted text-center lg:text-left max-w-[200px]">
              {total === 0
                ? 'Sweeping — add a website to see blips on the radar.'
                : 'Hover a blip for URL · click to open site details.'}
            </p>
          </div>

          <div className="flex-1 grid gap-3 sm:grid-cols-2 xl:grid-cols-5 min-w-0">
            <StatCard label="Total" value={total} />
            <StatCard label="Healthy" value={healthy} tone="healthy" />
            <StatCard label="Slow" value={slow} tone="info" />
            <StatCard label="Failed" value={failed} tone="down" />
            <StatCard label="In Progress" value={checking} tone="checking" />
          </div>
        </div>
      </section>

      {total === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-ink">Getting started</h2>
          <p className="mt-1 text-sm text-muted">Three steps to your first uptime check.</p>
          <ol className="mt-6 space-y-4">
            {[
              {
                step: '1',
                title: 'Add a monitor',
                body: 'Paste any HTTP or HTTPS URL you want WebGuard to watch.',
                to: '/app/websites',
              },
              {
                step: '2',
                title: 'Run a scan',
                body: 'Trigger a manual check or wait for the schedule.',
                to: '/app/scans',
              },
              {
                step: '3',
                title: 'Review results',
                body: 'See status, latency, and alerts as they arrive.',
                to: '/app/reports',
              },
            ].map((s) => (
              <li key={s.step} className="flex gap-4 items-start">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                  {s.step}
                </span>
                <div>
                  <p className="font-medium text-ink">{s.title}</p>
                  <p className="text-sm text-muted">{s.body}</p>
                  <Link to={s.to} className="mt-1 inline-block text-sm font-medium text-primary">
                    Go →
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <section className="quick-actions relative overflow-hidden rounded-[28px] border border-border bg-surface p-5 sm:p-7 lg:p-8">
          <div className="quick-actions__glow" aria-hidden />

          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-ink sm:text-2xl">
                Quick actions
                <SparkleIcon className="h-5 w-5 text-accent" />
              </h2>
              <p className="mt-1.5 text-sm text-muted">
                Jump into the parts of WebGuard you use most.
              </p>
            </div>
            <div className="hidden sm:block opacity-90" aria-hidden>
              <ShieldDecor />
            </div>
          </div>

          <div className="relative mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {quickActions.map((card) => (
              <QuickActionCard key={card.id} {...card} />
            ))}
          </div>

          <div className="relative mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-canvas/70 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-start gap-3 min-w-0">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                <ShieldMini />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">WebGuard is protecting your websites</p>
                <p className="text-xs text-muted">
                  {total} monitor{total === 1 ? '' : 's'} · continuous uptime &amp; service checks
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="inline-flex items-center gap-2 text-sm">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    allOk || total === 0 ? 'bg-healthy shadow-[0_0_8px_rgba(34,197,94,0.7)]' : 'bg-checking'
                  }`}
                />
                <span className="font-medium text-ink">
                  {total === 0
                    ? 'Waiting for monitors'
                    : allOk
                      ? 'All systems operational'
                      : failed > 0
                        ? `${failed} need attention`
                        : 'Checks in progress'}
                </span>
              </div>
              {lastUpdated ? (
                <span className="text-xs text-muted whitespace-nowrap">
                  Last updated {lastUpdated.toLocaleTimeString()}
                </span>
              ) : null}
              <Link
                to="/app/websites"
                className="inline-flex items-center gap-1 rounded-xl bg-brand-soft px-3.5 py-2 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white"
              >
                View monitors →
              </Link>
            </div>
          </div>
        </section>
      )}

      {total > 0 && alerts.length === 0 && (
        <EmptyState
          title="No alerts yet"
          description="When a site goes down, alerts will show up here and on the Alerts page."
        />
      )}
    </div>
  );
}

const THEMES = {
  blue: {
    card: 'from-[#eff6ff] to-white dark:from-[#1e3a8a33] dark:to-surface',
    badge: 'bg-brand-soft text-brand',
    ring: 'hover:border-brand/35 hover:shadow-[0_12px_40px_rgba(37,99,235,0.12)]',
    cta: 'text-brand',
  },
  purple: {
    card: 'from-[#f5f3ff] to-white dark:from-[#2e106555] dark:to-surface',
    badge: 'bg-accent-soft text-accent',
    ring: 'hover:border-accent/35 hover:shadow-[0_12px_40px_rgba(124,58,237,0.12)]',
    cta: 'text-accent',
  },
  green: {
    card: 'from-[#f0fdf4] to-white dark:from-[#14532d33] dark:to-surface',
    badge: 'bg-healthy-soft text-healthy',
    ring: 'hover:border-healthy/35 hover:shadow-[0_12px_40px_rgba(22,163,74,0.12)]',
    cta: 'text-healthy',
  },
  red: {
    card: 'from-[#fef2f2] to-white dark:from-[#7f1d1d33] dark:to-surface',
    badge: 'bg-down-soft text-down',
    ring: 'hover:border-down/35 hover:shadow-[0_12px_40px_rgba(220,38,38,0.12)]',
    cta: 'text-down',
  },
  orange: {
    card: 'from-[#fffbeb] to-white dark:from-[#78350f33] dark:to-surface',
    badge: 'bg-checking-soft text-checking',
    ring: 'hover:border-checking/35 hover:shadow-[0_12px_40px_rgba(217,119,6,0.12)]',
    cta: 'text-checking',
  },
  slate: {
    card: 'from-[#f1f5f9] to-white dark:from-[#1e293b55] dark:to-surface',
    badge: 'bg-canvas text-muted',
    ring: 'hover:border-brand/30 hover:shadow-[0_12px_40px_rgba(15,23,42,0.08)]',
    cta: 'text-brand',
  },
};

function QuickActionCard({ title, badge, description, cta, to, theme, Icon }) {
  const t = THEMES[theme] || THEMES.blue;
  return (
    <Link
      to={to}
      className={`group relative flex min-h-[148px] overflow-hidden rounded-[22px] border border-border/80 bg-gradient-to-br ${t.card} p-5 transition duration-200 hover:-translate-y-0.5 ${t.ring}`}
    >
      <div className="relative z-10 flex min-w-0 flex-1 flex-col pr-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold tracking-tight text-ink">{title}</h3>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold tabular-nums ${t.badge}`}
          >
            {badge}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
        <span
          className={`mt-auto pt-4 inline-flex items-center gap-1 text-sm font-semibold ${t.cta} transition group-hover:gap-2`}
        >
          {cta}
          <span aria-hidden>→</span>
        </span>
      </div>
      <div className="pointer-events-none absolute -right-1 bottom-1 opacity-95 transition duration-300 group-hover:scale-105 group-hover:-translate-y-0.5">
        <Icon />
      </div>
    </Link>
  );
}

function SparkleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z" />
    </svg>
  );
}

function ShieldMini() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z"
        fill="currentColor"
        opacity="0.9"
      />
      <path d="M9.5 12.2l1.8 1.8 3.4-3.6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ShieldDecor() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden>
      <ellipse cx="36" cy="58" rx="18" ry="4" fill="#93c5fd" opacity="0.35" />
      <path
        d="M36 10l18 7v14c0 12-8 20-18 24-10-4-18-12-18-24V17l18-7z"
        fill="url(#qaShield)"
      />
      <path d="M28 34l5 5 11-12" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="qaShield" x1="18" y1="10" x2="54" y2="55" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60a5fa" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function IconMonitors() {
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden>
      <rect x="14" y="16" width="52" height="40" rx="6" fill="#3b82f6" />
      <rect x="18" y="20" width="44" height="28" rx="3" fill="#dbeafe" />
      <path d="M22 40l8-10 7 6 8-12 9 16H22z" fill="#2563eb" opacity="0.85" />
      <rect x="32" y="56" width="16" height="4" rx="2" fill="#93c5fd" />
      <rect x="26" y="60" width="28" height="5" rx="2.5" fill="#60a5fa" />
      <circle cx="68" cy="24" r="8" fill="#93c5fd" opacity="0.9" />
    </svg>
  );
}

function IconScans() {
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden>
      <circle cx="44" cy="46" r="22" fill="#ddd6fe" />
      <circle cx="44" cy="46" r="14" fill="#c4b5fd" />
      <circle cx="44" cy="46" r="6" fill="#7c3aed" />
      <path d="M44 18v10M44 64v10M18 46h10M64 46h10" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" />
      <path d="M44 46l16-18" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" />
      <circle cx="62" cy="26" r="5" fill="#a78bfa" />
    </svg>
  );
}

function IconReports() {
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden>
      <rect x="22" y="14" width="36" height="48" rx="6" fill="#86efac" />
      <rect x="28" y="22" width="24" height="4" rx="2" fill="#fff" opacity="0.85" />
      <rect x="28" y="30" width="18" height="4" rx="2" fill="#fff" opacity="0.7" />
      <rect x="30" y="42" width="6" height="12" rx="1.5" fill="#16a34a" />
      <rect x="40" y="36" width="6" height="18" rx="1.5" fill="#22c55e" />
      <rect x="50" y="40" width="6" height="14" rx="1.5" fill="#4ade80" />
      <circle cx="62" cy="22" r="10" fill="#bbf7d0" />
      <path d="M58 22h8M62 18v8" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function IconAlerts() {
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden>
      <ellipse cx="44" cy="62" rx="20" ry="6" fill="#fecaca" />
      <rect x="34" y="48" width="20" height="14" rx="4" fill="#f87171" />
      <path d="M28 48c0-12 7-22 16-22s16 10 16 22" fill="#ef4444" />
      <circle cx="44" cy="34" r="8" fill="#fecaca" />
      <path d="M44 30v5M44 38.5h.01" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 36l8 4M68 36l-8 4M22 52h8M58 52h8" stroke="#fca5a5" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function IconSchedules() {
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden>
      <rect x="18" y="22" width="44" height="40" rx="8" fill="#fdba74" />
      <rect x="18" y="22" width="44" height="12" rx="8" fill="#f97316" />
      <rect x="18" y="30" width="44" height="4" fill="#f97316" />
      <circle cx="30" cy="20" r="3" fill="#fb923c" />
      <circle cx="50" cy="20" r="3" fill="#fb923c" />
      <rect x="26" y="40" width="8" height="8" rx="2" fill="#fff7ed" />
      <rect x="38" y="40" width="8" height="8" rx="2" fill="#ffedd5" />
      <rect x="50" y="40" width="8" height="8" rx="2" fill="#fff7ed" />
      <circle cx="62" cy="54" r="14" fill="#fed7aa" />
      <circle cx="62" cy="54" r="10" fill="#fff7ed" />
      <path d="M62 48v7l5 3" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden>
      <circle cx="44" cy="44" r="16" fill="#94a3b8" />
      <circle cx="44" cy="44" r="8" fill="#e2e8f0" />
      <g fill="#64748b">
        <rect x="41" y="14" width="6" height="12" rx="2" />
        <rect x="41" y="62" width="6" height="12" rx="2" />
        <rect x="14" y="41" width="12" height="6" rx="2" />
        <rect x="62" y="41" width="12" height="6" rx="2" />
      </g>
      <circle cx="64" cy="24" r="8" fill="#cbd5e1" />
      <circle cx="64" cy="24" r="3.5" fill="#f8fafc" />
    </svg>
  );
}
