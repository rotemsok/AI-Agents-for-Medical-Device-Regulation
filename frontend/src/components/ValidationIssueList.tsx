import './ValidationIssueList.css';

export interface ValidationIssue {
  id: string;
  field: string;
  message: string;
  href?: string;
}

export interface ValidationIssueListProps {
  issues: ValidationIssue[];
  title?: string;
}

export function ValidationIssueList({ issues, title = 'Please resolve the following validation issues:' }: ValidationIssueListProps) {
  if (!issues.length) return null;

  return (
    <section
      className="validation-issue-list"
      role="alert"
      aria-live="assertive"
      aria-labelledby="validation-issue-list-title"
      tabIndex={-1}
    >
      <h3 id="validation-issue-list-title" className="validation-issue-list__title">
        {title}
      </h3>
      <ul className="validation-issue-list__items">
        {issues.map((issue) => (
          <li key={issue.id} className="validation-issue-list__item">
            <strong className="validation-issue-list__field">{issue.field}</strong>
            {issue.href ? (
              <a href={issue.href} className="validation-issue-list__link">
                {issue.message}
              </a>
            ) : (
              <span>{issue.message}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
