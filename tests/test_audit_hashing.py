from datetime import datetime, timezone

from app.models import AuditEvent


FIXED_TIMESTAMP = datetime(2026, 1, 1, 12, 0, tzinfo=timezone.utc)


def build_event(payload: dict) -> AuditEvent:
    return AuditEvent(
        event_id="evt-1",
        event_type="prompt_captured",
        actor="user",
        timestamp=FIXED_TIMESTAMP,
        payload=payload,
        previous_event_hash="prev-123",
    )


def test_same_semantic_payload_produces_same_hash():
    payload_a = {"text": "hello", "meta": {"lang": "en", "tokens": 2}}
    payload_b = {"text": "hello", "meta": {"lang": "en", "tokens": 2}}

    assert build_event(payload_a).compute_hash() == build_event(payload_b).compute_hash()


def test_payload_key_order_differences_do_not_change_hash():
    payload_a = {"a": 1, "b": {"x": True, "y": [1, 2, 3]}}
    payload_b = {"b": {"y": [1, 2, 3], "x": True}, "a": 1}

    assert build_event(payload_a).compute_hash() == build_event(payload_b).compute_hash()


def test_changed_payload_content_changes_hash():
    original_payload = {"text": "hello", "meta": {"lang": "en", "tokens": 2}}
    changed_payload = {"text": "hello", "meta": {"lang": "en", "tokens": 3}}

    assert build_event(original_payload).compute_hash() != build_event(changed_payload).compute_hash()
