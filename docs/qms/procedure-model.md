# Procedure Model for Human-Authored, Runtime-Enforced Platform Controls

## Purpose
This document defines how quality procedures are:
- Authored and maintained by humans.
- Represented as structured procedure objects.
- Enforced at runtime by platform gates that control agent execution.
- Recorded with auditable approvals, signatures, and required evidence.

The intent is to ensure autonomous and semi-autonomous agent actions remain compliant with the Quality Management System (QMS), while preserving traceability required for regulated medical-device contexts.

---

## 1. Human Authoring and Governance Lifecycle

### 1.1 Roles and responsibilities
- **Procedure Owner**: accountable for procedure content, fitness-for-purpose, and periodic review.
- **Subject Matter Author(s)**: draft and update step-level requirements.
- **Quality Reviewer**: verifies QMS alignment, required controls, and records.
- **Approver(s)**: formally release procedures for operational use.
- **System Administrator**: publishes approved procedures to runtime policy services.

### 1.2 Authoring workflow
1. **Draft creation**
   - A human author creates or updates a procedure in controlled documentation tooling.
   - Each procedure is assigned a unique SOP identifier and revision.
2. **Structured modeling**
   - Narrative text is mapped into a machine-readable procedure object (see Section 2).
   - Mandatory steps, approval points, signature needs, and evidence records are explicitly encoded.
3. **Review and approval**
   - Designated reviewers assess technical correctness and QMS adequacy.
   - Approvers sign the revision before activation.
4. **Effective-date release**
   - The procedure is activated at its effective date/time.
   - Runtime systems enforce only currently effective revisions unless a controlled exception is approved.
5. **Periodic maintenance**
   - Owners perform scheduled review.
   - Revisions are incremented for changes; superseded revisions become read-only for traceability.

### 1.3 Human-authored source of truth
- Human-authored documents are the governing source.
- Runtime objects are controlled derivatives and must remain version-locked to the approved revision.
- Any mismatch between human-approved content and runtime representation is treated as a quality event.

---

## 2. Procedure Object Definition

A procedure object is a versioned, machine-readable policy artifact derived from the approved SOP.

### 2.1 Required fields
Each object must include at minimum:

- **`sop_id`**: unique SOP identifier (e.g., `SOP-QMS-042`).
- **`revision`**: controlled revision designator (e.g., `Rev. 03`).
- **`effective_date`**: date/time the revision becomes enforceable.
- **`owner`**: responsible role or person for maintenance and interpretation.
- **`mandatory_steps`**: ordered list of required procedural steps.
- **`exceptions`**: explicitly allowed deviation pathways with approval constraints.
- **`capa_linkage`**: references to CAPA records triggered by or associated with nonconformance.

### 2.2 Recommended supporting fields
- `title`
- `purpose`
- `scope`
- `inputs`
- `outputs`
- `required_records`
- `approval_matrix`
- `signature_requirements`
- `gate_definitions`
- `supersedes`
- `retention_requirements`

### 2.3 Example schema shape (illustrative)
```yaml
sop_id: SOP-QMS-042
revision: Rev. 03
effective_date: 2026-01-15T00:00:00Z
owner:
  role: Quality Systems Manager
  user_id: qsm-001
mandatory_steps:
  - id: step-1
    name: Define intended use and device classification
    evidence_required:
      - intended_use_statement
      - classification_rationale
  - id: step-2
    name: Independent quality review
    approvals_required:
      - role: Quality Reviewer
exceptions:
  - code: EXC-042-EMERGENCY
    description: Time-limited emergency path with post-hoc review
    preconditions:
      - emergency_declared == true
    additional_approvals:
      - role: QA Director
    expiration_hours: 24
capa_linkage:
  trigger_conditions:
    - missing_mandatory_step
    - unauthorized_exception
  default_capa_type: process_nonconformance
```

---

## 3. Runtime Enforcement Model

