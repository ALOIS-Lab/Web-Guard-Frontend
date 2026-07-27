import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';
import BrandLogo from '../components/BrandLogo';
import { getPasswordChecks, isPasswordStrong, passwordErrorMessage } from '../utils/password';

export default function Signup() {
  const { signup, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [oauthNote, setOauthNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const checks = useMemo(() => getPasswordChecks(password), [password]);

  if (!loading && isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const onOauth = (provider) => {
    setOauthNote(
      `${provider} sign-in is not connected yet. Create an account with email below — same secure path as Login.`
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setOauthNote('');
    const pwdErr = passwordErrorMessage(password);
    if (pwdErr) {
      setError(pwdErr);
      return;
    }
    setSubmitting(true);
    try {
      await signup(name, email, password);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="flex items-center justify-between gap-3 mb-6 lg:hidden">
        <Link to="/">
          <BrandLogo size="nav" />
        </Link>
      </div>

      <div className="flex items-center justify-end gap-2 text-sm text-muted mb-6">
        <span className="hidden sm:inline">Already have an account?</span>
        <Link
          to="/login"
          className="rounded-xl border border-brand/30 px-3.5 py-1.5 text-sm font-semibold text-brand hover:bg-brand-soft"
        >
          Login
        </Link>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-ink">
        Create <span className="text-assure">Your</span> Account
      </h1>
      <p className="mt-1.5 text-sm text-muted">Get started with WebGuard for free</p>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={() => onOauth('Google')}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink hover:bg-canvas"
        >
          <GoogleIcon />
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => onOauth('GitHub')}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink hover:bg-canvas"
        >
          <GitHubIcon />
          Continue with GitHub
        </button>
      </div>

      <div className="my-5 flex items-center gap-3 text-xs font-semibold tracking-wide text-muted">
        <span className="h-px flex-1 bg-border" />
        OR
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {error && <div className="rounded-xl bg-down-soft px-3 py-2 text-sm text-down">{error}</div>}
        {oauthNote && (
          <div className="rounded-xl bg-brand-soft px-3 py-2 text-sm text-brand">{oauthNote}</div>
        )}

        <label className="block">
          <span className="text-sm font-medium text-ink">Full Name</span>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              <UserIcon className="h-4 w-4" />
            </span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded-xl border border-border bg-surface pl-10 pr-3 py-2.5 text-sm outline-none focus:border-brand"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Email Address</span>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              <MailIcon className="h-4 w-4" />
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full rounded-xl border border-border bg-surface pl-10 pr-3 py-2.5 text-sm outline-none focus:border-brand"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Password</span>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              <LockIcon className="h-4 w-4" />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className="w-full rounded-xl border border-border bg-surface pl-10 pr-10 py-2.5 text-sm outline-none focus:border-brand"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>
          <ul className="mt-2.5 space-y-1">
            <Req ok={checks.length} label="At least 8 characters" />
            <Req ok={checks.case} label="Includes uppercase & lowercase" />
            <Req ok={checks.number} label="Includes a number" />
          </ul>
        </label>

        <button
          type="submit"
          disabled={submitting || !isPasswordStrong(password)}
          className="btn-gradient mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Create Account'}
          {!submitting && <ArrowIcon className="h-4 w-4" />}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-muted leading-relaxed">
        By signing up, you agree to our{' '}
        <Link to="/terms" className="font-medium text-brand underline underline-offset-2">
          Terms of Service
        </Link>
        ,{' '}
        <Link to="/privacy" className="font-medium text-brand underline underline-offset-2">
          Privacy Policy
        </Link>{' '}
        and{' '}
        <Link to="/cookies" className="font-medium text-brand underline underline-offset-2">
          Cookie Policy
        </Link>
        .
      </p>

      <div className="mt-5 flex items-start gap-3 rounded-2xl bg-brand-soft/70 border border-brand/10 px-4 py-3">
        <span className="mt-0.5 text-brand">
          <ShieldIcon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">Your data is safe with us.</p>
          <p className="mt-0.5 text-xs text-muted leading-relaxed">
            We use industry-standard encryption to keep your data protected.
          </p>
        </div>
      </div>
    </AuthShell>
  );
}

function Req({ ok, label }) {
  return (
    <li className={`flex items-center gap-2 text-xs ${ok ? 'text-healthy' : 'text-muted'}`}>
      <span
        className={`grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold ${
          ok ? 'bg-healthy text-white' : 'border border-border bg-transparent text-transparent'
        }`}
      >
        ✓
      </span>
      {label}
    </li>
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

function UserIcon(p) {
  return (
    <svg {...iconProps(p.className)}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19a7 7 0 0 1 14 0" />
    </svg>
  );
}
function MailIcon(p) {
  return (
    <svg {...iconProps(p.className)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 7 9-7" />
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
function EyeIcon(p) {
  return (
    <svg {...iconProps(p.className)}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}
function EyeOffIcon(p) {
  return (
    <svg {...iconProps(p.className)}>
      <path d="M3 3l18 18M10.5 10.6a2.5 2.5 0 0 0 3 3M6.7 6.8C4.2 8.3 2.5 12 2.5 12s3.5 7 9.5 7c1.7 0 3.2-.4 4.5-1M14.1 9.1C15.8 9.8 17.5 11.2 19 12c0 0-1 2-3 3.7" />
    </svg>
  );
}
function ArrowIcon(p) {
  return (
    <svg {...iconProps(p.className)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
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
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6S8.9 6.2 12 6.2c1.8 0 2.9.7 3.6 1.4l2.4-2.4C16.7 3.9 14.6 3 12 3 6.5 3 2 7.5 2 13s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-1.7H12z"
      />
      <path fill="#34A853" d="M3.9 15.1l2.9-2.3C7.6 15.1 9.6 16.6 12 16.6c1.3 0 2.4-.4 3.2-1.1l3 2.3C16.8 19.4 14.6 20.4 12 20.4c-3.7 0-6.9-2.1-8.1-5.3z" opacity=".9" />
      <path fill="#FBBC05" d="M3.9 8.9C5.1 5.7 8.3 3.6 12 3.6c2 0 3.8.7 5.2 2.1l-2.5 2.5C13.8 7.4 13 7 12 7 9.6 7 7.6 8.5 6.8 10.6L3.9 8.9z" opacity=".9" />
      <path fill="#4285F4" d="M21.6 12.2c0-.6-.1-1.1-.2-1.6H12v3.6h5.4c-.3 1.3-1.1 2.2-2.2 2.9l3 2.3c1.8-1.6 2.4-4 2.4-7.2z" opacity=".95" />
    </svg>
  );
}
function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.9 9.6.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.4-3.4-1.4-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.2-4.6-5.1 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1 .8-.2 1.6-.3 2.4-.3s1.6.1 2.4.3c2-.1 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 4-2.3 4.8-4.6 5.1.4.3.7 1 .7 2v2.9c0 .3.2.6.7.5 4-1.3 6.9-5.1 6.9-9.6C22 6.6 17.5 2 12 2z" />
    </svg>
  );
}
