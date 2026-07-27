import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import CreateMonitorModal from '../components/CreateMonitorModal';

function formatWhen(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function Websites() {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState(null);
  const [modalError, setModalError] = useState('');
  const [saving, setSaving] = useState(false);
  const [scanningId, setScanningId] = useState(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const w = await api('/api/websites');
      // HTTP / HTTPS monitors only
      const list = (w.websites || []).filter((site) => (site.monitor_type || 'http') === 'http');
      setWebsites(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const openCreate = () => {
    setEditingMonitor(null);
    setModalError('');
    setModalOpen(true);
  };

  const openEdit = (monitor) => {
    setEditingMonitor(monitor);
    setModalError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingMonitor(null);
    setModalError('');
  };

  const saveMonitor = async (payload) => {
    setModalError('');
    setSaving(true);
    try {
      if (editingMonitor?.id) {
        await api(`/api/websites/${editingMonitor.id}`, { method: 'PATCH', body: payload });
      } else {
        await api('/api/websites', { method: 'POST', body: payload });
      }
      closeModal();
      await load();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Remove this website from monitoring?')) return;
    try {
      await api(`/api/websites/${id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const scanNow = async (id) => {
    setScanningId(id);
    setError('');
    try {
      await api(`/api/websites/${id}/scan`, { method: 'POST' });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setScanningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Monitors</h1>
          <p className="mt-1 text-sm text-muted">HTTP and HTTPS websites you are actively monitoring.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Create monitor
        </button>
      </div>

      {error && <div className="rounded-xl bg-down-soft px-3 py-2 text-sm text-down">{error}</div>}

      {loading ? (
        <p className="text-muted">Loading monitors…</p>
      ) : websites.length === 0 ? (
        <EmptyState
          title="No websites yet"
          description="Add an HTTP or HTTPS URL to start monitoring uptime and performance."
          action={
            <button
              type="button"
              onClick={openCreate}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"
            >
              Create monitor
            </button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">URL</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last checked</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {websites.map((w) => (
                <tr key={w.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-ink max-w-[320px]">
                    <Link to={`/app/websites/${w.id}`} className="hover:text-primary break-all">
                      {w.url}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={w.status} />
                  </td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">
                    {formatWhen(w.last_checked)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        disabled={scanningId === w.id}
                        onClick={() => scanNow(w.id)}
                        className="rounded-lg border border-border px-3 py-1.5 font-medium hover:border-primary/40 disabled:opacity-50"
                      >
                        {scanningId === w.id ? 'Scanning…' : 'Scan now'}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(w)}
                        className="rounded-lg border border-border px-3 py-1.5 font-medium text-brand hover:border-brand/40 hover:bg-brand-soft"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(w.id)}
                        className="rounded-lg border border-border px-3 py-1.5 font-medium text-down hover:bg-down-soft"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateMonitorModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={saveMonitor}
        saving={saving}
        error={modalError}
        initialMonitor={editingMonitor}
      />
    </div>
  );
}
