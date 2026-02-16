import './TraceabilityChip.css';

export type TraceabilityChipType = 'requirement' | 'evidence';

export interface TraceabilityChipProps {
  type: TraceabilityChipType;
  id: string;
  href?: string;
}

export function TraceabilityChip({ type, id, href }: TraceabilityChipProps) {
  const prefix = type === 'requirement' ? 'REQ' : 'EVD';
  const content = (
    <>
      <span className="traceability-chip__prefix">{prefix}</span>
      <span className="traceability-chip__id">{id}</span>
    </>
  );

  if (href) {
    return (
      <a className="traceability-chip" href={href}>
        {content}
      </a>
    );
  }

  return <span className="traceability-chip">{content}</span>;
}
