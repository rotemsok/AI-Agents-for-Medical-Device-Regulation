import './StatusBadge.css';

export type StatusBadgeState = 'approved' | 'missing-evidence' | 'blocked';

export interface StatusBadgeProps {
  status: StatusBadgeState;
  label?: string;
}

const STATUS_LABELS: Record<StatusBadgeState, string> = {
  approved: 'Approved',
  'missing-evidence': 'Missing evidence',
  blocked: 'Blocked',
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span
      className={`status-badge status-badge--${status}`}
      role="status"
      aria-label={label ?? STATUS_LABELS[status]}
    >
      {label ?? STATUS_LABELS[status]}
    </span>
  );
}
