const mkEnvelope = ({ type, jobId, payload, producer = 'gateway-runtime' }) => ({
  event_id: `evt_${Math.random().toString(36).slice(2, 10)}`,
  event_type: type,
  ts: new Date().toISOString(),
  trace_id: `tr_${Math.random().toString(36).slice(2, 10)}`,
  job_id: jobId,
  task_id: 'task_bootstrap',
  run_id: 'run_bootstrap',
  producer,
  payload,
});

export const createOrchestrator = ({ state, bus }) => ({
  intake: (issue) => {
    const job = state.createJob({ type: 'repo_issue', goal: issue?.goal || 'unspecified', status: 'queued' });
    bus.publish('evt.issue.intake.v1', mkEnvelope({
      type: 'evt.issue.intake.v1',
      jobId: job.job_id,
      payload: { issue },
    }));
    return job;
  },
});
