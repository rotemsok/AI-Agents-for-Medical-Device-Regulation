# Evidence Model and Generation Policy

## Purpose

This document defines the minimum evidence model required for any agent-authored regulatory statement and the generation controls that prevent unsupported content from being produced.

## Evidence Object Schema

Each evidence object **must** be represented as a uniquely identifiable record.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Stable evidence identifier (for example: `EV-ISO13485-2024-001`). |
| `source` | string | Yes | Origin of the evidence (standard, guidance, SOP, dataset, system log, CAPA record, etc.). |
| `version` | string | Yes | Version, revision, publication date, or immutable hash of the source. |
| `owner` | string | Yes | Responsible human role/team accountable for evidence quality and maintenance. |
| `timestamp` | string (ISO 8601) | Yes | Time when evidence was captured, validated, or last confirmed current. |
| `jurisdiction_relevance` | array of strings | Yes | Jurisdictions where this evidence is applicable (for example: `US`, `EU`, `UK`, `CA`). |
| `confidence` | enum | Yes | Confidence level in evidence quality and applicability: `high`, `medium`, `low`. |
| `notes` | string | No | Optional context, caveats, or interpretation boundaries. |

### Example

```json
{
  "id": "EV-IEC62304-2024-002",
  "source": "IEC 62304:2006+A1:2015 internal mapped control matrix",
  "version": "matrix-v3.2",
  "owner": "Regulatory Affairs",
  "timestamp": "2026-02-16T10:20:00Z",
  "jurisdiction_relevance": ["US", "EU"],
  "confidence": "high",
  "notes": "Mapped to software lifecycle clauses with QA sign-off."
}
```

## Generation Policy

### Core Rule

Agents may only draft, summarize, or transform statements that are explicitly linked to one or more evidence IDs.

### Required Statement Format

Every generated statement must include:

1. A declarative claim.
2. One or more supporting `evidence_ids`.
3. A confidence attribution aligned to the lowest-confidence cited evidence.

Example statement object:

```json
{
  "statement": "The software lifecycle process is aligned with IEC 62304 clause structure.",
  "evidence_ids": ["EV-IEC62304-2024-002"],
  "confidence": "high"
}
```

### Unsupported Claim Handling

If no valid evidence ID can be linked to a claim, the agent **must not** generate the claim.

Instead, the agent must emit:

```json
{
  "status": "missing_evidence",
  "requested_claim": "<claim text>",
  "reason": "No linked evidence object found."
}
```

The literal status value `missing_evidence` is mandatory.

## Escalation Rules for Missing Inputs

When required information is unavailable, agents must escalate rather than infer.

### Escalation Triggers

Escalation is required when any of the following is missing:

- **Standards**: No applicable standard/guidance source is present for the claim scope.
- **Procedures**: Required SOP/process record is absent, outdated, or lacks ownership.
- **Data**: Supporting dataset, record, or traceability artifact is unavailable or unverifiable.

### Escalation Levels

1. **Warning (non-blocking)**
   - Condition: Partial evidence exists, but coverage gaps remain.
   - Action: Return output with explicit `missing_evidence` entries for uncovered sub-claims.

2. **Blocking (human input required)**
   - Condition: Missing standards/procedures/data prevent safe or compliant claim generation.
   - Action: Enter a blocking state and halt claim drafting.

Blocking response format:

```json
{
  "status": "blocked_requires_human_input",
  "missing_category": ["standards", "procedures", "data"],
  "details": "Cannot produce compliant statement without required evidence artifacts.",
  "next_action": "Request human-provided sources or approvals."
}
```

### Human Handoff Requirements

In a blocking state, the agent must request:

- The specific missing artifact(s).
- The accountable owner for each artifact.
- Confirmation of jurisdictional applicability.
- Approval to proceed once evidence is registered with IDs.

The agent may resume generation only after missing items are resolved and referenceable evidence IDs are available.
