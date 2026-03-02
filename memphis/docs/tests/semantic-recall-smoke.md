# Semantic Recall – Smoke Test

## Prerekwizyty
- Lokalna konfiguracja `~/.memphis/config.yaml` zawiera sekcję:
  ```yaml
  semantic:
    enabled: true
    chains: [journal]
    default_weight: 0.5
    max_hits: 40
  ```
- Model `nomic-embed-text` pobrany w Ollamie (`ollama pull nomic-embed-text`).
- Repo w stanie z paczki `memphis_semantic_recall_20260228.zip`.

## Kroki
1. **Dodaj wpisy do journalu**
   ```bash
   memphis journal "Semantic test entry #1" --tags semantic
   memphis journal "Semantic test entry #2" --tags semantic
   ```
2. **Embed**
   ```bash
   memphis embed --chain journal --limit 10
   ```
   - Oczekiwany rezultat: artefakty w `~/.memphis/embeddings/journal/`, raport `memphis embed --report` pokazuje nowe wektory.
3. **Zapytanie semantic-only**
   ```bash
   memphis ask "Semantic test entry" --semantic-only --semantic-weight 1 --no-save --json
   ```
   - Oczekiwany rezultat: w `context.hits` pojawiają się wpisy journalu nawet bez textual exact-match.
4. **Mix keyword + semantic**
   ```bash
   memphis ask "Semantic" --semantic-weight 0.6 --no-save --json
   ```
   - Sprawdź, że `score` w kontekście odzwierciedla wagę (keywordy distilowane do ~0-1, semantyka * 0.6).

## Checklist po teście
- `logs/heartbeat-state.json.semanticRecall` zaktualizowany na czas ostatniego `memphis embed`.
- Brak błędów w `npm run build` (po naprawie async call-site’ów).
- Zapisz wyniki w `memory/YYYY-MM-DD.md` + poinformuj Style’a.
