import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import ThemeToggle from '../components/ThemeToggle';
import UserProfileMenu from '../components/UserProfileMenu';
import SiteFooter from '../components/SiteFooter';
import { UPGRADE_PLANS } from '../data/plans';

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const signupTo = isAuthenticated ? '/app/dashboard' : '/signup';

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="shrink-0">
            <BrandLogo size="nav" showTagline={false} />
          </Link>
          <nav className="hidden sm:flex flex-1 items-center justify-center gap-1">
            <Link to="/" className="px-2.5 py-2 text-sm font-medium text-ink/80 hover:text-brand">
              Home
            </Link>
            <Link to="/pricing" className="px-2.5 py-2 text-sm font-medium text-brand">
              Pricing
            </Link>
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
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-10 sm:px-6 sm:py-14">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-accent">Pricing</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            Choose the plan that fits your sites
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted leading-relaxed">
            Simple monthly pricing. Upgrade anytime as you add more websites and need faster checks.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {UPGRADE_PLANS.map((plan) => (
            <article
              key={plan.id}
              className={`flex flex-col rounded-2xl border bg-surface p-6 shadow-sm ${
                plan.highlight
                  ? 'border-accent ring-1 ring-accent/30 relative'
                  : 'border-border'
              }`}
            >
              {plan.highlight ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[11px] font-bold text-white">
                  Popular
                </span>
              ) : null}

              <h2 className="text-lg font-semibold text-ink">{plan.name}</h2>
              <p className="mt-1 text-sm text-muted">{plan.blurb}</p>

              <p className="mt-5 text-4xl font-bold tracking-tight text-ink">
                {plan.price}
                <span className="text-base font-medium text-muted">{plan.note}</span>
              </p>

              <ul className="mt-6 space-y-2.5 flex-1">
                {plan.points.map((point) => (
                  <li key={point} className="flex gap-2 text-sm text-ink">
                    <span className="mt-0.5 text-healthy font-bold" aria-hidden>
                      ✓
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={`${signupTo}${signupTo.includes('signup') ? `?plan=${plan.id}` : ''}`}
                className={`mt-8 flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-90 ${
                  plan.highlight
                    ? 'bg-accent text-white'
                    : 'border border-border bg-canvas text-ink hover:border-accent/40'
                }`}
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted">
          <Link to="/" className="font-medium text-brand hover:text-brand-dark">
            ← Back to WebGuard
          </Link>
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
