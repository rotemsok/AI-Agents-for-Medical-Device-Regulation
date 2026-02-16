# AI-Agents-for-Medical-Device-Regulation

Initial implementation of a spec-driven MVP backend for the platform defined in `/docs`.

## What is implemented

- FastAPI service scaffold with core validation APIs.
- Intake hard-stop validation gates (GATE-01..05 + consistency checks).
- Evidence-backed statement validation with mandatory `missing_evidence` behavior.
- Workflow handoff packet acceptance checks (criteria evidence, high-risk controls, approvals, blocker rules).
- Immutable-style audit event chain with `previous_event_hash` enforcement and event hashing.

## Endpoints

- `GET /health`
- `POST /intake/validate`
- `POST /evidence/statements/validate`
- `POST /workflow/packets/validate`
- `POST /audit/events`
- `GET /audit/events`

## Quickstart

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .[dev]
uvicorn app.main:app --reload
```

## Test

```bash
pytest
```
