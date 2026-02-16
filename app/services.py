from __future__ import annotations

from collections import Counter
from typing import Iterable

from app.models import (
    INTENDED_USE_REQUIRED_KEYS,
    TECH_REQUIRED_KEYS,
    AuditEvent,
    ConfidenceLevel,
    HandoffPacket,
    IntakePayload,
    IntakeValidationResponse,
    PacketValidationResponse,
    StatementCandidate,
    StatementValidationResult,
    ValidationIssue,
)


class IntakeValidator:
    @staticmethod
    def validate(payload: IntakePayload) -> IntakeValidationResponse:
        issues: list[ValidationIssue] = []

        missing_intended_use = INTENDED_USE_REQUIRED_KEYS - set(payload.intended_use.keys())
        if missing_intended_use:
            issues.append(
                ValidationIssue(
                    code="GATE-01-INTENDED-USE",
                    message=f"Missing intended_use sub-elements: {sorted(missing_intended_use)}",
                )
            )

        if not payload.target_markets or not payload.primary_launch_market:
            issues.append(
                ValidationIssue(
                    code="GATE-02-MARKET-SCOPE",
                    message="Target markets and primary launch market are required.",
                )
            )

        market_counts = Counter(entry.market for entry in payload.risk_class)
        duplicate_markets = sorted(market for market, count in market_counts.items() if count > 1)
        if duplicate_markets:
            issues.append(
                ValidationIssue(
                    code="GATE-03-RISK-CLASS-DUPLICATE",
                    message=f"Duplicate risk class entries found for markets: {duplicate_markets}",
                )
            )

        target_market_set = set(payload.target_markets)
        missing_target_markets = sorted(market for market in target_market_set if market_counts.get(market, 0) == 0)
        if missing_target_markets:
            issues.append(
                ValidationIssue(
                    code="GATE-03-RISK-CLASS-MISSING-TARGET-MARKET",
                    message=f"Missing risk class entries for target markets: {missing_target_markets}",
                )
            )

        extraneous_markets = sorted(market for market in market_counts if market not in target_market_set)
        if extraneous_markets:
            issues.append(
                ValidationIssue(
                    code="GATE-03-RISK-CLASS-EXTRANEOUS-MARKET",
                    message=f"Risk class entries found for non-target markets: {extraneous_markets}",
                )
            )

        for entry in payload.risk_class:
            if entry.confidence == ConfidenceLevel.low and not entry.mitigation_plan:
                issues.append(
                    ValidationIssue(
                        code="RISK-LOW-CONFIDENCE-WITHOUT-MITIGATION",
                        message=f"Low-confidence risk class for {entry.market} requires mitigation plan.",
                    )
                )

        missing_tech = TECH_REQUIRED_KEYS - set(payload.technology.keys())
        if missing_tech:
            issues.append(
                ValidationIssue(
                    code="GATE-04-TECH-BOUNDARY",
                    message=f"Missing technology sub-elements: {sorted(missing_tech)}",
                )
            )

        if not payload.clinical_strategy.primary_endpoints or not payload.clinical_strategy.acceptance_criteria:
            issues.append(
                ValidationIssue(
                    code="GATE-05-CLINICAL-STRATEGY",
                    message="Clinical strategy requires primary endpoints and acceptance criteria.",
                )
            )

        ai_behavior = str(payload.technology.get("ai_ml_behavior", "")).lower()
        if "adaptive" in ai_behavior and not payload.clinical_strategy.lifecycle_monitoring_plan:
            issues.append(
                ValidationIssue(
                    code="CONSISTENCY-ADAPTIVE-ML-MONITORING",
                    message="Adaptive ML requires lifecycle performance monitoring plan.",
                )
            )

        return IntakeValidationResponse(valid=len(issues) == 0, issues=issues)


class EvidencePolicy:
    @staticmethod
    def validate_statements(
        statements: Iterable[StatementCandidate],
        available_evidence_ids: set[str],
        evidence_confidence_map: dict[str, ConfidenceLevel],
    ) -> list[StatementValidationResult]:
        results: list[StatementValidationResult] = []
        confidence_rank = {
            ConfidenceLevel.low: 1,
            ConfidenceLevel.medium: 2,
            ConfidenceLevel.high: 3,
        }
        reverse = {v: k for k, v in confidence_rank.items()}

        for candidate in statements:
            if not candidate.evidence_ids:
                results.append(
                    StatementValidationResult(
                        statement=candidate.statement,
                        status="missing_evidence",
                        reason="No linked evidence object found.",
                    )
                )
                continue

            unknown_ids = [ev for ev in candidate.evidence_ids if ev not in available_evidence_ids]
            if unknown_ids:
                results.append(
                    StatementValidationResult(
                        statement=candidate.statement,
                        status="missing_evidence",
                        reason=f"Unknown evidence IDs: {unknown_ids}",
                    )
                )
                continue

            min_rank = min(confidence_rank[evidence_confidence_map[ev]] for ev in candidate.evidence_ids)
            results.append(
                StatementValidationResult(
                    statement=candidate.statement,
                    status="ok",
                    confidence=reverse[min_rank],
                )
            )

        return results


class PacketValidator:
    @staticmethod
    def validate(packet: HandoffPacket) -> PacketValidationResponse:
        issues: list[ValidationIssue] = []

        missing_evidence_refs = [
            ac.id for ac in packet.acceptance_criteria if ac.evidence_ref not in packet.evidence_index
        ]
        if missing_evidence_refs:
            issues.append(
                ValidationIssue(
                    code="PACKET-AC-EVIDENCE",
                    message=f"Acceptance criteria missing evidence: {missing_evidence_refs}",
                )
            )

        unverified_high_risks = [
            rc.risk_id
            for rc in packet.risk_controls
            if rc.severity.lower() in {"high", "critical"} and not rc.verified
        ]
        if unverified_high_risks:
            issues.append(
                ValidationIssue(
                    code="PACKET-HIGH-RISK-CONTROLS",
                    message=f"High-severity risks without verified controls: {unverified_high_risks}",
                )
            )

        approver_decisions = {entry.signer_role: entry.decision.lower() for entry in packet.approval_log}
        missing_approvers = [role for role in packet.required_approvers if approver_decisions.get(role) != "approved"]
        if missing_approvers:
            issues.append(
                ValidationIssue(
                    code="PACKET-REQUIRED-APPROVALS",
                    message=f"Missing required approvals: {missing_approvers}",
                )
            )

        if packet.blocker_defects_open > 0 and not packet.approved_exception:
            issues.append(
                ValidationIssue(
                    code="PACKET-BLOCKER-DEFECTS",
                    message="Open blocker defects present without approved exception.",
                )
            )

        return PacketValidationResponse(acceptable=len(issues) == 0, issues=issues)


class ImmutableAuditLog:
    def __init__(self) -> None:
        self._events: list[AuditEvent] = []

    @property
    def events(self) -> list[AuditEvent]:
        return self._events

    def append(self, event: AuditEvent) -> AuditEvent:
        previous_hash = self._events[-1].hash if self._events else None
        if event.previous_event_hash != previous_hash:
            raise ValueError("previous_event_hash mismatch")

        event.hash = event.compute_hash()
        self._events.append(event)
        return event
