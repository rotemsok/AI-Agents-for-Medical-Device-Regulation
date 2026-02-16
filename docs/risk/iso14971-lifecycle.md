# ISO 14971 Risk Management Lifecycle

This document defines a practical, auditable risk management lifecycle aligned with ISO 14971 expectations for medical devices. It standardizes how hazards are identified, risks are estimated and controlled, residual risk is accepted, and risk-benefit is justified. It also defines artifact traceability and mandatory RA/QA checkpoints before any submission bundle is marked **ready**.

## 1. Scope and Objectives

- Apply to all product versions, design changes, and software releases intended for regulatory submission.
- Maintain an end-to-end trace from risk artifacts to verification and validation (V&V) evidence.
- Ensure cross-functional sign-off from Regulatory Affairs (RA) and Quality Assurance (QA) prior to submission readiness.

## 2. Core Risk Artifacts and IDs

The following artifacts are required and must be version-controlled:

- **Hazard Log**: Master list of hazards and hazardous situations.
- **Risk Analysis Worksheet / FMEA / FTA**: Risk estimation details.
- **Risk Control Register**: Control measures and implementation status.
- **Verification Matrix**: Objective evidence that controls are implemented and effective.
- **Residual Risk Assessment**: Remaining risk after controls.
- **Risk-Benefit Rationale**: Clinical/technical justification where residual risk is non-negligible.
- **Risk Management Report**: Lifecycle summary and final conclusion.

### ID and Traceability Conventions

Use consistent IDs to ensure traceability:

- `HZ-###` for hazards (e.g., `HZ-014`)
- `HS-###` for hazardous situations
- `RM-###` for risk control measures
- `VNV-###` for verification or validation outputs (test reports, analyses, simulations)
- `RR-###` for residual risk records

Each downstream artifact must reference upstream IDs and vice versa.

## 3. Lifecycle Stages

### 3.1 Hazard Identification

### Activities

- Identify foreseeable hazards across normal use, misuse, maintenance, servicing, and disposal.
- Identify hazardous situations and potential harms.
- Include software, hardware, usability, cybersecurity, biocompatibility, and labeling-related hazards as applicable.

### Required Outputs

- New or updated `HZ-###` records.
- Link each `HZ-###` to related `HS-###` and harm descriptions.
- Record source rationale (complaints, CAPA trends, standards review, design review outputs, etc.).

### Completion Criteria

- All in-scope subsystems reviewed.
- Hazard identification reviewed by engineering + clinical/safety representative.

### 3.2 Risk Estimation

### Activities

- Estimate severity and probability for each hazard/hazardous situation pair using defined scales.
- Determine initial risk level and risk acceptability against approved criteria.
- Document assumptions and uncertainty.

### Required Outputs

- Initial risk entries for each `HZ-###` / `HS-###`.
- Risk ranking/acceptability status before controls.

### Completion Criteria

- Estimation method and scales are documented and current.
- All non-negligible risks have explicit acceptability decisions.

### 3.3 Risk Control Measures

### Activities

- Define and prioritize controls using the hierarchy:
  1. Inherent safety by design
  2. Protective measures in device or process
  3. Information for safety (labeling, IFU, training)
- Assign owners and due dates for each control.
- Reassess risk after control implementation.

### Required Outputs

- `RM-###` entries linked to originating `HZ-###` / `HS-###`.
- Implementation records (design changes, requirements, labeling updates, manufacturing controls).
- Verification references proving implementation and effectiveness.

### Completion Criteria

- Every unacceptable initial risk has one or more linked `RM-###` controls.
- Verification evidence is planned or complete for each control.

### 3.4 Residual Risk Evaluation

### Activities

- Estimate residual risk after controls.
- Evaluate individual and overall residual risk.
- Identify any residual risks requiring disclosure or additional post-market monitoring.

### Required Outputs

- `RR-###` entries with residual severity/probability and acceptability.
- Overall residual risk summary statement.

