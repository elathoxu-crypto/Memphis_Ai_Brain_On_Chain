# Next Session Plan — Share-Sync & Maintenance Parity

_Last updated: 2026-02-27 12:40 CET_

## 🎯 Primary Goal
Zrównać główne środowisko z Watrą w ramach Phase 0 (memphis-heart-plan): domknąć Share-Sync 1.1 + rytuały (brief, maintenance) i przygotować grunt pod Semantic Recall.

---

## 🔥 Priorytety na następną sesję

1. **Share-Sync Automatyzacja (Phase 0 / §3)**
   - [ ] Uzupełnić Pinata credentials w `~/.memphis/config.yaml` lub przez env (`PINATA_JWT` / API_KEY + SECRET).
   - [ ] Test ręczny: `./scripts/memphis-share-sync.sh --all --limit 25 --since 36h` → brak błędów push/pull, log w `logs/share-sync/*.log`.
   - [ ] Dodać crony wg `docs/plans/share-sync-automation.md` (07:15 dry-run, 13:30 main, niedziela cleanup) + wpisy do `logs/share-sync/cron.log`.
   - [ ] Skonfigurować fallback heartbeat (>18h) – update `logs/heartbeat-state.json` i wpis do checklisty heartbeatów.

2. **Maintenance + Brief Rytuały**
   - [ ] Zweryfikować `openclaw` binarkę (`/home/linuxbrew/.linuxbrew/bin/openclaw`), ewentualnie ustawić alias/ENV aby skrypt ją widział.
   - [ ] Odzyskać/utworzyć `scripts/daily-openclaw-maintenance.sh` (PATH fix, restart gateway, backup, log do `logs/daily-maintenance/...`).
   - [ ] Przetestować pełny maintenance run → log + wpis do `logs/heartbeat-state.json.maintenance`.
   - [ ] Upewnić się, że poranny brief pipeline ma checklistę + logi (`logs/briefs/cron.log`, fallback pogody zapisany).

3. **Dokumentacja i pamięć**
   - [ ] Wpisać wyniki do `memory/2026-02-27.md` (lub bieżącej daty) po domknięciu powyższych.
   - [ ] Jeśli czas pozwoli: odświeżyć `memphis-heart-plan.md` (status Share-Sync) + przygotować szkic kroków dla Semantic Recall.

---

## 🛠️ Przygotowanie środowiska
- `cd ~/.openclaw/workspace`
- Sprawdź `git status` (nie commitujemy logów dzięki wpisowi `logs/`).
- Potwierdź dostępność Node/npm (na wypadek reinstalacji openclaw@latest w lokalnym prefixie).

---

## ✅ Lista kroków (kolejność)
1. **Pinata credentials** → test share-sync.
2. **Cron + fallback** → update `logs/share-sync/cron.log`, `heartbeat-state.json`.
3. **Maintenance script** → run + log.
4. **Brief checklist + monitoring**.
5. **Dokumentacja i wpisy w memory**.

---

## 📝 Notatki
- Referencja: `docs/plans/share-sync-automation.md`, `memphis-heart-plan.md`, `memphis-roadmap-2026.md`.
- Wszystkie logi już mają katalogi (`logs/share-sync`, `logs/briefs`).
- `scripts/memphis-share-sync.sh` loguje do dziennych plików i aktualizuje heartbeat – używać go jako jedynego entrypointu.
