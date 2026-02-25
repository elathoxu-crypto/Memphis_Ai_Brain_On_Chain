# Checklist: TUI Offline Toggle

1. [ ] Zaprojektuj ekran `Offline` w TUI z opcją przełączania między modelem zdalnym (np. openai) a lokalnym (Ollama/`o3:mini`).
2. [ ] Udokumentuj workflow: co jest robione po przełączeniu (log w `journal`, `ops`, `project_task`).
3. [ ] Dodaj tag `offline-toggle` do każdego zapisu toggle i `agent:style` + `role:user` dla decyzji.
4. [ ] Upewnij się, że offline toggle zapisuje status `memphis status` (cron/ops).
5. [ ] Dodaj notatkę w README paczki o tym, jak używać toggle i jakie modele są dostępne.
