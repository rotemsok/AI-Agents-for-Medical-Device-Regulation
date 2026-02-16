# Standards & Procedures Ingestion Workflow

## Purpose
This document defines how to onboard external standards/procedures into the internal standards database so regulatory agents can reason over current, licensed, and jurisdiction-relevant requirements.

---

## 1) Ingestion Scope and Required Metadata
Each onboarded standard/procedure **must** include the following metadata fields at minimum.

| Field | Type | Required | Description |
|---|---|---:|---|
| `standard_id` | string | ✅ | Internal immutable identifier (e.g., `STD-IEC-60601-1-2005+A1:2012`). |
| `standard_name` | string | ✅ | Official title as published by SDO/regulator. |
| `issuing_body` | string | ✅ | Publisher (e.g., ISO, IEC, FDA, MDCG). |
| `edition` | string | ✅ | Official edition/version/amendment expression. |
| `publication_date` | date | ✅ | Date issued by publisher. |
| `effective_date` | date | ✅ | Date enforceable in practice/jurisdiction. |
| `status` | enum | ✅ | `draft`, `active`, `superseded`, `withdrawn`. |
| `jurisdictions` | array | ✅ | Markets/regions where applicable (e.g., EU, US, CA, JP). |
| `jurisdiction_mapping` | object | ✅ | Maps jurisdiction → legal basis/guidance adoption notes. |
| `clauses` | array | ✅ | Structured clause list with clause IDs/titles and machine-indexed text references. |
| `normative_references` | array | ✅ | Referenced standards and dependency links. |
| `licensing_constraints` | object | ✅ | Usage restrictions (view, quote, transform, embedding, redistribution). |
| `source_uri` | string | ✅ | Authoritative acquisition/source location. |
| `checksum` | string | ✅ | Hash of ingested source artifact for integrity tracking. |
| `last_reviewed_at` | datetime | ✅ | Last human QA review timestamp. |
| `owner` | string | ✅ | Responsible team/person for updates and approvals. |

### Clause-level data model (required)
Each clause entry should include:
- `clause_id` (publisher-consistent numbering)
- `clause_title`
- `clause_text_pointer` (pointer/offset; full text only if license permits)
- `requirement_type` (`normative`, `informative`, `guidance`)
- `risk_domain_tags` (e.g., electrical safety, software lifecycle, clinical evaluation)
- `testability` (whether requirement is auditable/verifiable)

---

## 2) Jurisdiction Mapping Rules
For each standard, maintain explicit jurisdiction mappings:
- **Adoption mode**: recognized, harmonized, consensus-only, guidance-only, or not adopted.
- **Legal anchor**: regulation/guidance citation(s) that establish applicability.
- **Deviation notes**: country/region-specific carve-outs or additional requirements.
- **Transition window**: coexistence dates where old and new editions are both accepted.

### Minimum output artifact
Create/update a `jurisdiction_mapping` object with per-jurisdiction:
1. `applicability` (required/optional/contextual)
2. `citation`
3. `edition_constraints`
4. `sunset_date` for superseded editions (if known)

---

## 3) Licensing and Use-Restriction Controls
Before storing content, classify license posture:
- **L1: Metadata-only** (no full text retention)
- **L2: Limited excerpts allowed** (bounded quotations)
- **L3: Internal full-text allowed**
- **L4: Full-text + derived embeddings allowed**

Enforcement requirements:
- Block ingestion of text/embeddings beyond permitted license tier.
- Store machine-enforceable `licensing_constraints` flags:
  - `allow_full_text_storage`
  - `allow_snippet_quoting`
  - `allow_vectorization`
  - `allow_model_finetune_use`
  - `redistribution_permitted`
- Add a hard validation gate: ingestion fails if license metadata is missing or ambiguous.

---

## 4) Ingestion Pipeline (Operational)
1. **Acquire source** from authoritative channel and record `source_uri` + checksum.
2. **Extract metadata** (name, edition, dates, issuer, jurisdiction tags).
3. **Segment clauses** into structured entries and map requirement types.
4. **Link dependencies** (normative references and predecessor/successor editions).
5. **Apply jurisdiction mapping** and legal anchors.
6. **Run licensing gate** to enforce storage/usage restrictions.
7. **QA review** by domain owner before status becomes `active`.
8. **Publish index** for agent retrieval with timestamped version record.

