import { FormEvent, useState } from 'react';
import { IntakePayload, IntakeValidationResponse, validateIntake } from '../lib/api';
import { toLineBlock, toLines } from '../lib/formats';

const defaultPayload: IntakePayload = {
  device_class: 'II',
  intended_use: {
    clinical_condition: 'Cardiac rhythm irregularity monitoring',
    target_population: 'Adults at risk of atrial fibrillation',
    intended_user: 'Cardiologists and trained technicians',
    use_environment: 'Outpatient clinic and home',
    primary_output_and_decision_impact: 'Flags probable events for clinical review',
    exclusions_or_contraindications: 'Not for pediatric use',
  },
  technology: {
    product_modality: 'Wearable ECG patch',
    primary_technical_mechanism: 'Continuous ECG capture and algorithmic triage',
    data_inputs_and_dependencies: ['Single-lead ECG', 'Patient metadata'],
    ai_ml_behavior: 'Locked model',
  },
  software_hardware_scope: {
    software_components: ['Signal processing service', 'Clinician dashboard'],
    hardware_components: ['ECG patch sensor'],
    external_interfaces: ['EHR API'],
    cybersecurity_trust_boundaries: ['Cloud ingestion boundary', 'EHR integration boundary'],
  },
  target_markets: ['US', 'EU'],
  primary_launch_market: 'US',
  risk_class: [
    {
      market: 'US',
      proposed_classification: 'Class II',
      rationale: 'Moderate risk with predicate pathway',
      confidence: 'medium',
      open_questions: ['Predicate comparability'],
      mitigation_plan: 'Schedule pre-sub meeting',
    },
    {
      market: 'EU',
      proposed_classification: 'Class IIa',
      rationale: 'Diagnostic support use',
      confidence: 'high',
      open_questions: [],
      mitigation_plan: null,
    },
  ],
  clinical_strategy: {
    evidence_sources: ['Prospective usability study', 'Retrospective ECG dataset'],
    study_design_assumptions: ['Site enrollment target met in 8 weeks'],
    primary_endpoints: ['Sensitivity > 92%'],
    acceptance_criteria: ['No severe device-related adverse events'],
    gaps_and_mitigation_plan: 'Expand enrollment diversity with additional sites',
    lifecycle_monitoring_plan: 'Quarterly drift checks on production telemetry',
  },
  manufacturing_context: {
    organization_model: 'Hybrid design-transfer with contract manufacturer',
    qms_status: 'ISO 13485 certified',
    critical_suppliers: ['Sensor wafer supplier'],
    process_controls: ['Incoming quality checks', 'Final calibration verification'],
    post_market_change_control_owner: 'Regulatory affairs lead',
  },
};

export function IntakeValidationPage() {
  const [payload, setPayload] = useState<IntakePayload>(defaultPayload);
  const [result, setResult] = useState<IntakeValidationResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response = await validateIntake(payload);
      setResult(response);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : 'Unknown validation error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <h2>Intake validation</h2>
      <form onSubmit={submit} className="panel-stack">
        <div className="panel">
          <h3>Core intake metadata</h3>
          <label>
            Device class
            <select
              value={payload.device_class}
              onChange={(event) => setPayload({ ...payload, device_class: event.target.value as IntakePayload['device_class'] })}
            >
              <option value="I">I</option>
              <option value="II">II</option>
              <option value="III">III</option>
              <option value="Unclassified">Unclassified</option>
            </select>
          </label>
          <label>
            Target markets (one per line)
            <textarea
              value={toLineBlock(payload.target_markets)}
              onChange={(event) => setPayload({ ...payload, target_markets: toLines(event.target.value) })}
            />
          </label>
          <label>
            Primary launch market
            <input
              value={payload.primary_launch_market}
              onChange={(event) => setPayload({ ...payload, primary_launch_market: event.target.value })}
            />
          </label>
        </div>

        <div className="panel">
          <h3>Intended use (required keys from IntakePayload)</h3>
          {Object.entries(payload.intended_use).map(([key, value]) => (
            <label key={key}>
              {key}
              <input
                value={value}
                onChange={(event) =>
                  setPayload({
                    ...payload,
                    intended_use: { ...payload.intended_use, [key]: event.target.value },
                  })
                }
              />
            </label>
          ))}
        </div>

        <div className="panel">
          <h3>Technology + scope sections</h3>
          <label>
            Product modality
            <input
              value={String(payload.technology.product_modality ?? '')}
              onChange={(event) =>
                setPayload({ ...payload, technology: { ...payload.technology, product_modality: event.target.value } })
              }
            />
          </label>
          <label>
            Primary technical mechanism
            <input
              value={String(payload.technology.primary_technical_mechanism ?? '')}
              onChange={(event) =>
                setPayload({
                  ...payload,
                  technology: { ...payload.technology, primary_technical_mechanism: event.target.value },
                })
              }
            />
          </label>
          <label>
            Data inputs and dependencies (one per line)
            <textarea
              value={toLineBlock((payload.technology.data_inputs_and_dependencies as string[]) ?? [])}
              onChange={(event) =>
                setPayload({
                  ...payload,
                  technology: { ...payload.technology, data_inputs_and_dependencies: toLines(event.target.value) },
                })
              }
            />
          </label>
          <label>
            AI/ML behavior
            <input
              value={String(payload.technology.ai_ml_behavior ?? '')}
              onChange={(event) =>
                setPayload({ ...payload, technology: { ...payload.technology, ai_ml_behavior: event.target.value } })
              }
            />
          </label>
        </div>

        <div className="panel">
          <h3>Risk, clinical strategy, manufacturing context</h3>
          <label>
            Risk classes (JSON array)
            <textarea
              value={JSON.stringify(payload.risk_class, null, 2)}
              onChange={(event) => {
                try {
                  setPayload({ ...payload, risk_class: JSON.parse(event.target.value) });
                } catch {
                  // keep current state until valid JSON
                }
              }}
            />
          </label>
          <label>
            Clinical primary endpoints (one per line)
            <textarea
              value={toLineBlock(payload.clinical_strategy.primary_endpoints)}
              onChange={(event) =>
                setPayload({
                  ...payload,
                  clinical_strategy: {
                    ...payload.clinical_strategy,
                    primary_endpoints: toLines(event.target.value),
                  },
                })
              }
            />
          </label>
          <label>
            Manufacturing controls (one per line)
            <textarea
              value={toLineBlock(payload.manufacturing_context.process_controls)}
              onChange={(event) =>
                setPayload({
                  ...payload,
                  manufacturing_context: {
                    ...payload.manufacturing_context,
                    process_controls: toLines(event.target.value),
                  },
                })
              }
            />
          </label>
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Validating...' : 'Run intake validation'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {result && (
        <div className="panel">
          <h3>Validation result: {result.valid ? 'Pass' : 'Issues detected'}</h3>
          {result.issues.length === 0 ? (
            <p>No issues found.</p>
          ) : (
            <ul>
              {result.issues.map((issue) => (
                <li key={issue.code}>
                  <strong>{issue.code}</strong>: {issue.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
