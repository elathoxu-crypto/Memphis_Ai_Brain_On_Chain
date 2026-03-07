import { createLockManager } from '../src/scheduler/lock-manager.mjs';

const lm = createLockManager({ defaultTtlMs: 1000 });

const a1 = lm.acquire({ repo: 'org/app', path: 'src/a.ts', task_id: 'task1', node_id: 'node-b' });
if (!a1.ok) throw new Error('first acquire should pass');

const a2 = lm.acquire({ repo: 'org/app', path: 'src/a.ts', task_id: 'task2', node_id: 'node-c' });
if (a2.ok) throw new Error('second acquire should be blocked');

const rBad = lm.release({ repo: 'org/app', path: 'src/a.ts', task_id: 'task2' });
if (rBad.ok) throw new Error('non-owner release should fail');

const r1 = lm.release({ repo: 'org/app', path: 'src/a.ts', task_id: 'task1' });
if (!r1.ok) throw new Error('owner release should pass');

const a3 = lm.acquire({ repo: 'org/app', path: 'src/a.ts', task_id: 'task3', node_id: 'node-c', ttlMs: 1 });
if (!a3.ok) throw new Error('reacquire should pass');

const expired = lm.sweepExpired(Date.now() + 10);
if (expired.length < 1) throw new Error('expired sweep failed');

console.log('SMOKE_RM054_OK');
