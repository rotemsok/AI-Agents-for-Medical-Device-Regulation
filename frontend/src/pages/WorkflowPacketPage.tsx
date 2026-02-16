import { FormEvent, useState } from 'react';
import { HandoffPacket, PacketValidationResponse, validateWorkflowPacket } from '../lib/api';
import { toLineBlock, toLines } from '../lib/formats';

const defaultPacket: HandoffPacket = {
  packet_id: 'PKT-001',
  title: 'Design-to-Clinical Handoff',
  owner_agent: 'requirements-agent',
  target_agent: 'clinical-agent',
  source_requirements: [{ id: 'REQ-11', version: '3.0' }],
  risk_controls: [
    { risk_id: 'R-12', control_id: 'RC-17', verified: true, severity: 'high' },
    { risk_id: 'R-30', control_id: 'RC-42', verified: true, severity: 'medium' },
  ],
  acceptance_criteria: [
    {
      id: 'AC-001',
      statement: 'Sensitivity meets agreed threshold',
      verification_method: 'Clinical validation',
      evidence_ref: 'EV-001',
    },
  ],
  evidence_index: ['EV-001', 'EV-002'],
  required_approvers: ['quality', 'regulatory'],
  approval_log: [
    {
      signer_role: 'quality',
      decision: 'approved',
      timestamp: new Date().toISOString(),
    },
    {
      signer_role: 'regulatory',
      decision: 'approved',
      timestamp: new Date().toISOString(),
    },
  ],
  blocker_defects_open: 0,
  approved_exception: false,
};

const acceptanceChecks = [
  { code: 'PACKET-AC-EVIDENCE', label: 'Acceptance criteria reference evidence in packet index' },
  { code: 'PACKET-HIGH-RISK-CONTROLS', label: 'High/critical risks must have verified controls' },
  { code: 'PACKET-REQUIRED-APPROVALS', label: 'All required approvers must have approved decisions' },
  { code: 'PACKET-BLOCKER-DEFECTS', label: 'Blocker defects require an approved exception' },
];

export function WorkflowPacketPage() {
  const [packet, setPacket] = useState<HandoffPacket>(defaultPacket);
  const [result, setResult] = useState<PacketValidationResponse | null>(null);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      const response = await validateWorkflowPacket(packet);
      setResult(response);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : 'Packet validation failed');
    }
  };

  const failedCodes = new Set(result?.issues.map((issue) => issue.code) ?? []);

  return (
    <section>
      <h2>Workflow handoff packet validation</h2>
      <form onSubmit={submit} className="panel-stack">
        <div className="panel">
          <h3>Packet summary</h3>
          <label>
            Packet ID
            <input value={packet.packet_id} onChange={(event) => setPacket({ ...packet, packet_id: event.target.value })} />
          </label>
          <label>
            Evidence index (one ID per line)
            <textarea
              value={toLineBlock(packet.evidence_index)}
              onChange={(event) => setPacket({ ...packet, evidence_index: toLines(event.target.value) })}
            />
          </label>
          <label>
            Required approvers (one role per line)
            <textarea
              value={toLineBlock(packet.required_approvers)}
              onChange={(event) => setPacket({ ...packet, required_approvers: toLines(event.target.value) })}
            />
          </label>
          <label>
            Blocker defects open
            <input
              type="number"
              min={0}
              value={packet.blocker_defects_open}
              onChange={(event) =>
                setPacket({ ...packet, blocker_defects_open: Number(event.target.value) || 0 })
              }
            />
          </label>
          <label className="checkbox-inline">
            <input
              type="checkbox"
              checked={packet.approved_exception}
              onChange={(event) => setPacket({ ...packet, approved_exception: event.target.checked })}
            />
            Approved exception
          </label>
        </div>

        <button type="submit">Validate packet</button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="panel">
        <h3>Acceptance checks</h3>
        <ul>
          {acceptanceChecks.map((check) => {
            const failed = failedCodes.has(check.code);
            return (
              <li key={check.code}>
                <strong>{failed ? '❌' : '✅'}</strong> {check.label} ({check.code})
              </li>
            );
          })}
        </ul>
      </div>

      {result && (
        <div className="panel">
          <h3>Packet status: {result.acceptable ? 'Acceptable' : 'Not acceptable'}</h3>
          {result.issues.length > 0 && (
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
