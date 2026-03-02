Fajne patche dla Style (po testach 27.02.2026)

1. Chain "soul" + audyt zmian
   - Stwórz branch chaina `soul` (np. `memphis journal --chain soul "update ..."`).
   - Skrypt helper (`scripts/soul-commit.sh`): diff SOUL.md → zapis do chaina + tagi (soul, audit).
   - Cel: każda zmiana SOUL ma własny block, który potem można przywołać w recall.

2. Semantic Recall – Etap 1
   - Zaszablonuj komendę `memphis embed` (CLI skeleton + TODO na backend embeddingów).
   - Przygotuj strukturę chaina na embeddings (np. `semantic` + JSON {text, vector}).
   - Style po powrocie podmieni mock na realne wektory i pipeline.

3. Autonomia / heartbeat
   - Dodać panel „SOUL status” w TUI (np. w `src/tui/state.ts`).
   - W heartbeat (scripts/heartbeat-sync.sh) dopisać check: czy SOUL jest aktualny (porównanie z chainem).
   - Opcjonalnie: powiadomienie, gdy chain `soul` nie był aktualizowany >24h.

4. Share / replicator
   - Jeśli Style potrzebuje SOUL na swojej maszynie, dodać prosty `memphis share add soul` i dokumentację jak syncować.

Wniosek: zaczynamy od chain `soul` + helpera, potem wprowadzamy `memphis embed` (nawet jako stub). Dzięki temu Style dostaje gotowy fundament pod Semantic Recall i wgląd w zmiany SOUL.
