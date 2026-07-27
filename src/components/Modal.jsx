import { useEffect } from 'react';

export default function Modal({ open, title, onClose, children, wide }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${wide ? 'max-w-xl' : 'max-w-md'} rounded-2xl border border-border bg-surface p-6 shadow-lg`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-muted hover:bg-canvas hover:text-ink"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
