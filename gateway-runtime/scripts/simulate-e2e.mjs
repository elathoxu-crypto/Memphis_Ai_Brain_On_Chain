import { createRuntime } from '../src/index.mjs';

const rt = createRuntime();

const timeline = [];
const push = (step, data = {}) => timeline.push({ ts: new Date().toISOString(), step, ...data });

// Mock nodes
rt.registry.ingestHeartbeat({
  node_id: 'node-a',
  roles: ['planner', 'reviewer'],
  providers: ['claude', 'minimax'],
  provider_health: { claude: 'ok', minimax: 'ok' },
  ts: new Date().toISOString(),
});
rt.registry.ingestHeartbeat({
  node_id: 'node-b',
  roles: ['executor', 'repair', 'test'],
  providers: ['codex', 'minimax'],
  provider_health: { codex: 'ok', minimax: 'ok' },
  ts: new Date().toISOString(),
});
push('nodes.ready', { count: rt.registry.listNodes().length });

// issue -> plan
const job = rt.api.submitIssue({ goal: 'fix auth cache regression' });
push('issue.intake', { job_id: job.job_id });
const planTask = rt.state.createTask({ job_id: job.job_id, role: 'planner', acceptance: ['task graph generated'] });
rt.state.transitionTask(planTask.task_id, 'leased');
rt.state.transitionTask(planTask.task_id, 'running');
rt.state.transitionTask(planTask.task_id, 'done');
push('plan.done', { task_id: planTask.task_id });

// execute
const execTask = rt.state.createTask({ job_id: job.job_id, role: 'executor', acceptance: ['patch created'] });
rt.state.transitionTask(execTask.task_id, 'leased');
rt.state.transitionTask(execTask.task_id, 'running');
rt.state.transitionTask(execTask.task_id, 'review');
push('execute.done', { task_id: execTask.task_id });

// review -> fail
const reviewTask = rt.state.createTask({ job_id: job.job_id, role: 'reviewer', acceptance: ['no regressions'] });
rt.state.transitionTask(reviewTask.task_id, 'leased');
rt.state.transitionTask(reviewTask.task_id, 'running');
rt.state.transitionTask(reviewTask.task_id, 'failed');
push('review.failed', { task_id: reviewTask.task_id });

// repair
const repairTask = rt.state.createTask({ job_id: job.job_id, role: 'repair', acceptance: ['tests pass'] });
rt.state.transitionTask(repairTask.task_id, 'leased');
rt.state.transitionTask(repairTask.task_id, 'running');
rt.state.transitionTask(repairTask.task_id, 'done');
push('repair.done', { task_id: repairTask.task_id });

// review pass
const review2 = rt.state.createTask({ job_id: job.job_id, role: 'reviewer', acceptance: ['approved'] });
rt.state.transitionTask(review2.task_id, 'leased');
rt.state.transitionTask(review2.task_id, 'running');
rt.state.transitionTask(review2.task_id, 'done');
push('review.approved', { task_id: review2.task_id });

push('flow.done', { job_id: job.job_id });

console.log(JSON.stringify({ ok: true, flow: 'issue->plan->execute->review->repair->done', timeline }, null, 2));
