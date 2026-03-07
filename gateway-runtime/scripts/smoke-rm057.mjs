import { createRuntime } from '../src/index.mjs';

const rt = createRuntime();

// no nodes => degraded
let tick = rt.scheduler.tick();
if (!tick.degraded) throw new Error('expected degraded without executor');

const queued = rt.scheduler.queueExecution({ task_id: 'task_exec_1', role: 'executor', complexity: 8 });
if (!queued.deferred) throw new Error('task should be deferred when executor offline');
if (rt.state.listDeferred().length !== 1) throw new Error('deferred queue should have 1 item');

// add executor node and recover
rt.registry.ingestHeartbeat({
  node_id: 'node-b',
  roles: ['executor'],
  providers: ['codex'],
  provider_health: { codex: 'ok' },
  ts: new Date().toISOString(),
});

tick = rt.scheduler.tick();
if (tick.degraded) throw new Error('expected non-degraded with executor online');

const replay = rt.scheduler.replayDeferredIfRecovered();
if (replay.count !== 1) throw new Error('expected deferred replay');
if (!rt.state.getTask('task_exec_1')) throw new Error('replayed task should be queued in state');

console.log('SMOKE_RM057_OK');
