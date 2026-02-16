import { FormEvent, useMemo, useState } from 'react';
import {
  EvidenceObject,
  StatementCandidate,
  StatementValidationResult,
  validateEvidenceStatements,
} from '../lib/api';

const initialEvidence: EvidenceObject[] = [
  {
    id: 'EV-001',
    source: 'Clinical protocol',
    version: '1.0',
    owner: 'Clinical lead',
    timestamp: new Date().toISOString(),
    jurisdiction_relevance: ['US', 'EU'],
    confidence: 'high',
  },
  {
    id: 'EV-002',
    source: 'Bench performance report',
    version: '2.1',
    owner: 'Systems engineer',
    timestamp: new Date().toISOString(),
    jurisdiction_relevance: ['US'],
    confidence: 'medium',
  },
];

const initialStatements: StatementCandidate[] = [
  { statement: 'Device sensitivity target is achievable.', evidence_ids: ['EV-001'] },
  { statement: 'Risk control RC-17 is fully verified.', evidence_ids: ['EV-002'] },
];

export function EvidenceStatementsPage() {
  const [evidenceObjects, setEvidenceObjects] = useState<EvidenceObject[]>(initialEvidence);
  const [statements, setStatements] = useState<StatementCandidate[]>(initialStatements);
  const [results, setResults] = useState<StatementValidationResult[] | null>(null);
  const [error, setError] = useState('');

  const evidenceIds = useMemo(() => evidenceObjects.map((entry) => entry.id), [evidenceObjects]);

  const updateStatementEvidence = (statementIndex: number, evidenceId: string, checked: boolean) => {
    setStatements((current) =>
      current.map((statement, index) => {
        if (index !== statementIndex) {
          return statement;
        }
        const nextIds = checked
          ? [...statement.evidence_ids, evidenceId]
          : statement.evidence_ids.filter((id) => id !== evidenceId);
        return { ...statement, evidence_ids: Array.from(new Set(nextIds)) };
      }),
    );
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      const response = await validateEvidenceStatements({ statements, evidence_objects: evidenceObjects });
      setResults(response);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : 'Unable to validate statements');
    }
  };

  return (
    <section>
      <h2>Evidence statements validation</h2>
      <form onSubmit={submit} className="panel-stack">
        <div className="split-view">
          <div className="panel">
            <h3>Claims</h3>
            {statements.map((statement, index) => (
              <label key={`${statement.statement}-${index}`}>
                Statement {index + 1}
                <input
                  value={statement.statement}
                  onChange={(event) =>
                    setStatements((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, statement: event.target.value } : item,
                      ),
                    )
                  }
                />
              </label>
            ))}
          </div>

          <div className="panel">
            <h3>Evidence index + links</h3>
            {evidenceObjects.map((evidence, evidenceIndex) => (
              <div key={evidence.id} className="evidence-card">
                <label>
                  Evidence ID
                  <input
                    value={evidence.id}
                    onChange={(event) =>
                      setEvidenceObjects((current) =>
                        current.map((entry, index) =>
                          index === evidenceIndex ? { ...entry, id: event.target.value } : entry,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  Source
                  <input
                    value={evidence.source}
                    onChange={(event) =>
                      setEvidenceObjects((current) =>
                        current.map((entry, index) =>
                          index === evidenceIndex ? { ...entry, source: event.target.value } : entry,
                        ),
                      )
                    }
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3>Claim/evidence linking matrix</h3>
          {statements.map((statement, statementIndex) => (
            <div key={`link-${statementIndex}`} className="link-row">
              <strong>{statement.statement || `Statement ${statementIndex + 1}`}</strong>
              <div className="checkbox-row">
                {evidenceIds.map((id) => (
                  <label key={`${statementIndex}-${id}`} className="checkbox-pill">
                    <input
                      type="checkbox"
                      checked={statement.evidence_ids.includes(id)}
                      onChange={(event) =>
                        updateStatementEvidence(statementIndex, id, event.currentTarget.checked)
                      }
                    />
                    {id}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button type="submit">Validate evidence links</button>
      </form>
      {error && <p className="error">{error}</p>}
      {results && (
        <div className="panel">
          <h3>Validation results</h3>
          <ul>
            {results.map((result, index) => (
              <li key={`${result.statement}-${index}`}>
                <strong>{result.status.toUpperCase()}</strong> — {result.statement}
                {result.confidence ? ` (confidence: ${result.confidence})` : ''}
                {result.reason ? `: ${result.reason}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
