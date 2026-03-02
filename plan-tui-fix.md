# Plan: Naprawa TUI + publikacja do GitHub

## Co naprawiliśmy (lista)

### 1. ✅ Terminal text overlapping (locale)
- **Problem**: tekst nachodził na siebie w TUI
- **Rozwiązanie**: Windows Terminal → Ambiguous Width = Wide
- **Plik**: dokumentacja w `docs/openclaw-integration.md`

### 2. ✅ Config init = null providers
- **Problem**: `memphis init` tworzy config z `providers: null`
- **Rozwiązanie**: ręczne tworzenie config.yaml
- **Plik**: `docs/openclaw-integration.md` - dodana sekcja troubleshooting

### 3. ❌ USB detection nie weryfikuje zawartości
- **Problem**: TUI loguje "USB detected" bez sprawdzenia czy są pliki
- **Rozwiązanie**: dodać weryfikację zawartości przed logowaniem
- **Plik**: `src/tui/screens/...` (ekran USB)

---

## Zadania do wykonania

### Etap 1: Dokumentacja (gotowe)
- [x] `docs/openclaw-integration.md` - troubleshooting z config.yaml
- [x] `README.md` - czysty start instrukcje

### Etap 2: Kode TUI (do zrobienia)
- [ ] Naprawić USB detection - dodać sprawdzanie zawartości przed logowaniem
- [ ] Ewentualnie dodać więcej logowania błędów

### Etap 3: Publikacja
- [ ] Commit: `fix: TUI USB verify + docs update`
- [ ] Push do GitHub

---

## Szczegóły naprawy USB

### Problem w kodzie
W TUI (screen USB), po wykryciu mount point, kod po prostu loguje "USB detected" bez sprawdzenia czy są pliki.

### Rozwiązanie
Przed zapisem do loga, sprawdzić:
```bash
ls -la <mount_path>
# sprawdzić czy są oczekiwane pliki (np. *.zip)
```

Jeśli brak plików → zamiast "detected" napisać "empty" albo "no files".

### Lokalizacja
- Plik: `src/tui/screens/` (konkretny screen USB)
- Funkcja: odpowiedzialna za wykrywanie USB

---

## Status
- [ ] Etap 1: Dokumentacja - GOTOWE
- [ ] Etap 2: Kode TUI - DO ZROBIENIA  
- [ ] Etap 3: Publikacja - DO ZROBIENIA
