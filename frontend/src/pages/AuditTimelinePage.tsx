import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AuditEvent, appendAuditEvent, listAuditEvents } from '../lib/api';

export function AuditTimelinePage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [eventType, setEventType] = useState('handoff.validated');
  const [actor, setActor] = useState('frontend-user');
  const [payloadText, setPayloadText] = useState('{"packet_id":"PKT-001","status":"validated"}');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const previousHash = useMemo(() => events.at(-1)?.hash ?? null, [events]);

  const loadEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await listAuditEvents();
      setEvents(response);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : 'Failed to load audit timeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, []);

  const append = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      const parsedPayload = JSON.parse(payloadText) as Record<string, unknown>;
      const newEvent: AuditEvent = {
        event_id: `EV-${Date.now()}`,
        event_type: eventType,
        actor,
        timestamp: new Date().toISOString(),
        payload: parsedPayload,
        previous_event_hash: previousHash,
      };

      const appended = await appendAuditEvent(newEvent);
      setEvents((current) => [...current, appended]);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : 'Failed to append event');
    }
  };

  return (
    <section>
      <h2>Audit timeline</h2>
      <p>Review immutable event chain and append new events via /audit/events.</p>

      <form onSubmit={append} className="panel-stack">
        <div className="panel">
          <h3>Append event</h3>
          <label>
            Event type
            <input value={eventType} onChange={(event) => setEventType(event.target.value)} />
          </label>
          <label>
            Actor
            <input value={actor} onChange={(event) => setActor(event.target.value)} />
          </label>
          <label>
            Payload JSON
            <textarea value={payloadText} onChange={(event) => setPayloadText(event.target.value)} />
          </label>
          <p>
            previous_event_hash: <code>{previousHash ?? 'null (genesis event)'}</code>
          </p>
          <div className="button-row">
            <button type="submit">Append event</button>
            <button type="button" onClick={() => void loadEvents()}>
              Refresh timeline
            </button>
          </div>
        </div>
      </form>

      {loading && <p>Loading timeline...</p>}
      {error && <p className="error">{error}</p>}

      <div className="panel">
        <h3>Event timeline ({events.length})</h3>
        <ol className="timeline">
          {events.map((event) => (
            <li key={event.hash ?? event.event_id}>
              <strong>{event.event_type}</strong> by {event.actor} at{' '}
              {new Date(event.timestamp).toLocaleString()}
              <div>
                <small>event_id: {event.event_id}</small>
              </div>
              <div>
                <small>previous: {event.previous_event_hash ?? 'null'}</small>
              </div>
              <div>
                <small>hash: {event.hash ?? 'pending'}</small>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