---

## 5) Update Cadence
Use both scheduled and event-driven updates.

### Scheduled cadence
- **Critical/high-impact standards**: monthly publisher/regulator check.
- **All active standards**: quarterly verification.
- **Superseded/withdrawn standards**: semiannual audit for archival integrity and historical traceability.

### Event-driven triggers (immediate)
- Publisher announces new edition/amendment/corrigendum.
- Regulator changes recognition/harmonization status.
- New jurisdiction adoption or transition deadline publication.
- Internal audit finding indicating stale or incorrect mappings.

### Service level targets
- Detect update within **5 business days** of public release.
- Complete ingestion + QA + publish within **15 business days** for high-impact standards.

---

## 6) Change-Impact Analysis (when a standard is revised)
Every revision requires a structured impact record.

### Required impact checks
- **Clause delta**: added/removed/changed clauses.
- **Requirement severity shift**: informative → normative or vice versa.
- **Cross-standard dependencies** affected by updated normative references.
- **Jurisdictional impact**: where old/new editions are accepted, and by when.
- **Control/test impact**: which internal controls, test protocols, and checklists become stale.
- **Agent behavior impact**: prompts, retrieval filters, and policy rules that depend on changed clauses.

### Impact outputs
Produce:
1. `change_summary`
2. `affected_artifacts` (SOPs, checklists, validation tests, prompts)
3. `required_actions` with owners and due dates
4. `risk_rating` (`low`, `medium`, `high`, `critical`)

If risk is `high` or `critical`, enforce expedited revalidation (see Section 7).

---

## 7) Agent Revalidation Requirements
When any applicable standard is revised:

1. **Freeze prior baseline** as immutable historical version.
2. **Re-index retrieval corpus** using permitted licensing scope.
3. **Re-run evaluation suite** against updated clauses and jurisdiction mappings.
4. **Compare outputs** to prior baseline for drift and non-compliance regression.
5. **Human sign-off** from regulatory owner before production enablement.

### Mandatory revalidation scenarios
- New edition/amendment of any high-impact standard.
- Change in harmonized/recognized status in any supported market.
- Any licensing restriction change that reduces usable content scope.

### Revalidation evidence package
- Test run IDs, pass/fail metrics, regression diffs
- Changed prompt/policy artifacts
- Approval record (reviewer, timestamp, decision)

Agents must not claim “compliant to latest standard” until revalidation is completed and approved.

---

## 8) Missing-Standard Alert Mechanism (Human Notification)
Agents must explicitly notify humans when required standards are absent or unusable.

### Trigger conditions
Raise a `missing_standard_alert` when:
- A required standard for task jurisdiction/device class is not present in DB.
- Present standard exists but required edition is missing.
- License restrictions block needed retrieval depth for the task.
- Jurisdiction mapping is absent/ambiguous for requested market.

### Alert payload (minimum)
- `alert_id`
- `timestamp`
- `task_context` (device type, jurisdiction, workflow step)
- `missing_standard` (name/identifier/edition expected)
- `reason` (`not_ingested`, `edition_gap`, `license_block`, `mapping_gap`)
- `risk_level`
- `recommended_human_action`
- `blocking` (boolean)

### Agent behavior policy
- If blocking, the agent must:
  1. Stop definitive compliance conclusions.
  2. Emit explicit caveat in response.
  3. Route alert to designated human owner/channel.
- If non-blocking, the agent may continue with best-effort guidance but must include uncertainty disclosure and alert reference.

---

## 9) Governance and Auditability
- All ingestion, updates, alerts, and revalidations must be versioned and timestamped.
- Preserve audit trail linking source artifact checksum → parsed clauses → agent knowledge index version.
- Maintain owner accountability for each standard family.
- Review this workflow annually or upon major regulatory operating model changes.

