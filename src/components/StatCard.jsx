export default function StatCard({ label, value, tone = 'default' }) {
  const tones = {
    default: 'text-ink',
    healthy: 'text-healthy',
    down: 'text-down',
    checking: 'text-checking',
    info: 'text-info',
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-2 text-3xl font-semibold tracking-tight ${tones[tone] || tones.default}`}>
        {value}
      </p>
    </div>
  );
}
