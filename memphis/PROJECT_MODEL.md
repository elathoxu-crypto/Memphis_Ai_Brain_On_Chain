# Memphis - Projekt Model

## 📋 Podsumowanie

**Memphis** to lokalny, offline-first AI brain z persistent memory chains.

- **Wersja:** 1.2.0
- **Tech Stack:** TypeScript, Node.js 20+, Vitest
- **License:** MIT
- **GitHub:** https://github.com/elathoxu-crypto/memphis

---

## 🏗️ Architektura

```
┌─────────────────────────────────────────────────────────────┐
│                      MEMPHIS CLI                            │
│                    (Command Line Interface)                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ journal │  │  ask    │  │ recall  │  │ status  │  ...  │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘       │
│       │            │            │            │              │
│       └────────────┴────────────┴────────────┘              │
│                          │                                   │
│                    ┌─────▼─────┐                             │
│                    │  Memory   │                             │
│                    │  Store    │                             │
│                    └─────┬─────┘                             │
│                          │                                   │
│       ┌──────────────────┼──────────────────┐               │
│       │                  │                  │               │
│  ┌────▼────┐       ┌─────▼─────┐      ┌─────▼─────┐         │
│  │ Journal │       │   Vault   │      │  Custom   │         │
│  │ Chain   │       │  (SSI)    │      │  Chains   │         │
│  └─────────┘       └───────────┘      └───────────┘         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        TUI Layer                            │
│                  (Terminal User Interface)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    App.ts                           │   │
│  │              (Main TUI Controller)                   │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                     │
│  ┌────────────────────▼───────────────────────────────┐   │
│  │                   State.ts                         │   │
│  │              (App State Manager)                    │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                     │
│  ┌─────────┬─────────┬─┴─────────┬─────────┬─────────┐    │
│  │dashboard│ journal │   vault   │  recall │   ask   │    │
│  │ screen  │ screen  │  screen   │ screen  │ screen  │    │
│  └─────────┴─────────┴───────────┴─────────┴─────────┘    │
│                                                              │
│  ┌─────────┬─────────┬───────────┬─────────┐               │
│  │openclaw│  cline  │  offline  │settings │               │
│  │ screen  │ screen  │  screen   │ screen  │               │
│  └─────────┴─────────┴───────────┴─────────┘               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     Providers Layer                          │
│                 (LLM Provider Abstraction)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    ┌──────────┐   ┌──────────┐   ┌──────────┐             │
│    │  Ollama  │   │  OpenAI  │   │ MiniMax  │             │
│    │ (local)  │   │   (API)  │   │   (API)  │             │
│    └────┬─────┘   └────┬─────┘   └────┬─────┘             │
│         │              │              │                      │
│    ┌────▼──────────────▼──────────────▼────┐               │
│    │           Base Provider                │               │
│    │     (interface + fallback logic)        │               │
│    └────────────────┬───────────────────────┘               │
│                     │                                        │
│    ┌────────────────▼───────────────────────┐               │
│    │         Offline Provider               │               │
│    │    (detection + fallback chain)       │               │
│    └───────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      Bridges Layer                          │
│                  (External Integrations)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    ┌──────────────────┐    ┌──────────────────┐            │
│    │   OpenClaw      │    │     Cline        │            │
│    │    Bridge       │    │    Bridge        │            │
│    │  (Automation)  │    │  (VS Code AI)    │            │
│    └──────────────────┘    └──────────────────┘            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Struktura Plików

```
memphis/
├── src/
│   ├── cli/
│   │   ├── index.ts              # Główny CLI entry
│   │   ├── commands/
│   │   │   ├── journal.ts        # Dodaj wpis do journal
│   │   │   ├── ask.ts            # Zapytaj AI
│   │   │   ├── recall.ts         # Wyszukaj w pamięci
│   │   │   ├── status.ts         # Status łańcuchów
│   │   │   ├── vault.ts          # Zarządzanie sekretami
│   │   │   ├── agent.ts          # Zarządzanie agentami
│   │   │   └── init.ts           # Inicjalizacja
│   │   └── utils/
│   │       └── prompt.ts         # Secure input (hasła)
│   │
│   ├── memory/
│   │   ├── chain.ts              # Block + SHA256 hashing
│   │   ├── store.ts              # Chain storage (LevelDB-style)
│   │   ├── query.ts              # Wyszukiwanie
│   │   └── sliding-window.ts      # Optymalizacja pamięci
│   │
│   ├── tui/
│   │   ├── index.ts              # Główny export
│   │   ├── app.ts                # TUI App controller
│   │   ├── state.ts              # State management
│   │   ├── helpers.ts            # Pomocnicze funkcje
│   │   └── screens/
│   │       ├── dashboard.ts      # Ekran główny
│   │       ├── journal.ts        # Ekran journal
│   │       ├── vault.ts          # Ekran vault
│   │       ├── recall.ts         # Ekran wyszukiwania
│   │       ├── ask.ts            # Ekran pytania do AI
│   │       ├── openclaw.ts       # Ekran OpenClaw
│   │       ├── cline.ts         # Ekran Cline
│   │       ├── offline.ts        # Ekran offline
│   │       └── settings.ts       # Ekran ustawień
│   │
│   ├── providers/
│   │   ├── index.ts              # Provider exports
│   │   ├── base.ts               # Base provider interface
│   │   ├── ollama.ts             # Ollama (lokalny)
│   │   ├── openai.ts             # OpenAI API
│   │   ├── minimax.ts            # MiniMax API
│   │   ├── openrouter.ts         # OpenRouter API
│   │   ├── offline.ts            # Offline detection + fallback
│   │   └── fallback.ts           # Provider fallback logic
│   │
│   ├── bridges/
│   │   ├── index.ts              # Bridge exports
│   │   ├── openclaw.ts          # OpenClaw integration
│   │   └── cline.ts             # Cline integration
│   │
│   ├── agents/
│   │   ├── autosave.ts          # Auto-save agent
│   │   └── logger.ts            # Logger agent
│   │
│   ├── config/
│   │   ├── loader.ts            # Config loader (YAML)
│   │   └── defaults.ts          # Domyślne wartości
│   │
│   └── utils/
│       ├── crypto.ts            # AES-256-GCM encryption
│       ├── hash.ts              # SHA256 hashing
│       └── logger.ts            # Logger
│
├── tests/
│   ├── memory/
│   │   └── chain.test.ts        # Testy łańcucha
│   ├── tui/
│   │   ├── helpers.test.ts       # Testy helperów
│   │   └── state.test.ts         # Testy state
│   └── utils/
│       └── crypto.test.ts        # Testy kryptografii
│
├── docs/
│   ├── adr/
│   │   ├── 001-blockchain-memory.md
│   │   ├── 002-vault-encryption.md
│   │   ├── 003-ssi-identity.md
│   │   └── 004-modular-monorepo.md
│   └── VAULT.md
│
├── .github/
│   └── workflows/
│       ├── test.yml             # CI test workflow
│       └── publish.yml           # Publish workflow
│
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── SOUL.md                      # Immutable ledger rules
```

---

## 🔐 SOUL (Immutable Ledger Rules)

### Block Structure

```typescript
interface Block {
  index: number;        // Sequential index (0, 1, 2, ...)
  timestamp: string;     // ISO 8601
  chain: string;        // "journal", "vault", etc.
  data: BlockData;      // Content + metadata
  prev_hash: string;    // SHA256 poprzedniego bloku
  hash: string;         // SHA256 tego bloku
}

