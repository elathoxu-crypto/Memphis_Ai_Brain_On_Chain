const DEFAULTS = {
  offlineMs: 45000,
  degradedMs: 30000,
};

export const computeNodeStatus = (node, nowTs = Date.now(), cfg = DEFAULTS) => {
  const hbTs = new Date(node.last_heartbeat_at || 0).getTime();
  const age = nowTs - hbTs;

  if (!Number.isFinite(hbTs) || hbTs <= 0 || age > cfg.offlineMs) return 'offline';

  const providerFail = Object.values(node.provider_health || {}).some((v) => v !== 'ok');
  if (age > cfg.degradedMs || providerFail) return 'degraded';

  return 'online';
};

export const createHeartbeatMonitor = ({ registry, cfg = DEFAULTS } = {}) => ({
  evaluate: (nowTs = Date.now()) => {
    const nodes = registry.listNodes();
    const out = [];
    for (const n of nodes) {
      const status = computeNodeStatus(n, nowTs, cfg);
      if (n.status !== status) registry.setStatus(n.node_id, status);
      out.push({ node_id: n.node_id, status });
    }
    return out;
  },
});
