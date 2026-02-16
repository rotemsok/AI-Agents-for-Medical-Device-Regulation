# Audit Traceability and Immutable Logging Standard

## 1. Purpose and Scope
This standard defines immutable audit-traceability requirements for AI-assisted regulatory documentation workflows used in medical-device contexts. It covers:
- Prompt and instruction capture.
- AI output capture.
- Evidence-reference traceability.
- Approval decisions and sign-offs.
- Role-based action logging.
- Retention and legal-hold controls.
- Change-history requirements.
- Inspection-ready export requirements.
- Per-document trace matrix controls linking requirement → evidence → generated section → reviewer approval.

This standard applies to all systems, tools, and human operators participating in creation, review, approval, and export of compliance-related documents.

## 2. Core Principles
1. **Immutability by design**: Raw audit records are append-only and cannot be edited or deleted by standard users.
2. **Complete traceability**: Every generated statement can be traced to source evidence and responsible approvals.
3. **Attribution and accountability**: Each material action is attributable to a role and identity.
4. **Inspection readiness**: Records can be exported in a consistent, machine-readable and human-readable format for internal and external audits.
5. **Data minimization with compliance**: Collect only required personal data while preserving regulatory integrity.

## 3. Immutable Audit Log Requirements

### 3.1 General Controls
- All audit events **must** be written to an append-only store with tamper-evident protections.
- Each event **must** include a unique `event_id`, UTC timestamp, and cryptographic hash.
- Event chains **must** include `previous_event_hash` (or equivalent ledger linkage) to detect modification.
- Clock source **must** be synchronized to an approved time authority.
- Deletion and update operations on raw events are prohibited; corrections are represented as superseding events.

### 3.2 Required Event Types
At minimum, immutable logs must capture the following event categories:

1. **Prompt Events**
   - Full prompt text or prompt reference ID.
   - Model/runtime parameters used.
   - Prompt author identity and role.
   - Associated workflow/document ID.

2. **Output Events**
   - Full generated output or content digest with retrievable object reference.
   - Model/version identifier.
   - Generation time and completion status.
   - Link to originating prompt event.

3. **Evidence Reference Events**
   - Evidence identifier (e.g., SOP, test report, risk file, requirement spec).
   - Evidence version/revision and checksum.
   - Citation location in generated content.
   - Mapping to requirement IDs and document section IDs.

4. **Approval Events**
   - Approval decision (`approved`, `rejected`, `approved_with_conditions`, `needs_rework`).
   - Approver identity, role, and delegation authority (if applicable).
   - Timestamp and rationale/comment.
   - Scope of approval (section, document, release package).

5. **Role Action Events**
   - User/system action (`create`, `edit_request`, `submit_review`, `approve`, `export`, `archive`, etc.).
   - Actor identity, role, and authentication context.
   - Affected object identifiers.
   - Outcome (`success`, `failed`, `blocked`) and reason code.

### 3.3 Minimum Event Schema
Each event record should contain:

| Field | Required | Description |
|---|---|---|
| `event_id` | Yes | Globally unique immutable event identifier. |
| `event_type` | Yes | Event category (`prompt`, `output`, `evidence_link`, `approval`, `role_action`, etc.). |
| `timestamp_utc` | Yes | ISO-8601 UTC timestamp. |
| `workflow_id` | Yes | End-to-end workflow identifier. |
| `document_id` | Yes | Target compliance document identifier. |
| `actor_id` | Yes | Human/system principal ID. |
| `actor_role` | Yes | Role at the time of action. |
| `payload` | Yes | Event-specific content object. |
| `content_hash` | Yes | Hash of canonicalized event content. |
| `previous_event_hash` | Yes | Hash pointer for tamper evidence. |
| `signature` | Recommended | Digital signature or equivalent attestation. |
| `classification` | Recommended | Data classification / confidentiality label. |

## 4. Per-Document Trace Matrix Requirements
A trace matrix is required for every controlled document generated or edited with AI assistance.

### 4.1 Mandatory Linkage Chain
Each trace-matrix row **must** maintain explicit linkage:

`Requirement ID → Evidence ID(s) → Generated Section ID → Reviewer Approval ID`

No generated section may be finalized without a complete linkage chain.

### 4.2 Required Trace Matrix Columns
Each document trace matrix must include at least:
- `matrix_row_id`
- `document_id`
- `requirement_id`
- `requirement_text_snapshot`
- `evidence_id`
- `evidence_version`
- `evidence_checksum`
- `generated_section_id`
- `generated_section_hash`
- `generation_event_id`
- `reviewer_id`
- `reviewer_role`
- `approval_event_id`
- `approval_status`
- `approval_timestamp_utc`
- `residual_risk_or_open_issue` (if any)

