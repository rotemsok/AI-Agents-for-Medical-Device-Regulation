from datetime import datetime, timezone

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def valid_intake_payload() -> dict:
    return {
        "device_class": "II",
        "intended_use": {
            "clinical_condition": "Atrial fibrillation risk screening",
            "target_population": "Adults",
            "intended_user": "Cardiologists",
            "use_environment": "Hospital",
            "primary_output_and_decision_impact": "Risk score used for triage",
            "exclusions_or_contraindications": "None known",
        },
        "technology": {
            "product_modality": "SaMD",
            "primary_technical_mechanism": "ML classification",
            "data_inputs_and_dependencies": "ECG waveform and demographics",
            "ai_ml_behavior": "locked",
        },
        "software_hardware_scope": {
            "software_components": ["mobile app", "backend api"],
            "hardware_components": ["none"],
            "external_interfaces": ["ehr"],
            "cybersecurity_trust_boundaries": ["mobile->cloud"],
        },
        "target_markets": ["US", "EU"],
        "primary_launch_market": "US",
        "risk_class": [
            {
                "market": "US",
                "proposed_classification": "Class II",
                "rationale": "predicate hypothesis",
                "confidence": "high",
                "open_questions": [],
            },
            {
                "market": "EU",
                "proposed_classification": "Class IIa",
                "rationale": "rule 11 candidate",
                "confidence": "medium",
                "open_questions": ["Confirm rule interpretation"],
            },
        ],
        "clinical_strategy": {
            "evidence_sources": ["literature", "retrospective study"],
            "study_design_assumptions": ["multicenter retrospective"],
            "primary_endpoints": ["sensitivity", "specificity"],
            "acceptance_criteria": [">=0.85 sensitivity"],
            "gaps_and_mitigation_plan": "Prospective study planned.",
            "lifecycle_monitoring_plan": "Quarterly drift monitoring",
        },
        "manufacturing_context": {
            "organization_model": "in-house software",
            "qms_status": "ISO 13485 implemented",
            "critical_suppliers": ["cloud vendor"],
            "process_controls": ["design control", "change control"],
            "post_market_change_control_owner": "RA/QA",
        },
    }


def test_intake_gate_triggers_for_missing_intended_use_fields():
    payload = valid_intake_payload()
    payload["intended_use"].pop("target_population")

    response = client.post("/intake/validate", json=payload)
    body = response.json()

    assert response.status_code == 200
    assert body["valid"] is False
    assert any(issue["code"] == "GATE-01-INTENDED-USE" for issue in body["issues"])


def test_evidence_validation_returns_missing_evidence_when_unlinked():
    response = client.post(
        "/evidence/statements/validate",
        json={
            "statements": [{"statement": "Claim with no links", "evidence_ids": []}],
            "evidence_objects": [],
        },
    )

    assert response.status_code == 200
    result = response.json()[0]
    assert result["status"] == "missing_evidence"


def test_intake_validation_flags_duplicate_risk_class_markets():
    payload = valid_intake_payload()
    payload["risk_class"].append(
        {
            "market": "US",
            "proposed_classification": "Class II",
            "rationale": "duplicate entry",
            "confidence": "high",
            "open_questions": [],
        }
    )

    response = client.post("/intake/validate", json=payload)
    body = response.json()

    assert response.status_code == 200
    assert body["valid"] is False
    assert any(issue["code"] == "GATE-03-RISK-CLASS-DUPLICATE" for issue in body["issues"])


def test_intake_validation_flags_missing_target_market_risk_class_entry():
    payload = valid_intake_payload()
    payload["risk_class"] = [entry for entry in payload["risk_class"] if entry["market"] != "EU"]

    response = client.post("/intake/validate", json=payload)
    body = response.json()

    assert response.status_code == 200
    assert body["valid"] is False
    assert any(issue["code"] == "GATE-03-RISK-CLASS-MISSING-TARGET-MARKET" for issue in body["issues"])


def test_intake_validation_flags_extraneous_risk_class_market_entry():
    payload = valid_intake_payload()
    payload["risk_class"].append(
        {
            "market": "CA",
            "proposed_classification": "Class II",
            "rationale": "future expansion",
            "confidence": "medium",
            "open_questions": [],
        }
    )

    response = client.post("/intake/validate", json=payload)
    body = response.json()

    assert response.status_code == 200
    assert body["valid"] is False
    assert any(issue["code"] == "GATE-03-RISK-CLASS-EXTRANEOUS-MARKET" for issue in body["issues"])


def test_packet_validation_fails_without_approvals_and_verified_high_risk_controls():
    response = client.post(
        "/workflow/packets/validate",
        json={
            "packet_id": "PKT-2026-001",
            "title": "Design handoff",
            "owner_agent": "Engineering",
            "target_agent": "RAQA",
            "source_requirements": [{"id": "REQ-1", "version": "v1"}],
            "risk_controls": [
                {
                    "risk_id": "RISK-1",
                    "control_id": "CTRL-1",
                    "verified": False,
                    "severity": "high",
                }
            ],
            "acceptance_criteria": [
                {
                    "id": "AC-1",
                    "statement": "Do thing",
                    "verification_method": "test",
                    "evidence_ref": "EV-1",
                }
            ],
            "evidence_index": ["EV-1"],
            "required_approvers": ["RA&QA"],
            "approval_log": [],
            "blocker_defects_open": 1,
            "approved_exception": False,
        },
    )
    body = response.json()

    assert response.status_code == 200
    assert body["acceptable"] is False
    codes = {issue["code"] for issue in body["issues"]}
    assert "PACKET-HIGH-RISK-CONTROLS" in codes
    assert "PACKET-REQUIRED-APPROVALS" in codes
    assert "PACKET-BLOCKER-DEFECTS" in codes


def test_audit_event_chain_enforces_previous_hash():
    first_event = {
        "event_id": "evt-1",
        "event_type": "prompt_captured",
        "actor": "user",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "payload": {"text": "hello"},
        "previous_event_hash": None,
    }
    first_response = client.post("/audit/events", json=first_event)
    assert first_response.status_code == 200
    first_hash = first_response.json()["hash"]

    second_event_bad = {
        "event_id": "evt-2",
        "event_type": "output_generated",
        "actor": "agent",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "payload": {"text": "world"},
        "previous_event_hash": "wrong-hash",
    }
    second_response_bad = client.post("/audit/events", json=second_event_bad)
    assert second_response_bad.status_code == 400

    second_event_ok = {**second_event_bad, "previous_event_hash": first_hash}
    second_response_ok = client.post("/audit/events", json=second_event_ok)
    assert second_response_ok.status_code == 200
