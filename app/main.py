from __future__ import annotations

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from app.models import (
    AuditEvent,
    EvidenceObject,
    HandoffPacket,
    IntakePayload,
    StatementCandidate,
)
from app.services import EvidencePolicy, ImmutableAuditLog, IntakeValidator, PacketValidator

app = FastAPI(title="Medical Regulation Platform MVP", version="0.1.0")
audit_log = ImmutableAuditLog()


class StatementValidationRequest(BaseModel):
    statements: list[StatementCandidate]
    evidence_objects: list[EvidenceObject]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/intake/validate")
def validate_intake(payload: IntakePayload):
    return IntakeValidator.validate(payload)


@app.post("/evidence/statements/validate")
def validate_statements(payload: StatementValidationRequest):
    evidence_ids = {ev.id for ev in payload.evidence_objects}
    confidence_map = {ev.id: ev.confidence for ev in payload.evidence_objects}
    return EvidencePolicy.validate_statements(payload.statements, evidence_ids, confidence_map)


@app.post("/workflow/packets/validate")
def validate_packet(packet: HandoffPacket):
    return PacketValidator.validate(packet)


@app.post("/audit/events")
def append_audit_event(event: AuditEvent):
    try:
        return audit_log.append(event)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/audit/events")
def list_audit_events():
    return audit_log.events
