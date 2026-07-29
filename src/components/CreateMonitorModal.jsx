import { useEffect, useId, useMemo, useState } from 'react';

const INTERVAL_OPTIONS = [
  { value: 0.5, label: '30 sec' },
  { value: 1, label: '1 min' },
  { value: 2, label: '2 min' },
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
];

const REGIONS = [
  { value: 'us-east', label: 'US East' },
  { value: 'us-west', label: 'US West' },
  { value: 'eu-west', label: 'EU West' },
  { value: 'ap-south', label: 'Asia Pacific' },
];

const NOTIFY_CHANNELS = [
  { value: 'email', label: 'Email' },
  { value: 'webhook', label: 'Webhook' },
  { value: 'slack', label: 'Slack' },
];

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function isValidUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return false;
  try {
    const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const u = new URL(withProto);
    return ['http:', 'https:'].includes(u.protocol) && Boolean(u.hostname);
  } catch {
    return false;
  }
}

function intervalLabel(value) {
  return INTERVAL_OPTIONS.find((o) => o.value === Number(value))?.label || `Every ${value} min`;
}

function emptyForm() {
  return {
    url: '',
    ownerEmail: '',
    intervalMin: 1,
    timeoutSec: '15',
    retries: '1',
    expectedStatus: '200',
    region: 'us-east',
    notifyChannel: 'email',
  };
}

function formFromMonitor(monitor) {
  if (!monitor) return emptyForm();
  const cfg = monitor.monitor_config || {};
  return {
    ...emptyForm(),
    url: monitor.url || '',
    ownerEmail: monitor.owner_email || '',
    intervalMin: Number(monitor.interval_min) || 1,
    timeoutSec: String(cfg.timeout_sec ?? 15),
    retries: String(cfg.retries ?? 1),
    expectedStatus: String(cfg.expected_status ?? 200),
    region: cfg.region || 'us-east',
    notifyChannel: cfg.notify_channel || 'email',
  };
}

function FieldHint({ state, okText, badText }) {
  if (state === 'idle') return null;
  if (state === 'ok') {
    return <p className="mt-1.5 text-xs font-medium text-healthy">✓ {okText}</p>;
  }
  return <p className="mt-1.5 text-xs font-medium text-down">{badText}</p>;
}

function Field({ label, children, hint, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint}
    </label>
  );
}

const inputClass = (state) =>
  `w-full rounded-2xl border bg-canvas/60 px-3.5 py-3 text-sm text-ink outline-none transition focus:bg-surface focus:ring-2 ${
    state === 'ok'
      ? 'border-healthy/50 focus:border-healthy focus:ring-healthy/20'
      : state === 'bad'
        ? 'border-down/50 focus:border-down focus:ring-down/20'
        : 'border-border focus:border-brand focus:ring-brand/20'
  }`;

