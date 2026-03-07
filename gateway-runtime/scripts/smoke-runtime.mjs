import { createRuntime } from '../src/index.mjs';

const rt = createRuntime();
const job = rt.api.submitIssue({ goal: 'smoke distributed runtime' });
if (!job?.job_id) throw new Error('missing job id');

console.log('SMOKE_GATEWAY_RUNTIME_OK', job.job_id);
