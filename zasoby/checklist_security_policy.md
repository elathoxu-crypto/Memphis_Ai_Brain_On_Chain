# Checklist: Vault & Secret Policy (v2)

> Run `scripts/security_auto_doc.sh` during every audit. It will store a Markdown report in `reports/security/` and append a Memphis journal note tagged `security,autodoc`.

1. **Policy visibility**
   - [ ] Potwierdź, że `project_task_vault_policy.md` opisuje zasadę „TUI-only secrets” i linkuje do tego checklistu.
   - [ ] Ostatnie wpisy `memory/YYYY-MM-DD.md` przypominają o polityce (np. `memory/2026-02-24.md`).
2. **Secret ingress guardrails**
   - [ ] Jeśli ktoś próbuje podać sekret w OpenClaw, natychmiast dodaj `ops` block: `memphis journal --tags ops,security "[Guard] secret rejected – TUI only"`.
   - [ ] `.gitignore` w repo zawiera `memphis/.memphis/` i `memory/` (script raportuje status).
3. **Vault hygiene**
   - [ ] Nowe klucze wprowadzane **wyłącznie** przez `memphis vault add`, z tagiem `vault-rotation`.
   - [ ] Przed rotacją uzbrój Guarded Terminal w TUI (`g` hotkey) i zaloguj zmianę.
4. **Rotation reminders**
   - [ ] Cron/e-mail przypominający istnieje (patrz `session-report.md` lub `project_task_*`).
   - [ ] Każda rotacja = wpis w `ops` + notatka w `journal` (tags `security,rotation`).
5. **Documentation bundling**
   - [ ] `veiled_nexus_operational_guide.md` i `deployment_package_README.md` są w paczce ZIP/USB.
   - [ ] Najnowszy raport z `reports/security/` jest dołączony lub wspomniany w README.
6. **Auto-doc workflow**
   - [ ] Uruchom `./scripts/security_auto_doc.sh` (generuje sekcje: Memphis status, vault, gitignore, token, ops log, next steps).
   - [ ] Otwórz plik i potwierdź, że ostrzeżenia zostały rozwiązane; dodaj link/ścieżkę do Memphis journal.
