# Checklist: Vault & Secret Policy

1. [ ] Upewnij się, że policy „TUI-only secrets” jest znajdująca się w `project_task_vault_policy.md` oraz `memory/2026-02-24.md`.
2. [ ] Dodaj `ops` block w pamięci, jeśli ktoś próbuje wprowadzić sekret przez OpenClaw zamiast Memphis TUI.
3. [ ] Sprawdź, że wszystkie nowe klucze API/SSI są zapisane w `vault` chainie i mają tag `vault-rotation`.
4. [ ] Przypomnij o rotacji (cron + `project_task`) w zespole: `ops` log + TUI alert.
5. [ ] Zarchiwizuj dokumentację policy w paczce deployment (README/summary).