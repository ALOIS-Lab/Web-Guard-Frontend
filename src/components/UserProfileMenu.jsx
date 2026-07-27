import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function initials(name, email) {
  const source = (name || email || '?').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

/**
 * Header profile control — avatar + dropdown with name, email, log out.
 */
export default function UserProfileMenu({ compact = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('pointerdown', onPointer);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-2.5 hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open profile menu"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-xs font-bold text-white">
          {initials(user.name, user.email)}
        </span>
        {!compact ? (
          <span className="hidden sm:block max-w-[120px] truncate text-left text-sm font-medium text-ink">
            {user.name || 'Account'}
          </span>
        ) : null}
        <span className="text-muted text-xs" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-ink truncate">{user.name || 'User'}</p>
            <p className="mt-0.5 text-xs text-muted truncate">{user.email}</p>
          </div>
          <div className="py-1">
            <Link
              role="menuitem"
              to="/app/settings"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-ink hover:bg-canvas"
            >
              Profile &amp; settings
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="block w-full px-4 py-2.5 text-left text-sm font-medium text-brand hover:bg-canvas"
            >
              Log out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
