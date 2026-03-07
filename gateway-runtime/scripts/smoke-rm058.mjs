import { createRuntime } from '../src/index.mjs';

const rt = createRuntime();

const smallTask = { task_id: 't_small', role: 'executor', complexity: 2 };
const largeTask = { task_id: 't_large', role: 'executor', complexity: 8 };

const a = rt.scheduler.queueExecution(smallTask);
if (!a.local || a.deferred) throw new Error('small task should run local fallback');

const b = rt.scheduler.queueExecution(largeTask);
if (!b.deferred) throw new Error('large task should be deferred when executor offline');

console.log('SMOKE_RM058_OK');
