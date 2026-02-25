# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## Memphis

- **Repo:** ~/memphis
- **Model:** ~/.openclaw/workspace/memphis/PROJECT_MODEL.md

## Memphis + Cline - Współpraca

### Architektura:

```
┌─────────────────────────────────────────────────┐
│                   TY (Memphis)                  │
│              ↕ (komunikuje się)                 │
├─────────────────────┬───────────────────────────┤
│    MEMPHIS          │        CLINE              │
│    (AI Brain)       │    (Coding Agent)         │
│    - pamięć        │    - wykonuje             │
│    - kontekst       │    - koduje               │
│    - wizja         │    - buduje               │
│    = SKRZYDŁA      │    = RĘCE                 │
└─────────────────────┴───────────────────────────┘
```

### Użycie:

```bash
# Cline - zawsze z katalogiem ~/memphis
cd ~/memphis && cline -t 60 "task"

# Memphis CLI
cd ~/memphis && npx tsx src/cli/index.ts ask "pytanie"
```

### Memphis Bridge (dla Cline):

```bash
# Dodaj wpis do pamięci
npx tsx src/bridges/cline.ts journal "Cline: zrobiłem refaktoryzację..."

# Szukaj w pamięci  
npx tsx src/bridges/cline.ts recall "refaktoryzacja"

# Status chain
npx tsx src/bridges/cline.ts status
```

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
