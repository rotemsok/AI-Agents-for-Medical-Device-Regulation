# Product Intake to Deliverable Mapping

This mapping links required intake data to downstream artifacts and identifies blocking dependencies.

## 1) Field-to-Artifact Traceability Matrix

| Intake Field | Downstream Required Artifacts | Why This Dependency Exists | Gate if Missing |
|---|---|---|---|
| `device_class` | Regulatory strategy memo; submission pathway decision record; standards applicability matrix. | Device class drives pathway, control level, and required evidence depth. | `GATE-03-RISK-CLASS` |
| `intended_use` | Intended-use statement; indications for use draft; claims matrix; clinical evaluation plan; labeling baseline. | Intended use anchors claims, endpoints, and labeling constraints. | `GATE-01-INTENDED-USE` |
| `technology` | System architecture description; hazard analysis input set; cybersecurity threat model; V&V strategy; software documentation set (if SaMD). | Technical mechanism defines hazards, interfaces, and verification approach. | `GATE-04-TECH-BOUNDARY` |
| `software_hardware_scope` | Design and development plan; SBOM/device BOM scope; interface control documentation; design history file index. | Scope boundaries determine controlled items and lifecycle obligations. | `GATE-04-TECH-BOUNDARY` |
| `target_markets` | Market-specific regulatory plan; jurisdictional submission checklist; timeline and sequencing plan. | Market scope determines which regulations and templates apply. | `GATE-02-MARKET-SCOPE` |
| `risk_class` | Risk management plan; submission type recommendation (e.g., 510(k)/De Novo/CE route); test rigor matrix; post-market surveillance depth. | Classification controls expected risk controls and submission route. | `GATE-03-RISK-CLASS` |
| `clinical_strategy` | Clinical development plan; clinical evaluation report outline; PMCF/PMS evidence strategy; biostatistics plan. | Evidence strategy must be defined before protocol and claims substantiation can proceed. | `GATE-05-CLINICAL-STRATEGY` |
| `manufacturing_context` | Quality plan; supplier controls plan; process validation plan; design transfer checklist; device master record scaffolding. | Manufacturing model determines production and quality controls required for compliance. | `GATE-06-MFG-CONTEXT` |

## 2) Artifact Readiness Rules

An artifact can be started only if all mapped upstream fields are valid and no linked hard-stop gate is open.

| Artifact | Minimum Intake Inputs Required |
|---|---|
| Regulatory strategy memo | `device_class`, `target_markets`, `risk_class`, `intended_use` |
| Submission pathway decision record | `target_markets`, `device_class`, `risk_class`, `technology` |
| Claims matrix | `intended_use`, `clinical_strategy` |
| Clinical evaluation plan | `intended_use`, `clinical_strategy`, `risk_class`, `target_markets` |
| Hazard analysis (initial) | `technology`, `software_hardware_scope`, `intended_use`, `risk_class` |
| Cybersecurity threat model | `technology`, `software_hardware_scope`, `target_markets` |
| V&V strategy | `technology`, `software_hardware_scope`, `risk_class`, `clinical_strategy` |
| Quality plan / supplier controls | `manufacturing_context`, `software_hardware_scope`, `risk_class` |

## 3) Insufficient-Input Decision Logic

Use the following logic before any artifact-generation task:

1. Validate intake schema and sub-element completeness.
2. Evaluate hard-stop gates (`GATE-01` to `GATE-06`).
3. For requested artifact, confirm all required intake inputs are present and valid.
4. If any condition fails, return `blocked_insufficient_input` with explicit missing fields and linked gate IDs.

### Standard Block Response Template

```yaml
status: blocked_insufficient_input
artifact_request: <artifact_name>
open_gates:
  - <gate_id>
missing_fields:
  - <field>
  - <field.sub_element>
impact: <why generation cannot proceed safely/compliantly>
required_user_action:
  - <specific data needed>
```

## 4) Progression Criteria (Gate Clearance)

Agents may proceed only when all are true:
- All required intake fields are present and valid.
- No hard-stop gates are open.
- Requested artifact has all dependencies satisfied in the readiness matrix.
- Any low-confidence assumptions have documented mitigation and owner.
