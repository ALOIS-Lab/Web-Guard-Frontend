import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

const footerLinks = [
  { to: '/app/dashboard', label: 'Dashboard' },
  { to: '/app/websites', label: 'Monitors' },
  { to: '/app/seo', label: 'SEO Testing' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/terms', label: 'Terms' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/cookies', label: 'Cookies' },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 min-w-0">
          <BrandLogo size="sm" showTagline={false} />
          <span className="hidden sm:inline text-border">|</span>
          <p className="text-xs text-muted">© {year} WebGuard · Monitor. Protect. Assure.</p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
          {footerLinks.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-brand whitespace-nowrap">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
