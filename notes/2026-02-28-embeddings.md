# Embeddings Activation Report — 2026-02-28 21:40 CET

Memphis ma już aktywne embeddingi na lokalnej instalacji.

## Co zrobiono
1. **Konfiguracja** — w `~/.memphis/config.yaml` dodano sekcję:
   ```yaml
   embeddings:
     enabled: true
     backend: ollama
     model: nomic-embed-text-v1
     chains:
       - journal
       - ask
       - soul
     storage_path: ~/.memphis/embeddings
   ```
2. **Model w Ollamie** — upewniono się, że istnieje `nomic-embed-text-v1` (`ollama cp nomic-embed-text nomic-embed-text-v1`).
3. **Pierwszy run** — `memphis embed` (po dry runie) wygenerowało 74 wektory: `journal=52`, `ask=21`, `soul=1`.
4. **Status** — `memphis status` pokazuje teraz sekcję Embeddings (`Backend: ollama`, Coverage 3/9 chainów).
5. **Log** — w `journal#71` zapisano wpis o aktywacji embeddingów (plus późniejsze raporty, np. `journal#73`).

## Przepis do powtórzenia
1. Dodaj powyższą sekcję do `~/.memphis/config.yaml` (dopasuj ścieżkę `storage_path`).
2. Jeśli trzeba, skopiuj model w Ollamie: `ollama cp nomic-embed-text nomic-embed-text-v1`.
3. Uruchom `memphis embed --dry-run`, potem właściwy `memphis embed`.
4. Sprawdź `memphis status` — powinna być sekcja Embeddings z coverage.
5. Zapisz krótki wpis w journalu, żeby odnotować konfigurację.

Efekt: `memphis ask` ma teraz semantyczny kontekst z trzech kluczowych chainów i jest gotowy na kolejne fazy (graph-aware ask już korzysta z tych danych).
