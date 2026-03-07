export const createRegistry = () => {
  const nodes = new Map();

  return {
    upsertNode: (node) => {
      const prev = nodes.get(node.node_id) || {};
      const row = {
        status: 'online',
        ...prev,
        ...node,
        updated_at: new Date().toISOString(),
      };
      nodes.set(node.node_id, row);
      return row;
    },
    ingestHeartbeat: (hb) => {
      const prev = nodes.get(hb.node_id) || {};
      const row = {
        ...prev,
        node_id: hb.node_id,
        roles: hb.roles || prev.roles || [],
        providers: hb.providers || prev.providers || [],
        max_concurrency: hb.max_concurrency || prev.max_concurrency || 1,
        provider_health: hb.provider_health || prev.provider_health || {},
        active_tasks: hb.active_tasks ?? prev.active_tasks ?? 0,
        last_heartbeat_at: hb.ts || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: prev.status || 'online',
      };
      nodes.set(hb.node_id, row);
      return row;
    },
    setStatus: (nodeId, status) => {
      const n = nodes.get(nodeId);
      if (!n) return null;
      n.status = status;
      n.updated_at = new Date().toISOString();
      nodes.set(nodeId, n);
      return n;
    },
    getNode: (nodeId) => nodes.get(nodeId) || null,
    listNodes: () => [...nodes.values()],
  };
};