### 4.3 Matrix Integrity Rules
- Evidence references in the matrix must resolve to controlled records in the QMS/document repository.
- If evidence or generated text changes, prior matrix rows remain immutable and a new superseding row is created.
- Matrix versioning must support reconstruction of the exact state reviewed at any approval milestone.
- Rows with `approval_status != approved` must be flagged as non-releasable.

## 5. Record Retention and Legal Hold

### 5.1 Retention Baseline
Unless a stricter regulatory, contractual, or jurisdictional requirement applies:
- Retain immutable audit logs for **minimum 10 years** after final document release.
- Retain trace matrices for the same period as their parent document record.
- Retain export packages used in inspections/audits for **minimum 10 years**.

### 5.2 Triggered Extensions
Retention must be extended when required by:
- Complaint, CAPA, vigilance, recall, or post-market investigations.
- Active litigation or legal hold.
- Regulator request.

### 5.3 Legal Hold Controls
- Legal hold status must prevent purge/archival deletion.
- Hold initiation and release actions must be logged as immutable role-action events.
- Held records must remain discoverable in standard export workflows.

## 6. Change History Requirements

### 6.1 Change Recording
For each controlled document and trace matrix, maintain immutable change-history records containing:
- `change_id`
- `changed_object_id`
- `prior_version_id`
- `new_version_id`
- `change_summary`
- `change_reason`
- `requestor_id`
- `implementer_id` (if different)
- `review_event_id`
- `approval_event_id`
- `effective_timestamp_utc`

### 6.2 Version-Control Expectations
- Version identifiers must be monotonic and unique per object.
- Change history must support bidirectional navigation (version N to N-1 and N+1 where applicable).
- Superseded content remains retrievable for audit reconstruction.
- Redlines/diffs should be reproducible for any adjacent versions.

## 7. Export Format for Inspections and Internal Audits

### 7.1 Export Package Contents
Inspection/audit export packages must include:
1. Manifest file with package metadata, hash algorithm, and package checksum.
2. Immutable event log extract for selected scope/time period.
3. Per-document trace matrix extracts.
4. Document versions and evidence metadata snapshots.
5. Approval decision records and role-action summaries.
6. Data dictionary/schema definition.

### 7.2 Required Formats
- **Primary machine-readable format**: JSON Lines (`.jsonl`) for event logs and matrices.
- **Tabular companion format**: CSV for reviewer-friendly filtering.
- **Human-readable package summary**: PDF or Markdown report.
- Character encoding must be UTF-8.
- Timestamps must be ISO-8601 UTC.

### 7.3 Integrity and Verifiability
- Each exported file must include a file-level checksum (SHA-256 or stronger).
- Export manifest must include row counts and hash totals.
- Optional signature block should provide organizational attestation.
- Re-import validation routine should confirm schema compliance and hash integrity.

## 8. Roles and Responsibilities
- **Author/Prompt Operator**: Creates prompts, links evidence, addresses review comments.
- **Reviewer (SME/QA/RA)**: Verifies technical/regulatory accuracy and evidence sufficiency.
- **Approver**: Grants formal acceptance for scoped content.
- **System Administrator**: Maintains logging infrastructure and retention settings.
- **Compliance/Audit Lead**: Oversees control effectiveness, periodic checks, and inspection support.

All role transitions, delegated approvals, and privilege changes must be immutably logged.

## 9. Control Checks and Monitoring
- Run periodic integrity checks to verify event-chain continuity.
- Reconcile trace-matrix rows against controlled evidence repositories.
- Validate that no released section lacks a completed requirement→evidence→section→approval chain.
- Perform at least annual mock export to confirm inspection readiness.

## 10. Nonconformance Handling
Any gap in immutable logging, missing trace links, or unverifiable approvals must be treated as a quality-system nonconformance and processed via CAPA or equivalent procedure before release.

## 11. Example Trace Matrix Row (Illustrative)

| matrix_row_id | requirement_id | evidence_id | generated_section_id | approval_event_id | approval_status |
|---|---|---|---|---|---|
| TM-000184 | MDR-ANNEX-II-1.1 | TR-VAL-2026-044 | SEC-04-CLIN-EVAL | APPR-9921 | approved |

This row is complete only when all linked records exist in immutable logs and checksums match stored references.
