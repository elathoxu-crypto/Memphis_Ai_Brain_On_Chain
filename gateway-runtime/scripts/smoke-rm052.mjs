import { createRegistry } from '../src/registry/index.mjs';
import { createHeartbeatMonitor } from '../src/registry/heartbeat.mjs';

const registry = createRegistry();
registry.ingestHeartbeat({
  node_id: 'node-a',
  roles: ['planner'],
  providers: ['claude'],
  provider_health: { claude: 'ok' },
  ts: new Date().toISOString(),
});

const mon = createHeartbeatMonitor({ registry });
let out = mon.evaluate(Date.now());
if (out[0]?.status !== 'online') throw new Error('expected online');

registry.ingestHeartbeat({
  node_id: 'node-b',
  roles: ['executor'],
  providers: ['codex'],
  provider_health: { codex: 'fail' },
  ts: new Date(Date.now() - 1000).toISOString(),
});
out = mon.evaluate(Date.now());
const b = registry.getNode('node-b');
if (b.status !== 'degraded') throw new Error('expected degraded');

registry.ingestHeartbeat({
  node_id: 'node-c',
  roles: ['repair'],
  providers: ['minimax'],
  provider_health: { minimax: 'ok' },
  ts: new Date(Date.now() - 60000).toISOString(),
});
out = mon.evaluate(Date.now());
const c = registry.getNode('node-c');
if (c.status !== 'offline') throw new Error('expected offline');

console.log('SMOKE_RM052_OK');
