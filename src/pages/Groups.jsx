import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api('/api/groups');
      setGroups(data.groups || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addGroup = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api('/api/groups', { method: 'POST', body: { name: name.trim() } });
      setName('');
      setOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this group?')) return;
    try {
      await api(`/api/groups/${id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Groups</h1>
          <p className="mt-1 text-sm text-muted">Organize websites into named groups.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"
        >
          New group
        </button>
      </div>

      {error && <div className="rounded-xl bg-down-soft px-3 py-2 text-sm text-down">{error}</div>}

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : groups.length === 0 ? (
        <EmptyState
          title="No groups yet"
          description="Create a group, then assign websites from the Add website form."
          action={
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"
            >
              New group
            </button>
          }
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {groups.map((g) => (
            <li key={g.id} className="rounded-2xl border border-border bg-surface p-5">
              <p className="font-semibold text-ink">{g.name}</p>
              <p className="mt-1 text-xs text-muted">{g.website_count || 0} websites</p>
              <button
                type="button"
                onClick={() => remove(g.id)}
                className="mt-3 text-sm font-medium text-down"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal open={open} title="New group" onClose={() => setOpen(false)}>
        <form onSubmit={addGroup} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-border px-4 py-2 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
