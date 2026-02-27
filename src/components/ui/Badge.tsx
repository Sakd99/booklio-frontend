import { useI18n } from '../../store/i18n.store';

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

const statusMap: Record<string, { key: string; variant: Props['variant'] }> = {
  CONFIRMED: { key: 'statusConfirmed', variant: 'blue' },
  PENDING: { key: 'statusPending', variant: 'yellow' },
  COMPLETED: { key: 'statusCompleted', variant: 'green' },
  CANCELLED: { key: 'statusCancelled', variant: 'red' },
  NO_SHOW: { key: 'statusNoShow', variant: 'gray' },
  CONNECTED: { key: 'connected', variant: 'green' },
  DISCONNECTED: { key: 'disconnected', variant: 'gray' },
  EXPIRED: { key: 'expired', variant: 'red' },
  RECONNECTING: { key: 'reconnecting', variant: 'yellow' },
  ERROR: { key: 'error', variant: 'red' },
  FREE: { key: 'free', variant: 'gray' },
  STARTER: { key: 'starter', variant: 'blue' },
  BUSINESS: { key: 'business', variant: 'violet' },
  PRO: { key: 'pro', variant: 'green' },
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const m = statusMap[status];
  const label = m ? t(m.key as any) : status;
  const variant = m?.variant ?? 'gray';
  return <Badge label={label} variant={variant} />;
}
