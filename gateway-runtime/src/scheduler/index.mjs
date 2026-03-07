import { createLeaseManager } from './lease-manager.mjs';
import { createLockManager } from './lock-manager.mjs';
import { createFallbackExecutor } from './fallback-executor.mjs';

export const createScheduler = ({ state, bus, registry }) => {
  const leases = createLeaseManager({ state, bus });
  const locks = createLockManager({});
  const fallback = createFallbackExecutor({ maxComplexity: 3 });

  const hasOnlineExecutor = () => registry?.listNodes?.().some((n) => (n.roles || []).includes('executor') && n.status !== 'offline');

  return {
    tick: () => ({
      ok: true,
      ts: new Date().toISOString(),
      degraded: !hasOnlineExecutor(),
      expiredLeases: leases.sweepExpiredLeases(),
      expiredLocks: locks.sweepExpired(),
    }),
    queueExecution: (task) => {
      if (!hasOnlineExecutor()) {
        if (fallback.canRunLocal(task)) {
          return { deferred: false, local: true, result: fallback.runLocal(task) };
        }
        return { deferred: true, item: state.deferTask(task, 'executor_offline') };
      }
      return { deferred: false, task };
    },
    replayDeferredIfRecovered: () => {
      if (!hasOnlineExecutor()) return { replayed: [], count: 0, recovered: false };
      const replayed = state.replayDeferredToQueued((d) => d.reason === 'executor_offline');
      return {
        replayed,
        count: replayed.length,
        recovered: true,
        ts: new Date().toISOString(),
      };
    },
    leases,
    locks,
  };
};
