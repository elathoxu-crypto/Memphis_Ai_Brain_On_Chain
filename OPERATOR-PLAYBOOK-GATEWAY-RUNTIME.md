# Operator Playbook — Gateway Runtime (Memphis)

**Host:** memphis (lokalnie)
**Service:** `gateway-runtime.service` (systemd user)
**Workdir:** `/home/memphis_ai_brain_on_chain/.openclaw/workspace/gateway-runtime`
**Log:** `/home/memphis_ai_brain_on_chain/.memphis/logs/gateway-runtime.log`

---

## 1) Szybki status (health check)
```bash
systemctl --user status gateway-runtime.service --no-pager -l
```

## 2) Start / stop / restart
```bash
systemctl --user start gateway-runtime.service
systemctl --user stop gateway-runtime.service
systemctl --user restart gateway-runtime.service
```

## 3) Włączenie autostartu
```bash
systemctl --user enable gateway-runtime.service
```

## 4) Wyłączenie autostartu
```bash
systemctl --user disable gateway-runtime.service
```

## 5) Podgląd logów (live)
```bash
tail -f /home/memphis_ai_brain_on_chain/.memphis/logs/gateway-runtime.log
```

## 6) Ostatnie logi przez journald
```bash
journalctl --user -u gateway-runtime.service -n 100 --no-pager
```

## 7) Smoke test runtime (pełny)
```bash
cd /home/memphis_ai_brain_on_chain/.openclaw/workspace/gateway-runtime
npm run smoke:distributed-runtime
```
**Expected:** `SMOKE_DISTRIBUTED_RUNTIME_OK`

## 8) Smoke końcówki degraded/recovery
```bash
cd /home/memphis_ai_brain_on_chain/.openclaw/workspace/gateway-runtime
node scripts/smoke-rm060.mjs
node scripts/smoke-rm061.mjs
```
**Expected:**
- `SMOKE_RM060_OK`
- `SMOKE_RM061_OK offline defer -> online resume`

## 9) Manual boot check (bez systemd)
```bash
cd /home/memphis_ai_brain_on_chain/.openclaw/workspace/gateway-runtime
node src/index.mjs
```
**Expected:** `gateway-runtime booted ...`

## 10) Aktualizacja po zmianach kodu
```bash
cd /home/memphis_ai_brain_on_chain/.openclaw/workspace/gateway-runtime
npm install --no-audit --no-fund
npm run smoke:distributed-runtime
systemctl --user restart gateway-runtime.service
systemctl --user status gateway-runtime.service --no-pager -l
```

---

## Incident quick flow (2 min)
1. `systemctl --user status gateway-runtime.service --no-pager -l`
2. `tail -n 120 ~/.memphis/logs/gateway-runtime.log`
3. `cd ~/.openclaw/workspace/gateway-runtime && npm run smoke:distributed-runtime`
4. jeśli smoke PASS, ale service padł → `systemctl --user restart gateway-runtime.service`
5. jeśli smoke FAIL → triage od failing smoke script (`smoke-rm05x.mjs`)

---

## Cross-PC connectivity quick check
```bash
ping -c 2 -W 1 10.0.0.22
memphis share-sync
```
Interpretacja:
- ping OK + share-sync FAIL (publickey) => sieć działa, problem w SSH/sync config.

---

## Artefakty release (ostatnie)
- `/home/memphis_ai_brain_on_chain/.openclaw/workspace/RM061-DELIVERY-PACKAGE-2026-03-07.zip`
- `/home/memphis_ai_brain_on_chain/.openclaw/workspace/ROADMAP-STATUS-2026-03-07.zip`
- `/home/memphis_ai_brain_on_chain/.openclaw/workspace/RELEASE-NOTES-2026-03-07.md`
- `/home/memphis_ai_brain_on_chain/.openclaw/workspace/RELEASE-CHECKSUMS-2026-03-07.sha256`

---

## Owner note
Po każdym major task i milestone: wpis do `memphis journal` (policy aktywna).
