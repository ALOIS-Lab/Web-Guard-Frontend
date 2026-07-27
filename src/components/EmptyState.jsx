export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center">
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {description && <p className="mt-2 text-sm text-muted max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