### 3.1 Enforcement principles
- **No silent bypass**: mandatory controls must be explicitly satisfied or formally excepted.
- **Fail closed**: when evidence is missing or ambiguous, progression is blocked.
- **Least privilege progression**: agents may only execute actions permitted by current gate state.
- **Complete traceability**: every gate decision emits an immutable audit event.

### 3.2 Gate types
Runtime gate checks are performed before, during, and after critical workflow stages:

1. **Entry gate**
   - Confirms an effective procedure revision exists.
   - Verifies actor eligibility and role mapping.
2. **Step-completion gate**
   - Ensures each mandatory step is completed in sequence or approved alternative ordering.
   - Requires required evidence artifacts before step closure.
3. **Approval gate**
   - Confirms required approver roles have approved.
   - Enforces segregation-of-duties constraints where configured.
4. **Signature gate**
   - Validates required signatures (electronic or cryptographic) are present and attributable.
   - Confirms signature intent and timestamp integrity.
5. **Record-finalization gate**
   - Blocks closure unless all required records are attached, complete, and retention-tagged.
6. **Exception gate**
   - Allows deviation only when exception rule preconditions and additional approvals are satisfied.

### 3.3 Blocking behavior for missing controls
Agent progression is blocked when any of the following are true:
- A mandatory step is not completed.
- Required evidence for a mandatory step is missing.
- Required approval is missing, expired, or from an unauthorized role.
- Required signature is absent, invalid, or non-attributable.
- A required record is incomplete or absent.
- An exception path is invoked without satisfying exception conditions.

When blocked, runtime must:
1. Return a deterministic denial reason code.
2. Identify the unsatisfied requirement(s) and originating `sop_id` + `revision`.
3. Emit an audit event containing actor, timestamp, workflow context, and denial details.
4. Optionally trigger notification/escalation to owner and quality stakeholders.

### 3.4 CAPA integration on enforcement failures
- Repeated or critical gate failures automatically create or link to CAPA records.
- CAPA linkage references the exact procedure object and failed control.
- CAPA state may itself become a release gate for related workflows.

---

## 4. Approvals, Signatures, and Required Records

### 4.1 Approvals
- Approvals must be role-based and policy-evaluable at runtime.
- Approval matrix must state:
  - Required role(s)
  - Minimum number of approvers
  - Sequence (if ordered approvals are required)
  - Expiration/renewal rules

### 4.2 Signatures
- Signatures must be bound to authenticated identity.
- Signature payload should include procedure ID, revision, step, approval decision, and timestamp.
- Signature validation should include integrity and non-repudiation checks.

### 4.3 Required records
Each mandatory step may define required records such as:
- Review checklists
- Risk assessments
- Verification artifacts
- Approval forms
- Decision rationales

Runtime must enforce completeness, version association, and retention metadata before allowing progression to terminal states.

---

## 5. Minimal Runtime Validation Logic (Normative)

At every progression attempt, the platform shall evaluate:

1. **Procedure validity**
   - Is there exactly one active applicable revision?
2. **Step obligations**
   - Are all prior mandatory steps complete with required evidence?
3. **Approval obligations**
   - Are required approvals present and valid for this stage?
4. **Signature obligations**
   - Are required signatures present and valid?
5. **Record obligations**
   - Are all required records complete and attached?
6. **Exception obligations**
   - If deviating, are exception constraints and extra approvals satisfied?

If any check fails, the engine shall deny transition and keep the workflow in its current state.

---

## 6. Compliance and Audit Expectations

- Every procedure decision point must be audit-logged.
- Logs must be immutable, time-synchronized, and queryable by `sop_id`, `revision`, actor, and outcome.
- Historical investigations must be able to reconstruct:
  - What procedure version was active.
  - Which gates were evaluated.
  - Which approvals/signatures/records were present or missing.
  - Why progression was allowed or denied.

This model supports inspection-ready evidence for internal audits, external audits, and regulatory inquiries.
