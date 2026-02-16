# Product Intake Schema

This schema defines the **minimum required product-intake data** before downstream regulatory work can begin.

## 1) Required Fields

| Field | Type | Required | Description | Example |
|---|---|---:|---|---|
| `device_class` | Enum (`I`, `II`, `III`, `Unclassified`) | Yes | Regulatory device class under the primary market framework (e.g., FDA, EU MDR). | `II` |
| `intended_use` | Structured text | Yes | Clinical purpose, target patient population, user type, use environment, and key contraindications. | `Diagnostic decision support for adult cardiology patients in hospital settings.` |
| `technology` | Structured list | Yes | Core technologies and mechanisms (e.g., SaMD algorithm type, sensing modality, energy source, connectivity). | `ML risk scoring model, cloud-hosted inference, ECG input.` |
| `software_hardware_scope` | Object | Yes | Boundary of software-only vs hardware-containing system; identify in-scope subsystems, interfaces, and excluded components. | `Software: mobile app + backend; Hardware: off-the-shelf pulse oximeter (external interface only).` |
| `target_markets` | Array of market codes | Yes | Initial commercialization and submission markets. | `['US', 'EU', 'CA']` |
| `risk_class` | Object by market | Yes | Preliminary risk/safety classification by target market with rationale and confidence level. | `US: moderate risk (special controls likely); EU: class IIa (Rule 11 candidate).` |
| `clinical_strategy` | Object | Yes | Evidence-generation strategy: literature, retrospective/prospective studies, endpoints, comparators, and acceptance criteria. | `Retrospective multicenter validation + prospective usability and performance study.` |
| `manufacturing_context` | Object | Yes | Development/manufacturing model, QMS status, key suppliers, sterilization/packaging (if applicable), and transfer plans. | `Design controls in ISO 13485 QMS; cloud provider + contract manufacturer for accessories.` |

## 2) Field-Level Minimum Content Rules

### `device_class`
- Must be one of: `I`, `II`, `III`, `Unclassified`.
- Must include **jurisdiction context** when class labels are not globally equivalent.

### `intended_use`
Must include all of the following sub-elements:
1. Clinical condition/indication.
2. Target population.
3. Intended user.
4. Use environment.
5. Primary output and decision impact.
6. Explicit exclusions/contraindications (or `none known` with rationale).

### `technology`
Must identify:
- Product modality (e.g., SaMD, combination product, active device).
- Primary technical mechanism.
- Data inputs and critical dependencies.
- Any AI/ML behavior (locked vs adaptive).

### `software_hardware_scope`
Must define:
- In-scope software components.
- In-scope hardware components (if any).
- External systems/interfaces.
- Cybersecurity-relevant trust boundaries.

### `target_markets`
- At least one market required.
- Use ISO-like country/region codes where practical (`US`, `EU`, `UK`, `CA`, `JP`, etc.).
- Must designate one **primary launch market**.

### `risk_class`
Must include, per target market:
- Proposed classification.
- Classification rationale (rule/pathway hypothesis).
- Confidence (`high`, `medium`, `low`).
- Open questions requiring regulatory confirmation.

### `clinical_strategy`
Must include:
- Evidence sources (literature, bench, clinical data).
- Study design assumptions.
- Primary safety/performance endpoints.
- Acceptance criteria tied to intended use.
- Gaps and mitigation plan.

### `manufacturing_context`
Must include:
- Organization model (in-house, virtual, CMO/CDMO).
- QMS maturity/status.
- Critical supplier list.
- Process controls relevant to product risk.
- Post-market and change-control ownership.

## 3) Validation Rules

## 3.1 Schema Validation
- Reject payload if any required top-level field is missing.
- Reject if required field exists but is null/empty.
- Reject if enums or value formats are invalid.

## 3.2 Completeness Validation
- Reject if any required sub-elements listed above are absent.
- Reject if rationale fields are present but unsupported by evidence references.

## 3.3 Consistency Validation
- Reject when values conflict, including:
  - `intended_use` implies high-risk intervention but `risk_class` is low without rationale.
  - `technology` includes adaptive ML but `clinical_strategy` lacks lifecycle performance monitoring.
  - Hardware is in scope but `manufacturing_context` has no supplier/process controls.

## 3.4 Confidence Validation
- If `risk_class.confidence = low` for a primary market and no mitigation plan is provided, block progression.
- If critical assumptions in `clinical_strategy` lack testable endpoints, block progression.

## 4) Insufficient-Input Gates (Hard Stops)

Agents **must not proceed** to drafting regulatory artifacts when any gate is triggered.

| Gate ID | Trigger | Blocking Reason | Required Remediation |
|---|---|---|---|
| `GATE-01-INTENDED-USE` | Intended use missing any required sub-element. | Claims cannot be translated into regulatory scope or evidence plan. | Provide full intended-use statement with all required sub-elements. |
| `GATE-02-MARKET-SCOPE` | Target markets missing or no primary market identified. | Submission pathway and deliverable requirements are undefined. | Add target markets and name primary launch market. |
| `GATE-03-RISK-CLASS` | No per-market risk-class proposal and rationale. | Cannot determine controls, testing depth, or submission type. | Provide market-specific classification hypothesis with confidence and open questions. |
| `GATE-04-TECH-BOUNDARY` | Technology or software/hardware scope incomplete. | Safety, cybersecurity, and verification boundaries are ambiguous. | Define technical architecture, interfaces, and trust boundaries. |
| `GATE-05-CLINICAL-STRATEGY` | Clinical strategy lacks endpoints or acceptance criteria. | Evidence generation is non-actionable and non-auditable. | Add measurable endpoints and pass/fail criteria aligned to intended use. |
| `GATE-06-MFG-CONTEXT` | Manufacturing context lacks QMS/supplier/process ownership data. | Design transfer and production controls cannot be planned. | Provide QMS status, key suppliers, and control ownership. |

## 5) Agent Behavior on Gate Failure

When any gate fails, agents must:
1. Return a structured deficiency report (`gate_id`, missing items, impact).
2. Request only the missing critical inputs (not full re-intake).
3. Mark workflow state as `blocked_insufficient_input`.
4. Refuse to generate downstream required artifacts until all hard-stop gates are cleared.
