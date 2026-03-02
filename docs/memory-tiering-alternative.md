# Memory Tiering - Alternatywne Rozwiązanie

**Dla:** Tester (memphis_brain)
**Od:** Watra 🔥
**Date:** 2026-03-01 11:54 CET

---

## 🎯 TL;DR

**Propozycja:** 15 nowych funkcji (distribute, prune --tier, --tier flag, etc.)
**Rzeczywistość:** 0 nowych funkcji potrzebnych
**Rozwiązanie:** Memphis JUŻ MA memory tiering przez chainy + tagi

---

## ✅ Jak Użyć Istniejących Funkcji

### **1. Chainy = Tier (już działa)**

```bash
# HOT tier (częste, codzienne):
~/.memphis/chains/journal/  → sesja, debug
~/.memphis/chains/ask/      → pytania

# WARM tier (trwałe, preferencje):
~/.memphis/chains/decision/ → decyzje
~/.memphis/chains/wisdom/   → mądrość
~/.memphis/chains/goals/    → cele

# COLD tier (archiwum, historia):
~/.memphis/chains/summary/   → podsumowania
~/.memphis/chains/learnings/ → wnioski
~/.memphis/chains/questions/ → pytania
```

**Nie potrzebujesz HOT_MEMORY.md - chainy TO SĄ warstwy!**

---

### **2. Tagi do Kategoryzacji (już działa)**

```bash
# HOT:
memphis journal "text" --tags hot,session,debug

# WARM:
memphis decide "X" "Y" --tags warm,preference
memphis journal "mądrość" --tags warm,wisdom

# COLD:
memphis reflect --daily --save --tags cold,archive
memphis journal "nauka" --tags cold,learning

# Query by tier:
memphis ask "..." --tags hot   # tylko HOT
memphis ask "..." --tags warm  # tylko WARM
memphis ask "..." --tags cold  # tylko COLD
```

**Zero nowego kodu. Działa już teraz.**

---

### **3. Autosummary = Pruning (już działa)**

```bash
# Config:
autosummary:
  enabled: true
  threshold: 50  # auto-prune after 50 blocks

# Manual:
memphis reflect --daily --save   # summarize → COLD
memphis embed --chain journal    # embed for search
```

**Nie potrzebujesz `prune --tier` - autosummary robi to automatycznie!**

---

### **4. Cron Jobs (już wspierane)**

```bash
# Edytuj crontab:
crontab -e

# Dodaj:
0 8 * * * memphis reflect --daily --save    # rano
0 9 * * 0 memphis reflect --weekly --save   # niedziela
0 */4 * * * memphis embed --chain journal   # co 4h
0 20 * * * memphis embed --chain ask        # wieczorem
```

**Memphis wspiera cron od v1.0.0.**

---

### **5. Embeddings (włącz w config)**

```yaml
# ~/.memphis/config.yaml
embeddings:
  enabled: true  # WŁĄCZ TO!
  backend: ollama
  model: nomic-embed-text
```

```bash
# Embed wszystkie chainy:
memphis embed

# Embed konkretne:
memphis embed --chain journal
memphis embed --chain decision
memphis embed --chain summary
```

---

## ❌ Czego NIE Implementujemy

### **1. `--tier` flag** ❌

**Powód:** Chainy = tier. Tagi robią resztę.

```bash
# ZŁE:
memphis journal "text" --tier hot

# DOBRE:
memphis journal "text" --tags hot,session
```

---

### **2. `distribute` command** ❌

**Powód:** Autosummary robi to automatycznie.

```bash
# ZŁE:
memphis distribute --from hot --to warm

# DOBRE:
memphis reflect --daily --save  # auto-summarize do summary chain
```

---

### **3. `prune --tier` command** ❌

**Powód:** Autosummary + config.

```bash
# ZŁE:
memphis prune --tier hot --days 1

# DOBRE:
autosummary:
  enabled: true
  threshold: 50  # auto-prune after 50 blocks
```

---

### **4. HOT_MEMORY.md files** ❌

**Powód:** Duplikacja. Chainy są tierami.

```bash
# ZŁE:
memory/hot/HOT_MEMORY.md

# DOBRE:
~/.memphis/chains/journal/  → HOT tier
```

---

### **5. Custom hooks** ❌

**Powód:** Memphis ma daemon + MCP.

```typescript
// ZŁE:
afterJournal(content, tier) { ... }

// DOBRE:
memphis daemon start  → collectors auto-run
memphis mcp start     → tools available
```

---

## 📋 Mapping: Twoja Propozycja → Memphis Reality

| Twoja Propozycja | Status | Memphis Alternative |
|------------------|--------|---------------------|
| `--tier` flag | ❌ | Use `--tags hot/warm/cold` |
| `distribute` | ❌ | `reflect --daily --save` |
| `prune --tier` | ❌ | Autosummary (config) |
| HOT_MEMORY.md | ❌ | Chains ARE tiers |
| Custom hooks | ❌ | Daemon + MCP tools |
| Cron jobs | ✅ | Already supported |
| Chain mapping | ✅ | Already works |
| Tag tiering | ✅ | Already works |
| Embeddings | ✅ | Enable in config |

---

## 🎯 Workflow (Używając Istniejących Funkcji)

### **Dzienny:**

```bash
# Rano:
memphis reflect --daily --save --tags cold,archive

# Podczas pracy:
memphis journal "text" --tags hot,session
memphis ask "..." --tags hot,query

# Wieczorem:
memphis embed --chain journal
memphis embed --chain ask
```

---

### **Tygodniowy:**

```bash
# Niedziela:
memphis reflect --weekly --save --tags cold,archive
memphis graph build
memphis embed
```

---

### **Miesięczny:**

```bash
# Archive:
memphis reflect --deep --save --tags cold,archive
memphis verify --all
memphis status
```

---

## 💡 Pro Tip: Query by Tier

```bash
# Szukaj tylko w HOT:
memphis ask "co robiłem dzisiaj?" --tags hot

# Szukaj tylko w WARM:
memphis ask "jakie mam preferencje?" --tags warm

# Szukaj tylko w COLD:
memphis ask "czego się nauczyłem?" --tags cold

# Szukaj wszędzie:
memphis ask "..."  # wszystkie chainy
```

---

## 🔥 Włączenie Embeddings (PRIORYTET)

```bash
# 1. Sprawdź status:
memphis status | grep Embeddings

# 2. Włącz w config:
embeddings:
  enabled: true
  model: nomic-embed-text

# 3. Embed wszystkie chainy:
memphis embed

# 4. Sprawdź coverage:
memphis status
```

---

## 📊 Wynik

**Implementacja:** 0 linii kodu
**Konfiguracja:** 3 linie YAML
**Nowe komendy:** 0
**Nowe pliki:** 0

**Efekt:** Memory tiering działa przez chainy + tagi.

---

## 🎉 Podsumowanie

**Twoja propozycja:** 15 nowych funkcji
**Rzeczywistość:** 0 potrzebnych
**Rozwiązanie:** Memphis JUŻ MA wszystko:

- ✅ Chainy = tier
- ✅ Tagi = kategoryzacja
- ✅ Autosummary = pruning
- ✅ Reflect = archiwizacja
- ✅ Embeddings = search
- ✅ Cron = automation

**Włącz embeddings w config i używaj tagów.** 🔥

---

**Questions?** Ask Watra or check `docs/memory-tiering-feedback-analysis.md`
