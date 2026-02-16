import './ApprovalTimeline.css';
import { StatusBadge, StatusBadgeState } from './StatusBadge';

export interface ApprovalTimelineItem {
  id: string;
  stage: string;
  approver: string;
  timestamp: string;
  status: StatusBadgeState;
  note?: string;
}

export interface ApprovalTimelineProps {
  title?: string;
  items: ApprovalTimelineItem[];
}

export function ApprovalTimeline({ title = 'Approval timeline', items }: ApprovalTimelineProps) {
  return (
    <section className="approval-timeline" aria-label={title}>
      <h3 className="approval-timeline__title">{title}</h3>
      <ol className="approval-timeline__list">
        {items.map((item) => (
          <li key={item.id} className="approval-timeline__item" tabIndex={0}>
            <div className="approval-timeline__header">
              <span className="approval-timeline__stage">{item.stage}</span>
              <StatusBadge status={item.status} />
            </div>
            <p className="approval-timeline__meta">
              <span>{item.approver}</span>
              <time dateTime={item.timestamp}>{new Date(item.timestamp).toLocaleString()}</time>
            </p>
            {item.note ? <p className="approval-timeline__note">{item.note}</p> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
