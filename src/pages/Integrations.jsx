import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { useToast } from '../context/ToastContext';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

export default function Integrations() {
  const { showToast } = useToast();
  const [mail, setMail] = useState(null);
  const [integ, setInteg] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [m, i] = await Promise.all([
        api('/api/alerts/mail-status'),
        api('/api/integrations'),
      ]);
      setMail(m);
      setInteg(i.integrations);
      setRecipient(m.alert_email || m.user_email || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveIntegrations = async () => {
    setSaving(true);
    try {
      const data = await api('/api/integrations', { method: 'PATCH', body: integ });
      setInteg(data.integrations);
      showToast('Integrations saved.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveRecipient = async () => {
    try {
      await api('/api/alerts/recipient', {
        method: 'PATCH',
        body: { email: recipient.trim().toLowerCase() },
      });
      showToast('Alert recipient saved.', 'success');
      await load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const testChannel = async (channel) => {
    try {
      await api('/api/integrations/test', { method: 'POST', body: { channel } });
      showToast('Test sent.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const enablePush = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        showToast('Push not supported in this browser.', 'error');
        return;
      }
      const keyData = await api('/api/push/vapid-public-key');
      const reg = await navigator.serviceWorker.register('/sw.js');
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        showToast('Notification permission denied.', 'error');
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
      });
      await api('/api/push/subscribe', { method: 'POST', body: { subscription: sub.toJSON() } });
      showToast('Browser notifications enabled.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to enable push', 'error');
    }
  };

  if (loading) return <p className="text-muted">Loading…</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Integrations</h1>
        <p className="mt-1 text-sm text-muted">
          Email, Slack, Discord, webhooks, and browser push for down alerts.
        </p>
      </div>

      {error && <div className="rounded-xl bg-down-soft px-3 py-2 text-sm text-down">{error}</div>}

      <section className="rounded-2xl border border-border bg-surface p-5 space-y-3">
        <h2 className="font-semibold text-ink">Email alerts</h2>
        <p className="text-xs text-muted">
          SMTP {mail?.configured ? 'configured' : 'needed'} · Alerts{' '}
          {mail?.alerts_enabled ? 'enabled' : 'disabled'}
        </p>
        <label className="block">
          <span className="text-sm font-medium">Recipient Email</span>
          <input
            type="email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-brand"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={saveRecipient}
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold"
          >
            Save recipient
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                await api('/api/alerts/test-email', {
                  method: 'POST',
                  body: { to: recipient },
                });
                showToast('Test email sent successfully.', 'success');
              } catch (err) {
                showToast(err.message, 'error');
              }
            }}
            className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white"
          >
            Send Test Email
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 space-y-4">
        <h2 className="font-semibold text-ink">Webhooks</h2>
        {[
          { key: 'slack', label: 'Slack webhook', urlKey: 'slack_webhook_url', enKey: 'slack_enabled' },
          {
            key: 'discord',
            label: 'Discord webhook',
            urlKey: 'discord_webhook_url',
            enKey: 'discord_enabled',
          },
          {
            key: 'webhook',
            label: 'Custom webhook',
            urlKey: 'custom_webhook_url',
            enKey: 'webhook_enabled',
          },
        ].map((c) => (
          <div key={c.key} className="space-y-2 rounded-xl border border-border p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-ink">{c.label}</p>
              <button
                type="button"
                role="switch"
                aria-checked={Boolean(integ?.[c.enKey])}
                onClick={() =>
                  setInteg((prev) => ({ ...prev, [c.enKey]: !prev?.[c.enKey] }))
                }
                className={`relative h-7 w-12 rounded-full ${
                  integ?.[c.enKey] ? 'bg-primary' : 'bg-border'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white transition-transform ${
                    integ?.[c.enKey] ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
            <input
              value={integ?.[c.urlKey] || ''}
              onChange={(e) => setInteg((prev) => ({ ...prev, [c.urlKey]: e.target.value }))}
              placeholder="https://..."
              className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-brand"
            />
            <button
              type="button"
              onClick={() => testChannel(c.key)}
              className="text-sm font-medium text-brand"
            >
              Send test
            </button>
          </div>
        ))}
        <button
          type="button"
          disabled={saving}
          onClick={saveIntegrations}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save webhooks'}
        </button>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 space-y-3">
        <h2 className="font-semibold text-ink">Browser push notifications</h2>
        <p className="text-sm text-muted">
          Requires VAPID keys in backend/.env. Enables mobile/desktop notifications.
        </p>
        <button
          type="button"
          onClick={enablePush}
          className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white"
        >
          Enable browser notifications
        </button>
      </section>
    </div>
  );
}
