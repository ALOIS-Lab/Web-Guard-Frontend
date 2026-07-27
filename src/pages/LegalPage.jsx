import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';

const PAGES = {
  terms: {
    title: 'Terms of Service',
    body: [
      'By creating a WebGuard account, you agree to use the service for lawful website monitoring only.',
      'You are responsible for the URLs you add and for keeping your login credentials secure.',
      'WebGuard provides uptime and performance checks on a best-effort basis and may change features as the product evolves.',
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    body: [
      'We store your name, email, hashed password, monitored URLs, scan history, and alerts to operate the product.',
      'Passwords are hashed with bcrypt and never stored in plain text.',
      'We do not sell your personal data. Contact support if you need an account deletion request.',
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    body: [
      'WebGuard uses local browser storage for your session token and theme preference.',
      'These are essential for staying signed in and remembering dark/light mode.',
      'We do not use third-party advertising cookies in this application.',
    ],
  },
};

export default function LegalPage({ kind }) {
  const page = PAGES[kind] || PAGES.terms;

  return (
    <div className="min-h-screen bg-canvas px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface p-8">
        <Link to="/" className="inline-flex mb-6">
          <BrandLogo size="nav" />
        </Link>
        <h1 className="text-2xl font-bold text-ink">{page.title}</h1>
        <div className="mt-4 space-y-3 text-sm text-muted leading-relaxed">
          {page.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/signup" className="text-sm font-semibold text-brand hover:text-brand-dark">
            Back to Sign Up
          </Link>
          <Link to="/login" className="text-sm font-semibold text-brand hover:text-brand-dark">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
