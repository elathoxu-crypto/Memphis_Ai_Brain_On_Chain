import { execSync } from 'node:child_process';

const run = (cmd) => execSync(cmd, { stdio: 'pipe', encoding: 'utf8' });

const out1 = run('node scripts/smoke-rm050.mjs');
if (!out1.includes('SMOKE_RM050_OK')) throw new Error('rm050 failed');

const out2 = run('node scripts/smoke-rm051.mjs');
if (!out2.includes('SMOKE_RM051_OK')) throw new Error('rm051 failed');

const out3 = run('node scripts/smoke-rm052.mjs');
if (!out3.includes('SMOKE_RM052_OK')) throw new Error('rm052 failed');

const out4 = run('node scripts/smoke-rm053.mjs');
if (!out4.includes('SMOKE_RM053_OK')) throw new Error('rm053 failed');

const out5 = run('node scripts/smoke-rm054.mjs');
if (!out5.includes('SMOKE_RM054_OK')) throw new Error('rm054 failed');

const out6 = run('node scripts/simulate-e2e.mjs');
if (!out6.includes('issue->plan->execute->review->repair->done')) throw new Error('rm055 flow failed');

const out7 = run('node scripts/smoke-rm057.mjs');
if (!out7.includes('SMOKE_RM057_OK')) throw new Error('rm057 failed');

const out8 = run('node scripts/smoke-rm058.mjs');
if (!out8.includes('SMOKE_RM058_OK')) throw new Error('rm058 failed');

const out9 = run('node scripts/smoke-rm060.mjs');
if (!out9.includes('SMOKE_RM060_OK')) throw new Error('rm060 failed');

const out10 = run('node scripts/smoke-rm061.mjs');
if (!out10.includes('SMOKE_RM061_OK')) throw new Error('rm061 failed');

console.log('SMOKE_DISTRIBUTED_RUNTIME_OK');
