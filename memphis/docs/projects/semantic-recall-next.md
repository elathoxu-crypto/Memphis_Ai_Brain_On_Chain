# Semantic Recall – Next Steps

## 1. Helpery embeddings
- [ ] `src/embeddings/query.ts`: cache backend/model per proces, metoda `getQueryVector(text)`.
- [ ] `src/embeddings/index.ts`: loader indexów (`~/.memphis/embeddings/<chain>/index.json`), funkcja `getSemanticHits({ chains, limit, queryVector, minScore })`.
- [ ] Refaktor `core/recall.ts`, by korzystał z powyższych helperów (bez bezpośredniego importu `LocalOllamaBackend`).

## 2. CLI / Typy / Async
- [ ] `cli/index.ts`: dodać typowane opcje dla `--semantic-weight`, `--semantic-only`, `--no-semantic` (żeby `tsc` nie krzyczał).
- [ ] `cli/commands/recall.ts` (i ewentualnie inne call-site’y): `await recall(...)`, obsługa Promise.
- [ ] TUI / inne moduły: upewnić się, że też czekają na async `recall` (jeśli używane).

## 3. Konfiguracja + Dokumentacja
- [ ] Rozszerzyć `config.yaml` + schema (`semantic.enabled`, `chains`, `default_weight`, `max_hits`).
- [ ] README + docs: opis flag CLI, sekcji config oraz raportowania (`memphis embed --report`).

## 4. Testy
- [ ] Unit: helper kosinusowy/normalizacja (np. `math.test.ts`).
- [ ] Integracja: `memphis embed` + `memphis ask --semantic-only` (zapis logów wg `docs/tests/semantic-recall-smoke.md`).

## 5. Heartbeat / Autonomia
- [ ] Po build-fix: odhaczyć „Continue skill research” (przegląd brakujących skills pod Semantic Recall/autosummary).
- [ ] Zaktualizować `memory/YYYY-MM-DD.md` + powiadomić Style’a po każdej większej iteracji.

Po zamknięciu powyższych kroków można przejść do Etapu 2 (Decision Engine) oraz Etapu 3 (Share-sync 1.1 + Security Docs).
