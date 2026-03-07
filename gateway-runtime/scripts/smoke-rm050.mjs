import { createEventBus } from '../src/events/bus.mjs';

const bus = createEventBus();
let got = 0;
bus.subscribe('evt.task.started.v1', () => { got += 1; });

const valid = {
  event_id: 'e1',
  event_type: 'evt.task.started.v1',
  ts: new Date().toISOString(),
  trace_id: 't1',
  job_id: 'job_1',
  task_id: 'task_1',
  run_id: 'run_1',
  producer: 'smoke',
  payload: { ok: true },
};

const ok = bus.publish(valid.event_type, valid);
if (!ok?.ok) throw new Error('valid envelope rejected');
if (got !== 1) throw new Error('router delivery failed');

const bad = bus.publish('evt.task.started.v1', { event_type: 'evt.task.started.v1' });
if (bad?.ok) throw new Error('invalid envelope accepted');
if (bus.getDeadletters().length < 1) throw new Error('deadletter not recorded');

console.log('SMOKE_RM050_OK');
