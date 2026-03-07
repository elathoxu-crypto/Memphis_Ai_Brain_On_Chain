import { createSubjectRouter } from './router.mjs';

export const createEventBus = () => {
  const subscribers = new Map();
  const deadletters = [];
  const router = createSubjectRouter({
    onDeadletter: (entry) => deadletters.push({ ...entry, ts: new Date().toISOString() }),
  });

  return {
    publish: (topic, payload) => {
      const envelope = payload?.event_type ? payload : { event_type: topic, ...payload };
      const routed = router.route(envelope);
      if (!routed.ok) return routed;

      const handlers = subscribers.get(routed.subject) || [];
      for (const h of handlers) h(envelope);
      return { ok: true, delivered: handlers.length };
    },
    subscribe: (topic, handler) => {
      const arr = subscribers.get(topic) || [];
      arr.push(handler);
      subscribers.set(topic, arr);
    },
    getDeadletters: () => [...deadletters],
  };
};
