# Infrastruktura Projektu (widok z 25.02.2026)

## 🏠 Lokalna Maszyna (memphis)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MEMPHIS (lokalny PC)                           │
│                                                                          │
│  ┌──────────────────────┐      ┌──────────────────────────────────┐   │
│  │   OpenClaw Framework  │      │        Memphis AI Brain          │   │
│  │                      │      │                                   │   │
│  │  ┌───────────────┐   │      │  ~/.memphis/                     │   │
│  │  │   Style       │   │ ←──→ │  - config.yaml (Ollama)          │   │
│  │  │ (Main Agent)  │   │      │  - chains/ (journal, decision)   │   │
│  │  │ MiniMax-M2.5  │   │      │  - vault (szyfrowany)           │   │
│  │  └───────────────┘   │      │                                   │   │
│  │         ↓            │      │  CLI: node dist/cli/index.js      │   │
│  │  ┌───────────────┐   │      │  TUI: memphis tui                │   │
│  │  │  Sub-agents   │   │      │                                   │   │
│  │  │ (spawned)     │   │      │  Providers:                       │   │
│  │  └───────────────┘   │      │  - Ollama (lokalny)               │   │
│  └──────────────────────┘      │  - MiniMax (chmura)               │   │
│                                │  - OpenRouter (opcjonalnie)        │   │
│  ┌──────────────────────┐      └──────────────────────────────────┘   │
│  │   Kanały             │                                               │
│  │  - webchat           │      ┌──────────────────────────────────┐   │
│  │  - telegram          │      │        Cline (Coding Agent)       │   │
│  │  - discord           │      │  ~/memphis/ - kod Memphis         │   │
│  └──────────────────────┘      │  cline -c ~/memphis "task"         │   │
│                                └──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🌐 Druga Maszyna (memphis_ai_brain_on_chain)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    MEMPHIS_AI_BRAIN_ON_CHAIN                            │
│                                                                          │
│  ┌──────────────────────┐      ┌──────────────────────────────────┐   │
│  │   OpenClaw Framework  │      │        Memphis AI Brain          │   │
│  │                      │      │                                   │   │
│  │  ┌───────────────┐   │      │  ~/.memphis/                     │   │
│  │  │   (brak agenta)│   │      │  - config.yaml (Ollama)        │   │
│  │  │   - just Memphis│   │      │  - chains/ (journal, vault)    │   │
│  │  │   - CLI only   │   │      │                                   │   │
│  │  └───────────────┘   │      │  Status:                         │   │
│  └──────────────────────┘      │  ✅ Ollama ready                  │   │
│                                │  ✅ Journal: 14 blocks             │   │
│  CLI: node ~/memphis/dist/cli/index.js                                │
│  Alias: alias memphis="node ~/memphis/dist/cli/index.js"              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔥 OBECNA INFRASTRUKTURA (sumarycznie)

```
                    ┌─────────────────┐
                    │   TY (Użytkownik) │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Webchat/Telegram│
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   STYLE         │ │   CLINE         │ │   MEMPHIS      │
│ (Main Agent)    │ │ (Coding Agent)  │ │ (AI Brain)     │
│                 │ │                 │ │                 │
│ Model:          │ │ ~/memphis/     │ │ ~/.memphis/     │
│ MiniMax-M2.5    │ │ cline -c ...   │ │ journal, ask,  │
│                 │ │                 │ │ recall, vault   │
└─────────────────┘ └─────────────────┘ └─────────────────┘
         │                                   │
         │              ┌────────────────────┘
         │              │
         ▼              ▼
┌─────────────────────────────────────────┐
│        Memphis na 2. PC                │
│  (sam CLI, bez agenta OpenClaw)       │
│  Ollama: bielik-1.5b / qwen2.5       │
└─────────────────────────────────────────┘
```

---

## 🚀 PROPONOWANA INFRASTRUKTURA (z nowym agentem)

```
                    ┌─────────────────┐
                    │   TY (Użytkownik) │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Webchat/Telegram│
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   STYLE         │ │   CODEX MINI    │ │   MEMPHIS      │
│ (Main Agent)    │ │ (Nowy Agent)    │ │ (AI Brain)     │
│                 │ │                 │ │                 │
│ Model:          │ │ Model:          │ │ ~/.memphis/    │
│ MiniMax-M2.5    │ │ gpt-5.1-codex- │ │ (lokalny)      │
│                 │ │ mini            │ │                 │
│ Zadania:        │ │                 │ │ Zadania:       │
│ - rozmowy       │ │ Zadania:        │ │ - pamięć       │
│ - planowanie     │ │ - proste pytania│ │ - kontekst     │
│ - kreatywne     │ │ - code review  │ │ - recall       │
└─────────────────┘ │ - snippety     │ └─────────────────┘
         │         └─────────────────┘         │
         │                                   │
         │              ┌────────────────────┘
         │              │
         ▼              ▼
┌─────────────────────────────────────────┐
│        Memphis na 2. PC                │
│  Ollama: bielik-1.5b / qwen2.5        │
└─────────────────────────────────────────┘
```

---

## 📦 Nowy Agent: CodexMini

### Lokalizacja
```
~/.openclaw/agents/codex-mini/
```

### Konfiguracja
```yaml
name: CodexMini
model: openai/gpt-5.1-codex-mini
description: "Agent do prostych zadań - pytania, code review, snippet'y"
prompt: "Odpowiadaj krótko i konkretnie. Używaj Codex Mini."
channels: [telegram, webchat]  # te same co Style albo osobne
```

### Różnica między agentami

| Cecha | Style | CodexMini |
|-------|-------|-----------|
| Model | MiniMax-M2.5 | Codex Mini |
| Zadania | Rozmowy, planowanie, kreatywne | Proste pytania, code review |
| Kontekst | Pełny (pamięć Memphis) | Może mieć własny |
| Szybkość | normalny | szybszy, tańszy |

---

## 🔧 Jak to wdrożyć?

1. Utworzyć katalog agenta: `~/.openclaw/agents/codex-mini`
2. Dodać konfigurację do OpenClaw
3. Skonfigurować model (Codex Mini)
4. Uruchomić agenta

OpenClaw automatycznie obsługuje wielu agentów – każdy z własną sesją.

---

**Pytanie do Ciebie:**
1. Czy ta wizja jest OK?
2. Gdzie ma być ten agent – na tej maszynie (memphis) czy na drugiej (memphis_ai_brain_on_chain)?
3. Jakie zadania dokładnie ma dostawać?
