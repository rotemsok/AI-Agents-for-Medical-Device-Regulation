from __future__ import annotations

from datetime import datetime
from enum import Enum
from hashlib import sha256
from typing import List

from pydantic import BaseModel, Field, model_validator


class ConfidenceLevel(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


class DeviceClass(str, Enum):
    I = "I"
    II = "II"
    III = "III"
    unclassified = "Unclassified"


class ValidationIssue(BaseModel):
    code: str
    message: str
    blocking: bool = True


class RiskClassEntry(BaseModel):
    market: str
    proposed_classification: str
    rationale: str
    confidence: ConfidenceLevel
    open_questions: List[str] = Field(default_factory=list)
    mitigation_plan: str | None = None


class ClinicalStrategy(BaseModel):
    evidence_sources: List[str]
    study_design_assumptions: List[str]
    primary_endpoints: List[str]
    acceptance_criteria: List[str]
    gaps_and_mitigation_plan: str
    lifecycle_monitoring_plan: str | None = None


class SoftwareHardwareScope(BaseModel):
    software_components: List[str]
    hardware_components: List[str]
    external_interfaces: List[str]
    cybersecurity_trust_boundaries: List[str]


class ManufacturingContext(BaseModel):
    organization_model: str
    qms_status: str
    critical_suppliers: List[str]
    process_controls: List[str]
    post_market_change_control_owner: str


class IntakePayload(BaseModel):
    device_class: DeviceClass
    intended_use: dict[str, str]
    technology: dict[str, str | List[str]]
    software_hardware_scope: SoftwareHardwareScope
    target_markets: List[str]
    primary_launch_market: str
    risk_class: List[RiskClassEntry]
    clinical_strategy: ClinicalStrategy
    manufacturing_context: ManufacturingContext

    @model_validator(mode="after")
    def primary_market_must_be_target(self) -> "IntakePayload":
        if self.primary_launch_market not in self.target_markets:
            raise ValueError("primary_launch_market must be one of target_markets")
        return self


class IntakeValidationResponse(BaseModel):
    valid: bool
    issues: List[ValidationIssue]


INTENDED_USE_REQUIRED_KEYS = {
    "clinical_condition",
    "target_population",
    "intended_user",
    "use_environment",
    "primary_output_and_decision_impact",
    "exclusions_or_contraindications",
}

TECH_REQUIRED_KEYS = {
    "product_modality",
    "primary_technical_mechanism",
    "data_inputs_and_dependencies",
    "ai_ml_behavior",
}


class EvidenceObject(BaseModel):
    id: str
    source: str
    version: str
    owner: str
    timestamp: datetime
    jurisdiction_relevance: List[str]
    confidence: ConfidenceLevel
    notes: str | None = None


class StatementCandidate(BaseModel):
    statement: str
    evidence_ids: List[str] = Field(default_factory=list)
    target_jurisdictions: List[str] = Field(default_factory=list)


class JurisdictionMismatchDetail(BaseModel):
    required_jurisdictions: List[str]
    covered_jurisdictions: List[str]
    missing_jurisdictions: List[str]
    evidence_jurisdictions: dict[str, List[str]]


class StatementValidationResult(BaseModel):
    statement: str
    confidence: ConfidenceLevel | None = None
    status: str
    reason: str | None = None
    jurisdiction_mismatch: JurisdictionMismatchDetail | None = None


class RequirementLink(BaseModel):
    id: str
    version: str


class RiskControlLink(BaseModel):
    risk_id: str
    control_id: str
    verified: bool
    severity: str


class AcceptanceCriterion(BaseModel):
    id: str
    statement: str
    verification_method: str
    evidence_ref: str


class ApprovalLogEntry(BaseModel):
    signer_role: str
    decision: str
    timestamp: datetime
    comment: str | None = None


class HandoffPacket(BaseModel):
    packet_id: str
    title: str
    owner_agent: str
    target_agent: str
    source_requirements: List[RequirementLink]
    risk_controls: List[RiskControlLink]
    acceptance_criteria: List[AcceptanceCriterion]
    evidence_index: List[str]
    required_approvers: List[str]
    approval_log: List[ApprovalLogEntry]
    blocker_defects_open: int = 0
    approved_exception: bool = False


class PacketValidationResponse(BaseModel):
    acceptable: bool
    issues: List[ValidationIssue]


class AuditEvent(BaseModel):
    event_id: str
    event_type: str
    actor: str
    timestamp: datetime
    payload: dict
    previous_event_hash: str | None = None
    hash: str | None = None

    def compute_hash(self) -> str:
        material = (
            f"{self.event_id}|{self.event_type}|{self.actor}|{self.timestamp.isoformat()}|"
            f"{self.previous_event_hash}|{self.payload}"
        )
        return sha256(material.encode("utf-8")).hexdigest()
