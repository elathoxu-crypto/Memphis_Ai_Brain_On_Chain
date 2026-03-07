import { validateEnvelope, routeGroup } from './contracts.mjs';

export const createSubjectRouter = ({ onDeadletter }) => ({
  route: (envelope) => {
    const validation = validateEnvelope(envelope);
    if (!validation.ok) {
      onDeadletter?.({
        event_type: 'sys.deadletter.created.v1',
        reason: validation.error,
        envelope,
      });
      return { ok: false, ...validation };
    }

    return {
      ok: true,
      group: routeGroup(envelope.event_type),
      subject: envelope.event_type,
    };
  },
});
