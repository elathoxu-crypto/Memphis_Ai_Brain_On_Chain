# Roadmap: Terminal Fix + GitHub Update + Nowy Agent

## Cel
1. Naprawić nakładanie się tekstu w terminalu/TUI (problem z locale/curses)
2. Zebrać wszystkie naprawy i wrzucić jako update na GitHub
3. Postawić drugiego agenta OpenClaw z Codex 5.1 mini na drobne zadania

---

## Etap 1: Naprawa terminala/TUI

### Diagnoza
Problem: tekst nakłada się w terminalu (WSL, Windows Terminal), szczególnie w TUI Memphis. Prawdopodobnie locale albo ustawienia curses/blessed.

### Kroki
- [ ] Zbadać `$TERM` i `locale` na obu maszynach (lokalna + druga PC)
- [ ] Dodać `export LANG=en_US.UTF-8` i `LC_ALL=en_US.UTF-8` do `.bashrc`
- [ ] Przetestować `TERM=xterm-256color memphis tui`
- [ ] W Windows Terminal: wyłączyć "Ambiguous Width" albo zmienić czcionkę na Cascadia Mono/Fira Code
- [ ] Jeśli nadal nie działa → zgłębić blessed (TUI lib) i jego ustawienia

### Notatki
- Plik docelowy: `.bashrc` (dodać na obu maszynach)
- Backup: `cp ~/.bashrc ~/.bashrc.bak`

---

## Etap 2: GitHub Update Package

### Co naprawiliśmy (do wrzucenia)
- ✅ README: dodana sekcja troubleshooting z czystą instalacją
- ✅ docs/openclaw-integration.md: opis lokalnego LLM, offline toggle, troubleshooting
- ✅ .memphis.example: poprawny config (providers jako obiekt)
- ✅ Fix: użytkownik musi ręcznie stworzyć config po `init` (dodać do docs)

### Kroki
- [ ] Zrobić commit z fixami: `git add . && git commit -m "fix: terminal locale + clean install docs"`
- [ ] Push: `git push origin master`
- [ ] Opisać release (co naprawiliśmy)

---

## Etap 3: Nowy Agent - Codex Mini

### Cel
Postawić drugiego agenta OpenClaw, który:
- Ma małe zadania (np. proste pytania, drobne coding taski)
- Używa modelu `openai/gpt-5.1-codex-mini` (Codex mini)
- Jest odizolowany od głównego agenta (Style)

### Wymagania
- Nowy katalog agenta: `~/.openclaw/agents/codex-mini`
- Konfiguracja modelu w `openclaw.json` albo w katalogu agenta
- Możliwość komunikacji przez webchat/telegram

### Kroki
- [ ] Utworzyć katalog: `mkdir -p ~/.openclaw/agents/codex-mini`
- [ ] Dodać konfigurację agenta (model, system prompt)
- [ ] Skonfigurować kanał (webchat/telegram)
- [ ] Test: wysłać proste pytanie do nowego agenta

### Przykład konfiguracji (pseudokod)
```yaml
agent: codex-mini
model: openai/gpt-5.1-codex-mini
prompt: "Jesteś asystentem do prostych zadań. Odpowiadaj krótko."
channels: [telegram, webchat]
```

---

## Status
- [ ] Etap 1: Terminal/TUI - W TRAKCIE
- [ ] Etap 2: GitHub Update - DO ZROBIENIA
- [ ] Etap 3: Nowy Agent - DO ZROBIENIA

---
