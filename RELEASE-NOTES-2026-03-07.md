# Release Notes — 2026-03-07

## Scope
Roadmap closure for distributed runtime path, including RM-060 and RM-061 finalization.

## Delivered
- RM-060: Backlog replay on node-b return (`deferred -> queued`)
- RM-061: Offline/Online smoke flow (`offline defer -> online resume`)
- Extended full runtime smoke with RM-057/058/060/061

## Key code changes
- `gateway-runtime/src/state/store.mjs`
- `gateway-runtime/src/scheduler/index.mjs`
- `gateway-runtime/scripts/smoke-rm060.mjs`
- `gateway-runtime/scripts/smoke-rm061.mjs`
- `gateway-runtime/scripts/smoke-distributed-runtime.mjs`
- `gateway-runtime/package.json`
- `gateway-runtime/README.md`
- `ROADMAP-MASTER-QUEUE.md` updated (RM-060/061 checked + progress log)

## Validation
- `SMOKE_RM060_OK`
- `SMOKE_RM061_OK offline defer -> online resume`
- `SMOKE_DISTRIBUTED_RUNTIME_OK`

## Release artifacts
- `RM061-DELIVERY-PACKAGE-2026-03-07.zip`
- `ROADMAP-STATUS-2026-03-07.zip`
- `RELEASE-CHECKSUMS-2026-03-07.sha256`
- `NOTES-2026-03-07-PROJEKT-STATUS-I-NEXT.md`
