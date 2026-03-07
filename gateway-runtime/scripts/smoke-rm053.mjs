import { createStateStore } from '../src/state/store.mjs';
import { createEventBus } from '../src/events/bus.mjs';
import { createLeaseManager } from '../src/scheduler/lease-manager.mjs';

const state = createStateStore();
const bus = createEventBus();
const lm = createLeaseManager({ state, bus, maxAttempts: 2, backoffMs: [1, 2] });

const t = state.createTask({ job_id: 'job_1', role: 'executor' });
const lease = state.createLease({ task_id: t.task_id, node_id: 'node-b', expires_at: new Date(Date.now() - 5000).toISOString() });

const ex = lm.sweepExpiredLeases(Date.now());
if (!ex.includes(lease.lease_id)) throw new Error('lease expiry not detected');

const r1 = lm.markFailure({ task_id: t.task_id, retryable: true, error: 'tmp' });
if (r1.action !== 'retry') throw new Error('expected retry');

const r2 = lm.markFailure({ task_id: t.task_id, retryable: true, error: 'tmp2' });
if (r2.action !== 'retry') throw new Error('expected retry #2');

const r3 = lm.markFailure({ task_id: t.task_id, retryable: true, error: 'tmp3' });
if (r3.action !== 'deadletter') throw new Error('expected deadletter');
if (lm.getDeadletters().length < 1) throw new Error('deadletter missing');

console.log('SMOKE_RM053_OK');
