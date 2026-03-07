export const TASK_STATUS = {
  queued: ['leased'],
  leased: ['running', 'queued'],
  running: ['review', 'repair', 'done', 'failed'],
  review: ['done', 'repair', 'failed'],
  repair: ['running', 'failed'],
  failed: ['deadletter', 'queued'],
  blocked: ['queued', 'deadletter'],
  deadletter: [],
  done: [],
};

export const RUN_STATUS = {
  started: ['completed', 'failed', 'timeout', 'canceled'],
  completed: [],
  failed: [],
  timeout: [],
  canceled: [],
};

export const canTransition = (map, from, to) => (map[from] || []).includes(to);
