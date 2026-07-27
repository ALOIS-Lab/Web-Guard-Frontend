import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import BrandLogo from '../components/BrandLogo';
import UserProfileMenu from '../components/UserProfileMenu';
import SiteFooter from '../components/SiteFooter';

const marketingNav = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const authTo = isAuthenticated ? '/app/dashboard' : '/signup';

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="shrink-0" onClick={() => setMenuOpen(false)}>
            <BrandLogo size="nav" showTagline={false} />
          </Link>

          <nav className="hidden md:flex flex-1 items-center justify-center gap-1 min-w-0">
            {marketingNav.map((item) =>
              item.to ? (
                <Link
                  key={item.label}
                  to={item.to}
                  className="whitespace-nowrap px-2.5 py-2 text-sm font-medium text-ink/80 hover:text-brand"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="whitespace-nowrap px-2.5 py-2 text-sm font-medium text-ink/80 hover:text-brand"
                >
                  {item.label}
                </a>
              )
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            <ThemeToggle compact />
            {isAuthenticated ? (
              <>
                <Link
                  to="/app/dashboard"
                  className="hidden sm:inline-flex rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  Open App
                </Link>
                <UserProfileMenu />
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex px-3 py-2 text-sm font-medium text-ink/80 hover:text-brand"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  Get Started
                </Link>
              </>
            )}
            <button
              type="button"
              className="md:hidden rounded-xl border border-border px-3 py-2 text-sm font-medium text-ink"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label="Toggle navigation"
            >
              Menu
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav className="md:hidden border-t border-border bg-surface px-4 py-3 space-y-1">
            {marketingNav.map((item) =>
              item.to ? (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-canvas"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-canvas"
                >
                  {item.label}
                </a>
              )
            )}
            {!isAuthenticated ? (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-canvas"
              >
                Sign In
              </Link>
            ) : (
              <Link
                to="/app/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-canvas"
              >
                Open App
              </Link>
            )}
          </nav>
        ) : null}
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 sm:py-8 space-y-8">
          {/* Hero */}
          <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] items-center rounded-[28px] border border-border bg-surface p-6 sm:p-8 lg:p-10 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-canvas px-3 py-1 text-xs font-semibold text-ink">
                <span aria-hidden>✨</span> AI-Powered Website Monitoring
              </span>
              <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-[1.15]">
                Keep Your Websites{' '}
                <span className="text-gradient-brand">Healthy &amp; Secure</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm sm:text-base text-muted leading-relaxed">
                WebGuard monitors uptime, performance, and security of your websites 24/7 so you can
                focus on what matters.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to={authTo}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Your First Website
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-xl border border-brand/30 bg-surface px-5 py-3 text-sm font-semibold text-brand hover:bg-brand-soft"
                >
                  <PlayIcon className="h-4 w-4" />
                  Watch Demo
                </a>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs sm:text-sm text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon className="h-4 w-4 text-healthy" /> No credit card required
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon className="h-4 w-4 text-healthy" /> Free forever plan available
                </span>
              </div>
            </div>

            <HeroVisual />
          </section>

          {/* How it works */}
          <section id="how-it-works" className="rounded-[28px] border border-border bg-surface p-6 sm:p-8">
            <h2 className="text-center text-2xl sm:text-3xl font-bold text-ink">How WebGuard Works</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3 relative">
              {[
                {
                  title: 'Add Website',
                  body: 'Add one or more websites you want to monitor.',
                  color: 'bg-brand-soft text-brand',
                  icon: GlobeIcon,
                },
                {
                  title: 'Run Scan',
                  body: "We'll scan and analyze your website automatically.",
                  color: 'bg-healthy-soft text-healthy',
                  icon: ScanIcon,
                },
                {
                  title: 'Get Reports',
                  body: 'View detailed reports, alerts and performance insights.',
                  color: 'bg-accent-soft text-accent',
                  icon: DocIcon,
                },
              ].map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="relative text-center px-2">
                    {i < 2 && (
                      <div
                        className="hidden md:block absolute top-8 left-[62%] w-[76%] border-t-2 border-dashed border-border"
                        aria-hidden
                      />
                    )}
                    <div
                      className={`relative z-10 mx-auto grid h-16 w-16 place-items-center rounded-2xl ${step.color}`}
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-ink">{step.title}</h3>
                    <p className="mt-2 text-sm text-muted max-w-[220px] mx-auto">{step.body}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Feature strip */}
          <section id="features" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: '24/7 Monitoring',
                body: 'Continuous uptime checks around the clock.',
                color: 'bg-healthy-soft text-healthy',
                icon: ShieldIcon,
              },
              {
                title: 'Instant Alerts',
                body: 'Get notified the moment a site goes down.',
                color: 'bg-checking-soft text-checking',
                icon: BoltIcon,
              },
              {
                title: 'Detailed Reports',
                body: 'Uptime %, latency, and scan history.',
                color: 'bg-accent-soft text-accent',
                icon: ChartIcon,
              },
              {
                title: 'Secure & Reliable',
                body: 'Built for teams who need trustworthy data.',
                color: 'bg-brand-soft text-brand',
                icon: LockIcon,
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-2xl border border-border bg-surface p-5 flex gap-3 items-start"
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${f.color}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink">{f.title}</h3>
                    <p className="mt-1 text-sm text-muted">{f.body}</p>
                  </div>
                </div>
              );
            })}
          </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative animate-fade-up-delay min-h-[320px] sm:min-h-[380px]">
      <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-brand-soft via-accent-soft to-canvas" />
      <div className="relative p-4 sm:p-6">
        <div className="rounded-2xl border border-border bg-surface/95 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">Performance</p>
            <span className="text-xs text-muted">Last 24h</span>
          </div>
          <svg viewBox="0 0 320 120" className="mt-3 w-full h-28 text-brand" aria-hidden>
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 90 C40 80, 60 40, 100 55 C140 70, 160 30, 200 38 C240 46, 260 70, 320 20 L320 120 L0 120 Z"
              fill="url(#areaFill)"
            />
            <path
              d="M0 90 C40 80, 60 40, 100 55 C140 70, 160 30, 200 38 C240 46, 260 70, 320 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="absolute left-2 top-2 sm:left-4 sm:top-4 animate-float rounded-2xl border border-border bg-surface px-3 py-2.5 shadow-md flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-healthy-soft text-healthy">
            <CheckIcon className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] text-muted">Website Status</p>
            <p className="text-sm font-semibold text-ink">Operational</p>
          </div>
        </div>

        <div className="absolute right-1 top-[42%] sm:right-3 animate-float-delay rounded-2xl border border-border bg-surface px-3 py-2.5 shadow-md">
          <p className="text-[11px] text-muted">Uptime</p>
          <p className="text-lg font-bold text-brand">99.98%</p>
        </div>

        <div className="absolute left-3 bottom-8 sm:left-8 animate-float rounded-2xl border border-border bg-surface px-3 py-2.5 shadow-md">
          <p className="text-[11px] text-muted">Response Time</p>
          <p className="text-lg font-bold text-ink">128ms</p>
        </div>

        <div className="absolute right-4 bottom-2 sm:right-8 sm:bottom-4 animate-float-delay rounded-2xl border border-border bg-surface px-3 py-2.5 shadow-md flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-healthy-soft text-healthy">
            <LockIcon className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-[11px] text-muted">SSL Secure</p>
            <p className="text-sm font-semibold text-ink">Valid</p>
          </div>
        </div>
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
function ScanIcon(p) {
  return (
    <svg {...iconProps(p.className)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4" />
    </svg>
  );
}
function ChartIcon(p) {
  return (
    <svg {...iconProps(p.className)}>
      <path d="M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-8" />
    </svg>
  );
}
function PlusIcon(p) {
  return (
    <svg {...iconProps(p.className)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function PlayIcon(p) {
  return (
    <svg {...iconProps(p.className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 9l6 3-6 3V9z" fill="currentColor" stroke="none" />
    </svg>
  );
}
function CheckIcon(p) {
  return (
    <svg {...iconProps(p.className)}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
function DocIcon(p) {
  return (
    <svg {...iconProps(p.className)}>
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  );
}
function ShieldIcon(p) {
  return (
    <svg {...iconProps(p.className)}>
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" />
    </svg>
  );
}
function BoltIcon(p) {
  return (
    <svg {...iconProps(p.className)}>
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
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