### Completion Criteria

- No residual risk accepted without rationale.
- Overall residual risk determination documented and approved.

### 3.5 Risk-Benefit Evaluation

### Trigger

Perform risk-benefit analysis when residual risk is not acceptable under normal criteria but may be justified by medical benefit.

### Activities

- Document intended clinical benefit and patient population.
- Compare magnitude/likelihood of harm versus expected benefit.
- Consider alternative design/control options and why they are insufficient or infeasible.

### Required Outputs

- Risk-benefit memo linked to relevant `RR-###`, `HZ-###`, and `RM-###` IDs.
- Evidence references (clinical literature, performance data, real-world evidence, expert review).

### Completion Criteria

- Benefit justification is explicit, evidence-based, and approved.
- Any required risk communication (labeling/IFU) is updated and traceable.

## 4. Document Task Traceability Requirements

Every document task must reference risk artifacts directly. No task is considered complete without trace links.

| Document Task | Minimum Required Risk References |
|---|---|
| Risk Analysis Update | `HZ-###`, `HS-###`, initial risk rating, rationale source |
| Design Input/Requirement Update | Linked `RM-###` and parent `HZ-###` |
| Design Output/Implementation Record | Implemented `RM-###`, change record ID |
| Verification Protocol | `RM-###` under test, acceptance criteria, planned `VNV-###` output ID |
| Verification/Validation Report | Executed `VNV-###`, pass/fail result, linked `RM-###`, impacted `HZ-###` |
| Residual Risk Summary | `RR-###`, linked controls and evidence references |
| Labeling/IFU Update | Residual risk disclosures linked to `RR-###` and source `HZ-###` |
| Submission Bundle Assembly | Consolidated trace matrix from `HZ-###` → `RM-###` → `VNV-###` → `RR-###` |

### Trace Link Quality Rules

- Links must be bidirectional where feasible (e.g., verification report references `RM-###`; control register references report ID).
- Evidence links must resolve to approved, versioned records.
- Orphan records (IDs with no upstream or downstream connection) are not allowed in a release candidate.

## 5. RA/QA Sign-Off Checkpoints (Mandatory)

A submission bundle **must not** be marked **ready** unless all checkpoints below are approved.

1. **Checkpoint A – Pre-Control Review (RA + QA)**
   - Confirms hazard identification completeness and initial risk estimation method.
   - Gate output: approval to proceed with risk controls.

2. **Checkpoint B – Post-Control / Pre-Residual Review (RA + QA)**
   - Confirms control implementation status and verification plan/evidence sufficiency.
   - Gate output: approval to finalize residual risk evaluation.

3. **Checkpoint C – Final Risk & Submission Readiness (RA + QA)**
   - Confirms overall residual risk conclusion, risk-benefit rationale (if needed), and full traceability to V&V outputs.
   - Gate output: authorization to label submission bundle as **ready**.

### Sign-Off Evidence Requirements

Each checkpoint record must include:

- Reviewer names and roles (RA, QA)
- Date/time and document version
- Decision status: `approved`, `approved-with-actions`, or `rejected`
- Open action items with owners and due dates

If any checkpoint is `rejected` or has overdue actions, readiness status remains **not ready**.

## 6. Submission Readiness Criteria

A bundle can be marked **ready** only when all of the following are true:

- Required lifecycle outputs are complete and current.
- Trace matrix demonstrates complete chain: `HZ-###` → `RM-###` → `VNV-###` → `RR-###`.
- Residual risks are acceptable or supported by approved risk-benefit evaluation.
- All three RA/QA checkpoints are approved with no overdue critical actions.

## 7. Governance and Change Control

- Any design, process, or intended-use change triggers risk impact assessment.
- Impacted hazard, control, verification, and residual risk records must be updated before release.
- Periodic review cadence (at minimum each release and annually) verifies ongoing risk file adequacy.