interface BlockData {
  type: "journal" | "build" | "adr" | "ops" | "ask" | "system" | "vault" | "credential";
  content: string;
  tags: string[];
  agent?: string;
  provider?: string;
  tokens_used?: number;
  // Vault fields
  encrypted?: string;
  iv?: string;
  key_id?: string;
  // SSI Credential fields
  schema?: string;
  issuer?: string;
  holder?: string;
  proof?: string;
}
```

### Chain Integrity Rules

| Reguła | Opis |
|--------|------|
| Hash Integrity | Każdy block musi mieć valid SHA256 (64 hex) |
| Chain Link | prev_hash = hash poprzedniego bloku |
| Timestamp Order | timestamp >= poprzedniego bloku |
| Index Sequentiality | index = poprzedni + 1 |
| Data Validation | type ∈ allowed list, content ≠ empty |

---

## ⚡ Kluczowe Funkcje

### CLI Commands

| Command | Opis |
|---------|------|
| `memphis init` | Inicjalizuj Memphis w ~/.memphis |
| `memphis journal "text"` | Dodaj wpis do journal |
| `memphis ask "question"` | Zapytaj AI (z pamięci) |
| `memphis recall "keyword"` | Wyszukaj w pamięci |
| `memphis status` | Pokaż status łańcuchów |
| `memphis vault init` | Zainicjuj zaszyfrowany vault |
| `memphis vault add <key> <value>` | Dodaj sekret |
| `memphis vault list` | Lista sekretów |
| `memphis vault get <key>` | Pobierz sekret |
| `memphis export` | Export do JSON |
| `memphis import <file>` | Import z JSON |

### TUI Screens

| Screen | Shortcut | Opis |
|--------|----------|------|
| Dashboard | 1 | Podsumowanie łańcuchów |
| Journal | 2 | Dodaj wpis |
| Vault | 3 | Zarządzanie sekretami |
| Recall | 4 | Wyszukiwanie |
| Ask | 5 | Pytanie do AI |
| OpenClaw | 6 | OpenClaw bridge |
| Cline | 7 | Cline bridge |
| Offline | 8 | Tryb offline |
| Settings | 9 | Ustawienia |

---

## 🔌 Provider Fallback Chain

```
Online?
  ├── OpenAI (API key) → ✅ use
  ├── OpenRouter (API key) → ✅ use
  ├── MiniMax (API key) → ✅ use
  └── ❌ all failed → try Ollama

