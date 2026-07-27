const styles = {
  healthy: 'bg-healthy-soft text-healthy',
  slow: 'bg-checking-soft text-checking',
  partial: 'bg-checking-soft text-checking',
  down: 'bg-down-soft text-down',
  timeout: 'bg-down-soft text-down',
  failed: 'bg-down-soft text-down',
  checking: 'bg-checking-soft text-checking',
};

const labels = {
  healthy: 'Healthy',
  slow: 'Slow',
  partial: 'Partially Available',
  down: 'Down',
  timeout: 'Timeout',
  failed: 'Failed',
  checking: 'Checking',
};

export default function StatusBadge({ status }) {
  const key = (status || 'checking').toLowerCase();
  const cls = styles[key] || styles.checking;
  const label = labels[key] || status || 'Unknown';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      <span className="relative h-1.5 w-1.5 rounded-full bg-current pulse-dot" />
      {label}
    </span>
  );
}
