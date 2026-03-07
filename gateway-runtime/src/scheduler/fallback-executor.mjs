export const createFallbackExecutor = ({ maxComplexity = 3 } = {}) => {
  const canRunLocal = (task) => {
    const complexity = Number(task?.complexity || 1);
    const role = task?.role || 'executor';
    return role === 'executor' && complexity <= maxComplexity;
  };

  const runLocal = (task) => ({
    ok: true,
    mode: 'pc1-fallback',
    task_id: task.task_id,
    summary: `Executed locally (complexity=${task?.complexity || 1})`,
  });

  return { canRunLocal, runLocal };
};
