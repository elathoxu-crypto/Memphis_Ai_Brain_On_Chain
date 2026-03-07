# gateway-runtime

Distributed runtime MVP for OpenClaw + Memphis control-plane flow.

## Quickstart

```bash
cd gateway-runtime
node src/index.mjs
```

## Run E2E simulation (RM-055)

```bash
npm run simulate:e2e
```

Expected flow:
`issue -> plan -> execute -> review -> repair -> done`

## Full runtime smoke (RM-056)

```bash
npm run smoke:distributed-runtime
```

Expected output:
`SMOKE_DISTRIBUTED_RUNTIME_OK`

## Included smoke checks
- RM-050 event envelope + router
- RM-051 state lifecycle guards
- RM-052 registry + heartbeat transitions
- RM-053 lease/retry/deadletter
- RM-054 path lock manager
- RM-055 E2E simulation runner
- RM-057 degraded scheduling (offline defer)
- RM-058 local fallback executor lane (small-task policy)
- RM-060 backlog replay on node-b return (deferred -> queued)
- RM-061 offline/online smoke flow (`offline defer -> online resume`)
