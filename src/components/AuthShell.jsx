import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import ThemeToggle from './ThemeToggle';

const FEATURES = [
  {
    title: '24/7 Monitoring',
    body: 'We monitor your websites around the clock so you can focus on growth.',
    color: 'bg-brand-soft text-brand',
    icon: GlobeIcon,
  },
  {
    title: 'Instant Alerts',
    body: 'Get notified instantly when something goes wrong.',
    color: 'bg-healthy-soft text-healthy',
    icon: ShieldCheckIcon,
  },
  {
    title: 'Detailed Reports',
    body: 'Beautiful, actionable reports to keep your websites healthy.',
    color: 'bg-accent-soft text-accent',
    icon: ChartIcon,
  },
  {
    title: 'Secure & Reliable',
    body: 'Enterprise-grade security and 99.99% uptime you can trust.',
    color: 'bg-checking-soft text-checking',
    icon: LockIcon,
  },
];

export default function AuthShell({ children }) {
  return (
    <div className="auth-shell">
      <aside className="auth-marketing hidden lg:block">
        <div className="auth-marketing-inner">
          <Link to="/" className="inline-flex">
            <BrandLogo size="auth" />
          </Link>

          <div className="mt-12 flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand">
              <span aria-hidden>✨</span> AI-Powered Website Monitoring
            </span>

            <h1 className="mt-6 text-4xl xl:text-5xl font-bold tracking-tight text-ink leading-[1.15]">
              Monitor.
              <br />
              Protect.
              <br />
              <span className="text-assure">Assure.</span>
            </h1>

            <p className="mt-5 text-sm xl:text-base text-muted leading-relaxed max-w-sm">
              WebGuard helps you monitor website uptime, performance, security, and more — 24/7. So
              you can focus on what matters.
            </p>

            <ul className="mt-8 space-y-4">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <li key={f.title} className="flex gap-3 items-start">
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${f.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">{f.title}</p>
                      <p className="mt-0.5 text-xs text-muted leading-relaxed">{f.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </aside>

      <div className="auth-form-panel relative">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle compact />
        </div>
        <div className="auth-card">{children}</div>
      </div>
    </div>
  );
}

function iconProps(className) {
  return {
    className,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    viewBox: '0 0 24 24',
  };
}

function GlobeIcon(p) {
  return (
    <svg {...iconProps(p.className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}
function ShieldCheckIcon(p) {
  return (
    <svg {...iconProps(p.className)}>
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
function ChartIcon(p) {
  return (
    <svg {...iconProps(p.className)}>
      <path d="M4 19V5M4 19h16M8 15l3-4 3 2 4-6" />
    </svg>
  );
}
function LockIcon(p) {
  return (
    <svg {...iconProps(p.className)}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
