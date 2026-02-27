interface Props {
  label: string;
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'violet';
}

const styles = {
  blue: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
  green: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20',
  red: 'bg-red-500/10 text-red-500 border border-red-500/20',
  gray: 'bg-surface text-muted border border-b-border',
  violet: 'bg-violet-500/10 text-violet-500 border border-violet-500/20',
};

export default function Badge({ label, variant = 'gray' }: Props) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>
      {label}
    </span>
  );
}

export function statusBadge(status: string) {
  const map: Record<string, { label: string; variant: Props['variant'] }> = {
    CONFIRMED: { label: 'Confirmed', variant: 'blue' },
    PENDING: { label: 'Pending', variant: 'yellow' },
    COMPLETED: { label: 'Completed', variant: 'green' },
    CANCELLED: { label: 'Cancelled', variant: 'red' },
    NO_SHOW: { label: 'No Show', variant: 'gray' },
    CONNECTED: { label: 'Connected', variant: 'green' },
    DISCONNECTED: { label: 'Disconnected', variant: 'gray' },
    EXPIRED: { label: 'Expired', variant: 'red' },
    RECONNECTING: { label: 'Reconnecting', variant: 'yellow' },
    ERROR: { label: 'Error', variant: 'red' },
    FREE: { label: 'Free', variant: 'gray' },
    STARTER: { label: 'Starter', variant: 'blue' },
    BUSINESS: { label: 'Business', variant: 'violet' },
    PRO: { label: 'Pro', variant: 'green' },
  };
  const m = map[status] ?? { label: status, variant: 'gray' as const };
  return <Badge label={m.label} variant={m.variant} />;
}
