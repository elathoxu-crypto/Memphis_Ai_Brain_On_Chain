export const createLeaseManager = ({ state, bus, maxAttempts = 3, backoffMs = [10_000, 30_000, 90_000] }) => {
  const retries = new Map();
  const deadletters = [];

  const markFailure = ({ task_id, retryable = true, error = 'unknown' }) => {
    const attempt = (retries.get(task_id) || 0) + 1;
    retries.set(task_id, attempt);

    if (!retryable || attempt > maxAttempts) {
      const dl = {
        event_id: `dl_${Math.random().toString(36).slice(2, 10)}`,
        event_type: 'sys.deadletter.created.v1',
        ts: new Date().toISOString(),
        trace_id: `tr_${Math.random().toString(36).slice(2, 10)}`,
        producer: 'lease-manager',
        task_id,
        payload: { error, attempts: attempt },
      };
      deadletters.push(dl);
      bus.publish(dl.event_type, dl);
      return { action: 'deadletter', attempts: attempt };
    }

    return { action: 'retry', attempts: attempt, backoffMs: backoffMs[Math.min(attempt - 1, backoffMs.length - 1)] };
  };

  const sweepExpiredLeases = (nowTs = Date.now()) => {
    const expired = [];
    for (const l of state.listLeases()) {
      if (l.status !== 'active') continue;
      if (new Date(l.expires_at).getTime() <= nowTs) {
        state.expireLease(l.lease_id);
        const evt = {
          event_id: `ls_${Math.random().toString(36).slice(2, 10)}`,
          event_type: 'sys.lease.expired.v1',
          ts: new Date().toISOString(),
          trace_id: `tr_${Math.random().toString(36).slice(2, 10)}`,
          producer: 'lease-manager',
          task_id: l.task_id,
          payload: { lease_id: l.lease_id, node_id: l.node_id },
        };
        bus.publish(evt.event_type, evt);
        expired.push(l.lease_id);
      }
    }
    return expired;
  };

  return {
    markFailure,
    sweepExpiredLeases,
    getDeadletters: () => [...deadletters],
  };
};