Offline / No API keys?
  └── Ollama (local) → ✅ use

No Ollama?
  └── ❌ Offline mode only
```

---

## 🧪 Testy

```
Test Files: 4
Tests: 46
Status: ✅ All passing

- tests/memory/chain.test.ts (4 tests)
- tests/tui/helpers.test.ts (26 tests)
- tests/tui/state.test.ts (11 tests)
- tests/utils/crypto.test.ts (5 tests)
```

---

## 📊 Statystyki

| Metric | Value |
|--------|-------|
| Linie kodu (src/) | 3,564 |
| Pliki TypeScript | 40 |
| Moduły | 9 |
| CLI commands | 7 |
| TUI screens | 9 |
| LLM providers | 4 |

---

## 🚀 Roadmap

- [x] Memory chain with SHA256
- [x] CLI (journal, ask, recall, status, init)
- [x] Tests
- [x] Vault (encrypted secrets with AES-256-GCM + SSI)
- [x] LLM provider integration (Minimax, OpenRouter, Ollama)
- [x] Context window (feed relevant memory to LLM)
- [x] Bridge to Cline (VS Code AI)
- [x] Bridge to OpenClaw (automation)
- [ ] Git auto-commit on every block
- [ ] TUI polish
- [ ] Web UI

---

## 🔑 Kluczowe Pojęcia

| Pojęcie | Definicja |
|---------|-----------|
| **Block** | Pojedynczy wpis w łańcuchu (z hashem SHA256) |
| **Chain** | Lista powiązanych bloków (append-only) |
| **Store** | Manager łańcuchów (zapis/odczyt na dysku) |
| **Vault** | Zaszyfrowany schowek na sekrety (AES-256-GCM) |
| **SSI** | Self-Sovereign Identity (Weryfikowalne creds) |
| **Provider** | Abstrakcja dla LLM (Ollama, OpenAI, etc.) |
| **Bridge** | Integracja z zewnętrznymi narzędziami |
| **SOUL** | Immutable ledger rules (reguły integralności) |

---

*Last updated: 2026-02-19*
