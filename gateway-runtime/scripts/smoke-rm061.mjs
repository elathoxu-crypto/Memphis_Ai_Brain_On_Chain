import { createRuntime } from '../src/index.mjs';

const rt = createRuntime();

// OFFLINE phase: no executor available
const tickOffline = rt.scheduler.tick();
if (!tickOffline.degraded) throw new Error('expected degraded mode while executor offline');

const d1 = rt.scheduler.queueExecution({ task_id: 'off_1', role: 'executor', complexity: 8 });
const d2 = rt.scheduler.queueExecution({ task_id: 'off_2', role: 'executor', complexity: 9 });
if (!d1.deferred || !d2.deferred) throw new Error('offline tasks should be deferred');
if (rt.state.listDeferred().length !== 2) throw new Error('expected 2 deferred tasks while offline');

// ONLINE phase: rejoin heartbeat arrives
rt.registry.ingestHeartbeat({
  node_id: 'node-b',
  roles: ['executor'],
  providers: ['codex'],
  provider_health: { codex: 'ok' },
  ts: new Date().toISOString(),
});

const tickOnline = rt.scheduler.tick();
if (tickOnline.degraded) throw new Error('expected non-degraded mode after node rejoin');

const replay = rt.scheduler.replayDeferredIfRecovered();
if (replay.count !== 2) throw new Error('expected replay of deferred backlog after rejoin');
if (rt.state.listDeferred().length !== 0) throw new Error('deferred queue should be empty after replay');

if (!rt.state.getTask('off_1') || !rt.state.getTask('off_2')) {
  throw new Error('replayed tasks not present in queued state');
}

console.log('SMOKE_RM061_OK offline defer -> online resume');
