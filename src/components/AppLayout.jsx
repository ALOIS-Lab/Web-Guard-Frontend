import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import BrandLogo from './BrandLogo';
import UserProfileMenu from './UserProfileMenu';
import SiteFooter from './SiteFooter';

const primaryNav = [
  { to: '/app/dashboard', label: 'Dashboard' },
  { to: '/app/websites', label: 'Monitors' },
  { to: '/app/scans', label: 'Scans' },
  { to: '/app/seo', label: 'SEO Testing' },
  { to: '/app/reports', label: 'Reports' },
  { to: '/app/alerts', label: 'Alerts' },
];

const moreNav = [
  { to: '/app/schedules', label: 'Schedules' },
  { to: '/app/groups', label: 'Groups' },
  { to: '/app/integrations', label: 'Integrations' },
  { to: '/app/settings', label: 'Settings' },
];

const allNav = [...primaryNav, ...moreNav];

function isDashboardPath(pathname) {
  return pathname === '/app/dashboard' || pathname === '/app' || pathname === '/app/';
}

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [logoPulse, setLogoPulse] = useState(false);

  const goDashboard = () => {
    setMobileOpen(false);
    if (isDashboardPath(location.pathname)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setLogoPulse(true);
      window.setTimeout(() => setLogoPulse(false), 200);
      return;
    }
    navigate('/app/dashboard');
  };

  const navLinkClass = ({ isActive }) =>
    `whitespace-nowrap px-2.5 py-2 text-sm font-medium transition-colors ${
      isActive ? 'text-brand' : 'text-ink/80 hover:text-brand'
    }`;

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <button
            type="button"
            title="Go to Dashboard"
            aria-label="Go to Dashboard"
            onClick={goDashboard}
            className={`sidebar-brand-logo shrink-0 rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
              logoPulse ? 'sidebar-brand-logo--pulse' : ''
            }`}
          >
            <BrandLogo size="nav" showTagline={false} />
          </button>

          <nav className="hidden lg:flex flex-1 items-center justify-center gap-0.5 min-w-0">
            {primaryNav.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                className="px-2.5 py-2 text-sm font-medium text-ink/80 hover:text-brand inline-flex items-center gap-1"
                aria-expanded={moreOpen}
              >
                More
                <span className="text-[10px]" aria-hidden>
                  ▾
                </span>
              </button>
              {moreOpen ? (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40 cursor-default"
                    aria-label="Close more menu"
                    onClick={() => setMoreOpen(false)}
                  />
                  <div className="absolute left-0 top-full z-50 mt-1 min-w-[180px] rounded-xl border border-border bg-surface py-1 shadow-lg">
                    {moreNav.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMoreOpen(false)}
                        className={({ isActive }) =>
                          `block px-3.5 py-2 text-sm ${
                            isActive ? 'bg-brand-soft text-brand' : 'text-ink hover:bg-canvas'
                          }`
                        }
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </nav>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            <ThemeToggle compact />
            <Link
              to="/pricing"
              className="hidden sm:inline-flex rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Upgrade
            </Link>
            <UserProfileMenu />
            <button
              type="button"
              className="lg:hidden rounded-xl border border-border px-3 py-2 text-sm font-medium text-ink"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-label="Toggle navigation"
            >
              Menu
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <nav className="lg:hidden border-t border-border bg-surface px-4 py-3 space-y-1">
            {allNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block rounded-xl px-3 py-2.5 text-sm font-medium ${
                    isActive ? 'bg-brand-soft text-brand' : 'text-ink hover:bg-canvas'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        ) : null}
      </header>

      <main className="flex-1 w-full mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 sm:py-8">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}
