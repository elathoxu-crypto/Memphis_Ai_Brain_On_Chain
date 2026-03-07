import { createRuntime } from '../src/index.mjs';

const rt = createRuntime();

// offline executor => deferred backlog
rt.scheduler.queueExecution({ task_id: 't_backlog_1', role: 'executor', complexity: 9 });
rt.scheduler.queueExecution({ task_id: 't_backlog_2', role: 'executor', complexity: 7 });
rt.scheduler.queueExecution({ task_id: 't_backlog_2', role: 'executor', complexity: 7 }); // duplicate idempotency scenario

if (rt.state.listDeferred().length !== 3) throw new Error('expected 3 deferred entries before recovery');

// node-b returns
rt.registry.ingestHeartbeat({
  node_id: 'node-b',
  roles: ['executor'],
  providers: ['codex'],
  provider_health: { codex: 'ok' },
  ts: new Date().toISOString(),
});

const replay = rt.scheduler.replayDeferredIfRecovered();
if (!replay.recovered) throw new Error('expected recovered=true');
if (replay.count !== 2) throw new Error('expected deduped replay count=2');
if (rt.state.listDeferred().length !== 0) throw new Error('deferred queue should be empty after replay');
if (!rt.state.getTask('t_backlog_1')) throw new Error('missing replayed task t_backlog_1');
if (!rt.state.getTask('t_backlog_2')) throw new Error('missing replayed task t_backlog_2');

console.log('SMOKE_RM060_OK');
