export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type DeviceClass = 'I' | 'II' | 'III' | 'Unclassified';

export interface ValidationIssue {
  code: string;
  message: string;
  blocking: boolean;
}

export interface RiskClassEntry {
  market: string;
  proposed_classification: string;
  rationale: string;
  confidence: ConfidenceLevel;
  open_questions: string[];
  mitigation_plan?: string | null;
}

export interface ClinicalStrategy {
  evidence_sources: string[];
  study_design_assumptions: string[];
  primary_endpoints: string[];
  acceptance_criteria: string[];
  gaps_and_mitigation_plan: string;
  lifecycle_monitoring_plan?: string | null;
}

export interface SoftwareHardwareScope {
  software_components: string[];
  hardware_components: string[];
  external_interfaces: string[];
  cybersecurity_trust_boundaries: string[];
}

export interface ManufacturingContext {
  organization_model: string;
  qms_status: string;
  critical_suppliers: string[];
  process_controls: string[];
  post_market_change_control_owner: string;
}

export interface IntakePayload {
  device_class: DeviceClass;
  intended_use: Record<string, string>;
  technology: Record<string, string | string[]>;
  software_hardware_scope: SoftwareHardwareScope;
  target_markets: string[];
  primary_launch_market: string;
  risk_class: RiskClassEntry[];
  clinical_strategy: ClinicalStrategy;
  manufacturing_context: ManufacturingContext;
}

export interface IntakeValidationResponse {
  valid: boolean;
  issues: ValidationIssue[];
}

export interface EvidenceObject {
  id: string;
  source: string;
  version: string;
  owner: string;
  timestamp: string;
  jurisdiction_relevance: string[];
  confidence: ConfidenceLevel;
  notes?: string | null;
}

export interface StatementCandidate {
  statement: string;
  evidence_ids: string[];
}

export interface StatementValidationRequest {
  statements: StatementCandidate[];
  evidence_objects: EvidenceObject[];
}

export interface StatementValidationResult {
  statement: string;
  confidence?: ConfidenceLevel | null;
  status: string;
  reason?: string | null;
}

export interface RequirementLink {
  id: string;
  version: string;
}

export interface RiskControlLink {
  risk_id: string;
  control_id: string;
  verified: boolean;
  severity: string;
}

export interface AcceptanceCriterion {
  id: string;
  statement: string;
  verification_method: string;
  evidence_ref: string;
}

export interface ApprovalLogEntry {
  signer_role: string;
  decision: string;
  timestamp: string;
  comment?: string | null;
}

export interface HandoffPacket {
  packet_id: string;
  title: string;
  owner_agent: string;
  target_agent: string;
  source_requirements: RequirementLink[];
  risk_controls: RiskControlLink[];
  acceptance_criteria: AcceptanceCriterion[];
  evidence_index: string[];
  required_approvers: string[];
  approval_log: ApprovalLogEntry[];
  blocker_defects_open: number;
  approved_exception: boolean;
}

export interface PacketValidationResponse {
  acceptable: boolean;
  issues: ValidationIssue[];
}

export interface AuditEvent {
  event_id: string;
  event_type: string;
  actor: string;
  timestamp: string;
  payload: Record<string, unknown>;
  previous_event_hash?: string | null;
  hash?: string | null;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API ${response.status}: ${body}`);
  }

  return (await response.json()) as T;
}

export function validateIntake(payload: IntakePayload): Promise<IntakeValidationResponse> {
  return request('/intake/validate', { method: 'POST', body: JSON.stringify(payload) });
}

export function validateEvidenceStatements(
  payload: StatementValidationRequest,
): Promise<StatementValidationResult[]> {
  return request('/evidence/statements/validate', { method: 'POST', body: JSON.stringify(payload) });
}

export function validateWorkflowPacket(payload: HandoffPacket): Promise<PacketValidationResponse> {
  return request('/workflow/packets/validate', { method: 'POST', body: JSON.stringify(payload) });
}

export function listAuditEvents(): Promise<AuditEvent[]> {
  return request('/audit/events');
}

export function appendAuditEvent(event: AuditEvent): Promise<AuditEvent> {
  return request('/audit/events', { method: 'POST', body: JSON.stringify(event) });
}
