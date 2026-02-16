# Workflow Contracts

This document defines the mandatory handoff contract between agents to ensure work is complete, reviewable, and compliant before state transitions.

## 1. Handoff Contract Principles

- **Traceability first:** every task packet must link to source requirements, risk items, and prior decisions.
- **Objective evidence required:** statements of completion are invalid without attached evidence.
- **State-based control:** work transitions only through explicit review and approval states.
- **Separation of duties:** creators and approvers must be distinct where required by quality controls.
- **No silent acceptance:** missing criteria or evidence results in explicit rejection or return-for-rework.

## 2. Standard Task Packet Schema

Each handoff must include a task packet using the following schema.

## 2.1 Packet Header
- `packet_id`: unique immutable identifier.
- `title`: concise deliverable name.
- `owner_agent`: originating accountable agent.
- `target_agent`: receiving agent/review board.
- `created_at`, `required_by`: timestamps.
- `priority`: critical/high/normal/low.
- `phase_gate`: applicable lifecycle stage.

## 2.2 Context and Scope
- `problem_statement`: what is being solved and why.
- `in_scope`: explicit boundaries.
- `out_of_scope`: exclusions to prevent assumption drift.
- `dependencies`: prerequisite packets, systems, suppliers, or decisions.
- `constraints`: regulatory, quality, technical, schedule, and resource constraints.

## 2.3 Requirements and Traceability
- `source_requirements`: IDs and versions.
- `risk_controls`: linked risk items and planned control implementation.
- `acceptance_criteria`: measurable pass/fail conditions.
- `verification_method`: test/inspection/analysis/demonstration mapping per criterion.
- `change_impact`: impacted artifacts/components and backward compatibility concerns.

## 2.4 Deliverables
- `expected_outputs`: exact artifacts to be produced.
- `format_requirements`: templates, naming, and repository locations.
- `review_checklist`: mandatory checklist references.
- `completion_definition`: explicit definition of done.

## 2.5 Evidence Attachments
- `evidence_index`: list of attached objective evidence.
- `test_results`: executed test reports with environment/version metadata.
- `review_records`: peer/SME review outcomes and dispositions.
- `compliance_records`: required RA/QA forms, signatures, and trace links.
- `exceptions`: approved deviations with rationale and expiry.

## 2.6 Decision and Sign-off Fields
- `author_recommendation`: ready/not-ready with rationale.
- `required_approvers`: named roles required for transition.
- `approval_log`: signer, timestamp, decision, comment.
- `final_disposition`: approved/rejected/returned/waived.

## 3. Acceptance Criteria Contract

Acceptance criteria must be:
- **Specific:** unambiguous and implementation-independent.
- **Measurable:** include threshold or binary expectation.
- **Traceable:** linked to requirement/risk identifiers.
- **Verifiable:** paired with a concrete verification method and evidence type.
- **Bounded:** include assumptions, operating conditions, and exclusions.

### 3.1 Minimum Acceptance Set
A packet cannot be accepted unless all are true:
1. Every acceptance criterion has a corresponding evidence artifact.
2. All linked high-severity risks have defined and verified controls.
3. Required reviewers/approvers completed disposition.
4. No open blocker defects remain, or approved exception is recorded.
5. Traceability links are current and bidirectionally valid.

## 4. Evidence Requirements by Work Type

### 4.1 Requirements/Design Handoff
- Approved requirement/design artifact with version.
- Trace links to user need and risk controls.
- Review minutes with resolved comments.

### 4.2 Implementation Handoff
- Change set reference and build provenance.
- Unit/integration test evidence and coverage summary (as applicable).
- Static analysis/security findings disposition.

### 4.3 V&V Handoff
- Approved V&V protocol/plan.
- Raw and summarized execution results.
- Deviation log and anomaly disposition.

### 4.4 Release/Gate Handoff
- Consolidated readiness checklist.
- Open issue register with severity and mitigation.
- Required RA/QA and technical approvals.

## 5. Review and Approval States

All packets move through these controlled states:

1. **Draft**
   - Packet authored; content may be incomplete.
   - Not eligible for implementation or gate decisions.

2. **Submitted**
   - Author asserts packet completeness against checklist.
   - System performs schema and link validation.

3. **In Review**
   - Assigned reviewers evaluate criteria and evidence.
   - Comments must be categorized: blocker/major/minor/editorial.

4. **Changes Requested**
   - Blocker or major deficiencies found.
   - Packet returns to owner with required actions and deadline.

5. **Conditionally Approved**
   - Non-blocking gaps allowed only with documented conditions, owner, and due date.
   - Cannot bypass mandatory compliance approvals.

6. **Approved**
   - All mandatory checks complete; required signatures present.
   - Eligible for downstream handoff or phase-gate transition.

7. **Rejected**
   - Packet fails fundamental criteria, invalid scope, or unresolvable compliance concerns.
   - New packet or major re-baseline required.

8. **Waived (Exception)**
   - Formal exception approved by authorized roles.
   - Must include rationale, risk acceptance, compensating controls, and expiry/review date.

## 6. Review SLA and Escalation Rules

- Review must start within agreed SLA window after submission.
- If reviewer SLA is missed, Team Leader escalates and reassigns reviewer capacity.
- If packet remains in `Changes Requested` beyond deadline, escalate to governance forum.
- Repeated rejection cycles trigger root-cause analysis and process corrective action.

## 7. Conflict and Disposition Rules for Handoffs

- Disputes are resolved using documented criteria, not role seniority.
- RA/QA may hold progression for unresolved compliance/safety concerns.
- Technical feasibility disputes are adjudicated with requirement and risk evidence.
- Product-value disputes must include explicit trade-off and impact statement.
- Final disposition must be recorded in packet approval log and decision register.

## 8. Packet Quality Checklist (Pre-Submission)

Before moving to **Submitted**, the owner confirms:
- Scope and assumptions are explicit.
- Acceptance criteria are measurable and complete.
- Evidence index is populated and accessible.
- Required links (requirements, risks, tests, decisions) validate.
- Required approvers are assigned.
- No unresolved blockers are hidden in comments.

## 9. Minimal Example Packet Template

```yaml
packet_id: PKT-YYYY-NNN
title: "<Deliverable title>"
owner_agent: "<Role>"
target_agent: "<Role or board>"
priority: high
phase_gate: design_output

problem_statement: "..."
in_scope:
  - "..."
out_of_scope:
  - "..."

authoritative_links:
  source_requirements:
    - "REQ-001@v3"
  risk_controls:
    - "RISK-014 -> CTRL-022"

acceptance_criteria:
  - id: AC-01
    statement: "..."
    verification_method: test
    evidence_ref: "EV-2026-004"

expected_outputs:
  - "docs/design/<artifact>.md"

required_approvers:
  - "RA&QA"
  - "System Engineer/CTO"

final_disposition: submitted
```
