import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { passwordErrorMessage } from '../utils/password';

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { preference, setPreference, theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAlertsEnabled(user.alerts_enabled !== false);
    }
  }, [user]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const body = {
        name,
        email,
        alerts_enabled: alertsEnabled,
      };
      if (password) {
        const pwdErr = passwordErrorMessage(password);
        if (pwdErr) {
          setError(pwdErr);
          setSaving(false);
          return;
        }
        body.password = password;
      }
      await updateProfile(body);
      setPassword('');
      setMessage('Settings saved.');
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-muted">Update your profile and email alert preference.</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 space-y-3">
        <div>
          <h2 className="font-semibold text-ink">Appearance</h2>
          <p className="mt-1 text-sm text-muted">
            Currently using {theme} mode
            {preference === 'system' ? ' (following system)' : ''}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'light', label: 'Light' },
            { id: 'dark', label: 'Dark' },
            { id: 'system', label: 'System' },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setPreference(opt.id)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                preference === opt.id
                  ? 'bg-primary text-white'
                  : 'border border-border text-ink hover:border-primary/40'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-surface p-6 space-y-4">
        <h2 className="font-semibold text-ink">Profile</h2>
        {error && <div className="rounded-xl bg-down-soft px-3 py-2 text-sm text-down">{error}</div>}
        {message && (
          <div className="rounded-xl bg-healthy-soft px-3 py-2 text-sm text-healthy">{message}</div>
        )}
        <label className="block">
          <span className="text-sm font-medium text-ink">Name</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
          />
          <span className="mt-1 block text-xs text-muted">
            Your login email. Set a different alert recipient under Integrations.
          </span>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">New password</span>
          <input
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current"
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
          />
          <span className="mt-1 block text-xs text-muted">
            8+ characters, upper &amp; lower case, and a number
          </span>
        </label>

        <label className="flex items-center justify-between gap-4 rounded-xl border border-border bg-canvas px-4 py-3">
          <div>
            <p className="text-sm font-medium text-ink">Email alerts when a site is down</p>
            <p className="text-xs text-muted mt-0.5">Recipient is set on the Integrations page</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={alertsEnabled}
            onClick={() => setAlertsEnabled((v) => !v)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
              alertsEnabled ? 'bg-brand' : 'bg-border'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white transition-transform ${
                alertsEnabled ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </label>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
