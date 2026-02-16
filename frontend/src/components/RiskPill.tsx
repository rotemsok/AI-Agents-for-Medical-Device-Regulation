import './RiskPill.css';

export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface RiskPillProps {
  severity: RiskSeverity;
}

export function RiskPill({ severity }: RiskPillProps) {
  const label = severity.charAt(0).toUpperCase() + severity.slice(1);

  return (
    <span className={`risk-pill risk-pill--${severity}`} aria-label={`Risk severity: ${label}`}>
      {label}
    </span>
  );
}