export default function CreateMonitorModal({
  open,
  onClose,
  onSubmit,
  saving,
  error,
  initialMonitor = null,
}) {
  const titleId = useId();
  const [form, setForm] = useState(emptyForm);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const isEdit = Boolean(initialMonitor?.id);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return undefined;
    }
    setForm(initialMonitor?.id ? formFromMonitor(initialMonitor) : emptyForm());
    setAdvancedOpen(false);
    const t = requestAnimationFrame(() => setEntered(true));
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(t);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialMonitor?.id]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const urlState = !form.url.trim() ? 'idle' : isValidUrl(form.url) ? 'ok' : 'bad';
  const emailState = !form.ownerEmail.trim()
    ? 'idle'
    : isValidEmail(form.ownerEmail)
      ? 'ok'
      : 'bad';

  const isValid = useMemo(
    () => isValidUrl(form.url) && isValidEmail(form.ownerEmail),
    [form.url, form.ownerEmail]
  );

  const previewTarget = form.url.trim() || 'https://example.com';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid || saving) return;
    onSubmit({
      monitor_type: 'http',
      url: form.url.trim(),
      owner_email: form.ownerEmail.trim().toLowerCase(),
      interval_min: Number(form.intervalMin),
      timeout_sec: Number(form.timeoutSec) || 15,
      retries: Number(form.retries) || 0,
      expected_status: Number(form.expectedStatus) || 200,
      region: form.region,
      notify_channel: form.notifyChannel,
    });
  };

  if (!open) return null;

  return (
    <div
      className={`create-monitor-overlay fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6 ${
        entered ? 'create-monitor-overlay--in' : ''
      }`}
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`create-monitor-panel relative flex max-h-[min(920px,94vh)] w-full max-w-[820px] flex-col overflow-hidden rounded-[22px] border border-border bg-surface shadow-[0_24px_80px_rgba(15,23,42,0.22)] ${
          entered ? 'create-monitor-panel--in' : ''
        }`}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-5 sm:px-8">
          <div>
            <h2 id={titleId} className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              {isEdit ? 'Edit Website Monitor' : 'Create Website Monitor'}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {isEdit
                ? 'Update the URL, interval, or alert settings for this site.'
                : 'Monitor any HTTP or HTTPS website for uptime and performance.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-muted transition hover:border-brand/30 hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <CloseIcon />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <section aria-label="Configuration" className="min-w-0 space-y-4">
                <Field
                  label="Website URL"
                  htmlFor="cm-url"
                  hint={
                    <FieldHint state={urlState} okText="Valid URL" badText="Invalid URL" />
                  }
                >
                  <input
                    id="cm-url"
                    value={form.url}
                    onChange={(e) => setField('url', e.target.value)}
                    placeholder="https://example.com"
                    autoComplete="url"
                    className={inputClass(urlState)}
                  />
                </Field>

                <Field label="Check interval" htmlFor="cm-interval">
                  <select
                    id="cm-interval"
                    value={form.intervalMin}
                    onChange={(e) => setField('intervalMin', Number(e.target.value))}
                    className={inputClass('idle')}
                  >
                    {INTERVAL_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Owner email"
                  htmlFor="cm-email"
                  hint={
                    <FieldHint
                      state={emailState}
                      okText="Valid email"
                      badText="Invalid email"
                    />
                  }
                >
                  <input
                    id="cm-email"
                    type="email"
                    value={form.ownerEmail}
                    onChange={(e) => setField('ownerEmail', e.target.value)}
                    placeholder="admin@example.com"
                    className={inputClass(emailState)}
                  />
                </Field>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setAdvancedOpen((v) => !v)}
                    aria-expanded={advancedOpen}
                    className="flex w-full items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-ink transition hover:border-brand/30"
                  >
                    Advanced settings
                    <span
                      className={`text-muted transition ${advancedOpen ? 'rotate-180' : ''}`}
                      aria-hidden
                    >
                      ▾
                    </span>
                  </button>
                  {advancedOpen ? (
                    <div className="mt-3 grid gap-4 rounded-2xl border border-border bg-canvas/40 p-4 sm:grid-cols-2">
                      <Field label="Retry count" htmlFor="cm-retries">
                        <select
                          id="cm-retries"
                          value={form.retries}
                          onChange={(e) => setField('retries', e.target.value)}
                          className={inputClass('idle')}
                        >
                          {[0, 1, 2, 3].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Timeout" htmlFor="cm-timeout">
                        <select
                          id="cm-timeout"
                          value={form.timeoutSec}
                          onChange={(e) => setField('timeoutSec', e.target.value)}
                          className={inputClass('idle')}
                        >
                          {[5, 10, 15, 30, 60].map((s) => (
                            <option key={s} value={s}>
                              {s} seconds
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Expected status" htmlFor="cm-status">
                        <input
                          id="cm-status"
                          type="number"
                          value={form.expectedStatus}
                          onChange={(e) => setField('expectedStatus', e.target.value)}
                          className={inputClass('idle')}
                        />
                      </Field>
                      <Field label="Region" htmlFor="cm-region">
                        <select
                          id="cm-region"
                          value={form.region}
                          onChange={(e) => setField('region', e.target.value)}
                          className={inputClass('idle')}
                        >
                          {REGIONS.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Notification channel" htmlFor="cm-notify">
                        <select
                          id="cm-notify"
                          value={form.notifyChannel}
                          onChange={(e) => setField('notifyChannel', e.target.value)}
                          className={inputClass('idle')}
                        >
                          {NOTIFY_CHANNELS.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  ) : null}
                </div>
              </section>

              <aside aria-label="Live preview" className="min-w-0 lg:sticky lg:top-0 lg:self-start">
                <div className="overflow-hidden rounded-[20px] border border-border bg-gradient-to-br from-brand-soft/80 via-surface to-accent-soft/50 p-[1px] shadow-sm">
                  <div className="rounded-[19px] bg-surface/95 p-5 backdrop-blur">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Preview
                      </p>
                      <span className="rounded-full bg-healthy-soft px-2 py-0.5 text-[10px] font-semibold text-healthy">
                        Live
                      </span>
                    </div>
                    <div className="mt-5 space-y-4">
                      <PreviewRow label="Monitor type">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
                          <span aria-hidden>🌐</span> HTTP / HTTPS Website
                        </span>
                      </PreviewRow>
                      <PreviewRow label="Target">
                        <span className="break-all font-medium text-ink">{previewTarget}</span>
                      </PreviewRow>
                      <PreviewRow label="Checks">
                        <ul className="space-y-1">
                          {['Uptime', 'Status code', 'Response time'].map((c) => (
                            <li key={c} className="flex items-center gap-1.5 text-sm text-ink">
                              <span className="text-healthy">✓</span> {c}
                            </li>
                          ))}
                        </ul>
                      </PreviewRow>
                      <PreviewRow label="Interval">
                        <span className="font-medium text-ink">
                          Every {intervalLabel(form.intervalMin)}
                        </span>
                      </PreviewRow>
                      <PreviewRow label="Alert channel">
                        <span className="font-medium capitalize text-ink">
                          {form.notifyChannel || 'Email'}
                        </span>
                      </PreviewRow>
                    </div>
                  </div>
                </div>
              </aside>
            </div>

            {error ? (
              <div className="mt-5 rounded-2xl border border-down/30 bg-down-soft px-4 py-3 text-sm text-down">
                {error}
              </div>
            ) : null}
          </div>

          <footer className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-border bg-surface/95 px-6 py-4 sm:px-8">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-border px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || saving}
              className="create-monitor-cta inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-white transition enabled:hover:brightness-110 enabled:hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              {saving
                ? isEdit
                  ? 'Saving…'
                  : 'Starting…'
                : isEdit
                  ? 'Save Changes'
                  : 'Start Monitoring'}
              {!saving ? <ArrowIcon /> : null}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

function PreviewRow({ label, children }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
