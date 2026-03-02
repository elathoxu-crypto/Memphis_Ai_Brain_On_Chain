# Memphis Repo Cleanup Roadmap (2026-02-25)

## Cel
Przygotować czystą, publiczną wersję repozytorium Memphis, gotową do `git clone` i dalszej integracji z OpenClaw (Style) bez zalegających pakietów, zipów i notatek operacyjnych. Repo ma zawierać wyłącznie kod, dokumentację i checklisty potrzebne do uruchomienia Memphis + instrukcję integracji z OpenClaw.

## Stan początkowy (diagnoza)
- Dwa równoległe katalogi z kodem: `~/memphis` oraz `~/.openclaw/workspace/memphis-code` (identyczne struktury, ale tylko `~/memphis` jest spięty z origin/master).
- Workspace zawiera dziesiątki dodatkowych plików (raporty, paczki, backupy, zipy, pliki .pem, pakiety Veiled Nexus) niepotrzebne w docelowym repo.
- Repo `~/memphis` ma śmieci w tree (`dist`, `node_modules`, binaria, lokalne konfiguracje `.openclaw/`). .gitignore nie obejmuje wszystkiego.

## Deliverables
1. **Canonical repo**: tylko jeden katalog (`~/memphis`) jako źródło prawdy, zsynchronizowany z git.
2. **Czyste drzewo**: brak `node_modules`, buildów `dist/`, lokalnych `.openclaw/`, logów i kluczy. Tylko TS/JS src, `dist` (jeśli release-ready) generowane w CI, dokumentacja i szablony.
3. **Instrukcja integracji z OpenClaw**: w README lub osobnym `docs/openclaw.md` opis instalacji, konfiguracji Style, oraz offline toggle.
4. **Checklisty**: tylko te, które są uniwersalne (np. offline toggle, vault policy) – bez danych prywatnych.
5. **Archiwum**: wszystkie obecne raporty/paczki/backupy przeniesione do `workspace/archive/2026-02-25/` albo usunięte po potwierdzeniu.
6. **Nowy release branch/tag**: przygotowany commit, który można spushować.

## Kroki
1. **Inwentaryzacja**
   - [ ] Porównać `~/memphis` vs `workspace/memphis-code`; potwierdzić, że drugi można usunąć (backup do archiwum jeśli potrzebny).
   - [ ] Spisać wymagane pliki/directory w repo (src, docs, templates, tests, config). Resztę oznaczyć do usunięcia/ignorowania.
2. **Porządki w repo**
   - [ ] Wyczyścić `dist/` i `node_modules/` (dodać/zweryfikować `.gitignore`).
   - [ ] Usunąć `.openclaw/` i inne lokalne katalogi developerskie.
   - [ ] Przejrzeć `docs/` i zostawić tylko materiały relewantne; przenieść prywatne raporty do archiwum.
   - [ ] Upewnić się, że `templates/`, `tests/`, `src/` są kompletne.
3. **Dokumentacja**
   - [ ] Zaktualizować `README.md` (sekcje: szybki start, zależności, `npm install && npm run build`, integracja z OpenClaw + Style, offline toggle, vault policy).
   - [ ] Dodać `docs/openclaw-integration.md` (lub dopisać do README) na bazie istniejących checklist (`checklist_offline_toggle.md`, `project_task_vault_policy.md`).
   - [ ] Dodać `docs/deployment/second-pc.md` jeśli potrzebne.
4. **Workspace hygiene**
   - [ ] Utworzyć `workspace/archive/` i przenieść tam: `veiled-nexus-pack*`, `session-report.md`, stare raporty, zipy backupowe.
   - [ ] Zweryfikować, które checklisty zostają (np. `project_task_install_second_pc.md` → w docs, reszta do archiwum).
   - [ ] Usunąć klucze `.pem` z workspace (lub przenieść do bezpiecznego storage). Nie trzymać ich w repo.
5. **Test & release**
   - [ ] `npm ci && npm run build && npm test` na czystej kopii.
   - [ ] `git status` powinien pokazywać tylko zamierzone zmiany.
   - [ ] Commit „feat: clean repo for OpenClaw integration” i przygotować push.

## Notatki operacyjne
- Backup obecnego stanu zanim zaczniemy (`tar czf memphis-pre-clean-20260225.tgz ~/memphis`).
- Utrzymać `project_task_install_second_pc.md` i `checklist_offline_toggle.md` jako źródło treści dla README, ale finalnie przenieść do `docs/`.
- Jeśli potrzebny jest `deploy_second_pc.sh`, wrzucić go do `scripts/` w repo i opisać.

---
Aktualizacja postępu: wypełniać checkboxy przy kolejnych krokach i notować zmiany w `memory/2026-02-25.md`.
