import { createApi } from './api/server.mjs';
import { createOrchestrator } from './orchestrator/index.mjs';
import { createStateStore } from './state/store.mjs';
import { createEventBus } from './events/bus.mjs';
import { createScheduler } from './scheduler/index.mjs';
import { createRegistry } from './registry/index.mjs';

export const createRuntime = () => {
  const state = createStateStore();
  const bus = createEventBus();
  const registry = createRegistry({ state });
  const orchestrator = createOrchestrator({ state, bus, registry });
  const scheduler = createScheduler({ state, bus, registry, orchestrator });
  const api = createApi({ orchestrator, state, registry });

  return { state, bus, registry, orchestrator, scheduler, api };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const runtime = createRuntime();
  console.log('gateway-runtime booted', {
    modules: Object.keys(runtime),
    version: '0.1.0'
  });
}
