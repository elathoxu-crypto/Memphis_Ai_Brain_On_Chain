import { createStateStore } from '../src/state/store.mjs';

const s = createStateStore();
const j = s.createJob({ type: 'repo_issue', status: 'queued' });
const t = s.createTask({ job_id: j.job_id, role: 'executor' });

s.transitionTask(t.task_id, 'leased');
s.transitionTask(t.task_id, 'running');
s.transitionTask(t.task_id, 'review');
s.transitionTask(t.task_id, 'done');

const r = s.createRun({ task_id: t.task_id, attempt: 1 });
s.transitionRun(r.run_id, 'completed');

const l = s.createLease({ task_id: t.task_id, node_id: 'node-b' });
s.releaseLease(l.lease_id);

let bad = false;
try { s.transitionTask(t.task_id, 'running'); } catch { bad = true; }
if (!bad) throw new Error('lifecycle guard failed');

console.log('SMOKE_RM051_OK');
