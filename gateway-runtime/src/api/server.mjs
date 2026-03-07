export const createApi = ({ orchestrator, state, registry }) => ({
  submitIssue: (issue) => orchestrator.intake(issue),
  getJob: (jobId) => state.getJob(jobId),
  listNodes: () => registry.listNodes(),
});
