const nowIso = () => new Date().toISOString();

export const createLockManager = ({ defaultTtlMs = 105_000 } = {}) => {
  const locks = new Map(); // key => lock row

  const lockKey = (repo, path) => `${repo}:${path}`;

  const acquire = ({ repo, path, task_id, node_id, ttlMs = defaultTtlMs }) => {
    const key = lockKey(repo, path);
    const existing = locks.get(key);
    const now = Date.now();

    if (existing && new Date(existing.expires_at).getTime() > now) {
      return {
        ok: false,
        reason: 'locked',
        lock: existing,
      };
    }

    const lock = {
      lock_id: `lock_${Math.random().toString(36).slice(2, 10)}`,
      repo,
      path,
      task_id,
      node_id,
      acquired_at: nowIso(),
      expires_at: new Date(now + ttlMs).toISOString(),
    };
    locks.set(key, lock);
    return { ok: true, lock };
  };

  const release = ({ repo, path, task_id }) => {
    const key = lockKey(repo, path);
    const existing = locks.get(key);
    if (!existing) return { ok: false, reason: 'not_found' };
    if (task_id && existing.task_id !== task_id) return { ok: false, reason: 'not_owner', lock: existing };
    locks.delete(key);
    return { ok: true };
  };

  const sweepExpired = (nowTs = Date.now()) => {
    const removed = [];
    for (const [key, lock] of locks.entries()) {
      if (new Date(lock.expires_at).getTime() <= nowTs) {
        locks.delete(key);
        removed.push(lock);
      }
    }
    return removed;
  };

  const list = () => [...locks.values()];

  return { acquire, release, sweepExpired, list };
};
