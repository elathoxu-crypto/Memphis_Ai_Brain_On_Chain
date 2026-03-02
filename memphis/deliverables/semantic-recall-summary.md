# Semantic Recall Integration – Summary (2026-02-28)

## Zakres prac wykonanych
- `core/recall.ts` przerobione na async: pobiera wektor zapytań przez `LocalOllamaBackend`, oblicza cosine similarity i scala wyniki keyword+semantic z wagami.
- Dodane flagi CLI `--semantic-weight`, `--semantic-only`, `--no-semantic`; `AskOptions`/`core/ask.ts` przekazują nowe opcje do `recall`.
- Zdefiniowano helper matematyczny (`src/utils/math.ts`) i start refaktoru semantic loadera (tymczasowo nadal w `loader.ts`).
- Przygotowano pipeline embedowania (`~/.memphis/config.yaml` z sekcją `semantic`, `memphis embed` przetestowany lokalnie; wpis w `logs/heartbeat-state.json.semanticRecall` = 2026-02-28 09:30 CET).
- Weather check i heartbeat logi uaktualnione (ostatni odczyt 12:58 CET, log w `logs/weather/2026-02-28.log`).

## Stan bieżący (npm run build = FAIL)
1. **Helpery embeddings** – wciąż brakuje `src/embeddings/query.ts` i `index.ts`; kosinus + loader siedzą w `core/recall.ts`/`loader.ts` tymczasowo.
2. **Async call-site’y** – `cli/commands/recall.ts`, definicja `ask` w CLI, ewentualne TUI muszą `await recall(...)`.
3. **CLI options typing** – trzeba rozszerzyć typ opcji w `cli/index.ts` o nowe pola (teraz TS krzyczy, że `semanticWeight` nie istnieje).
4. **Testy/doksy** – brak dedykowanych testów (cosine helper, `memphis ask --semantic-only` smoke) i dokumentacji flag/configu.
5. **Skill research** – z listy HEARTBEAT nadal do wykonania po build fix.

## Zalecenia na start dla Style’a
1. Dokończyć helpery (`query.ts`, `index.ts`) i przepiąć `core/recall.ts` na ich API.
2. Poprawić CLI (`cli/index.ts`, `cli/commands/recall.ts`, ewentualnie TUI) tak, by wszędzie czekały na async `recall` i miały typowane flagi.
3. Ustawić config schema (`semantic.enabled`, `chains`, `default_weight`, `max_hits`), dopisać testy + README/test plan.
4. Po zielonym buildzie: odpalić embed→ask scenariusz (patrz `docs/tests/semantic-recall-smoke.md`) i wrócić do skill research.
