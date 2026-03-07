import { TASK_STATUS, RUN_STATUS, canTransition } from './lifecycle.mjs';

let id = 0;
const nextId = (p) => `${p}_${++id}`;
const now = () => new Date().toISOString();

export const createStateStore = () => {
  const jobs = new Map();
  const tasks = new Map();
  const runs = new Map();
  const leases = new Map();
  const deferred = [];

  return {
    createJob: (job) => {
      const row = {
        job_id: nextId('job'),
        created_at: now(),
        updated_at: now(),
        ...job,
      };
      jobs.set(row.job_id, row);
      return row;
    },
    getJob: (jobId) => jobs.get(jobId) || null,

    createTask: (task) => {
      const row = {
        task_id: nextId('task'),
        status: 'queued',
        attempt: 0,
        created_at: now(),
        updated_at: now(),
        ...task,
      };
      tasks.set(row.task_id, row);
      return row;
    },
    getTask: (taskId) => tasks.get(taskId) || null,
    transitionTask: (taskId, to) => {
      const t = tasks.get(taskId);
      if (!t) throw new Error('task_not_found');
      if (!canTransition(TASK_STATUS, t.status, to)) throw new Error(`invalid_task_transition:${t.status}->${to}`);
      if (t.status === 'queued' && to === 'leased') t.attempt += 1;
      t.status = to;
      t.updated_at = now();
      tasks.set(taskId, t);
      return t;
    },

    createRun: (run) => {
      const row = {
        run_id: nextId('run'),
        status: 'started',
        started_at: now(),
        ended_at: null,
        ...run,
      };
      runs.set(row.run_id, row);
      return row;
    },
    transitionRun: (runId, to) => {
      const r = runs.get(runId);
      if (!r) throw new Error('run_not_found');
      if (!canTransition(RUN_STATUS, r.status, to)) throw new Error(`invalid_run_transition:${r.status}->${to}`);
      r.status = to;
      if (['completed', 'failed', 'timeout', 'canceled'].includes(to)) r.ended_at = now();
      runs.set(runId, r);
      return r;
    },

    createLease: (lease) => {
      const row = {
        lease_id: nextId('lease'),
        status: 'active',
        heartbeat_at: now(),
        expires_at: lease.expires_at || new Date(Date.now() + 90_000).toISOString(),
        ...lease,
      };
      leases.set(row.lease_id, row);
      return row;
    },
    touchLease: (leaseId, ttlMs = 90_000) => {
      const l = leases.get(leaseId);
      if (!l) throw new Error('lease_not_found');
      l.heartbeat_at = now();
      l.expires_at = new Date(Date.now() + ttlMs).toISOString();
      leases.set(leaseId, l);
      return l;
    },
    expireLease: (leaseId) => {
      const l = leases.get(leaseId);
      if (!l) throw new Error('lease_not_found');
      l.status = 'expired';
      l.heartbeat_at = now();
      leases.set(leaseId, l);
      return l;
    },
    releaseLease: (leaseId) => {
      const l = leases.get(leaseId);
      if (!l) throw new Error('lease_not_found');
      l.status = 'released';
      l.heartbeat_at = now();
      leases.set(leaseId, l);
      return l;
    },
    listLeases: () => [...leases.values()],

    deferTask: (task, reason = 'missing_executor') => {
      const row = { ...task, deferred_at: now(), reason };
      deferred.push(row);
      return row;
    },
    listDeferred: () => [...deferred],
    replayDeferred: (predicate = () => true) => {
      const kept = [];
      const replayed = [];
      for (const d of deferred) {
        if (predicate(d)) replayed.push(d);
        else kept.push(d);
      }
      deferred.length = 0;
      for (const k of kept) deferred.push(k);
      return replayed;
    },
    replayDeferredToQueued: (predicate = () => true) => {
      const replayed = [];
      const seen = new Set();
      const deferredItems = [];
      for (const d of deferred) {
        if (!predicate(d)) continue;
        deferredItems.push(d);
      }
      deferredItems.sort((a, b) => String(a.deferred_at).localeCompare(String(b.deferred_at)));

      const moved = [];
      for (const d of deferredItems) {
        const dedupeKey = d.task_id || d.idempotency_key || `${d.role || 'executor'}:${d.payload_hash || ''}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);

        const queuedTask = {
          ...d,
          status: 'queued',
          replayed_from_deferred: true,
          replayed_at: now(),
        };
        tasks.set(queuedTask.task_id, queuedTask);
        moved.push(queuedTask);
      }

      if (moved.length > 0) {
        const kept = [];
        for (const d of deferred) {
          if (predicate(d)) continue;
          kept.push(d);
        }
        deferred.length = 0;
        for (const k of kept) deferred.push(k);
      }

      replayed.push(...moved);
      return replayed;
    },
  };
};
