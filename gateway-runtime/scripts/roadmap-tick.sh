#!/usr/bin/env bash
set -euo pipefail

ROADMAP="/home/memphis_ai_brain_on_chain/.openclaw/workspace/ROADMAP-MASTER-QUEUE.md"
LOG_DIR="$HOME/.memphis/logs"
mkdir -p "$LOG_DIR"

TS="$(date -Iseconds)"
NEXT="$(grep -E '^- \[ \] \*\*RM-[0-9]+' "$ROADMAP" | head -n1 | sed -E 's/^- \[ \] \*\*(RM-[0-9]+)\*\*.*/\1/' || true)"

if [[ -z "${NEXT:-}" ]]; then
  echo "$TS ALL_DONE" >> "$LOG_DIR/roadmap-tick.log"
else
  echo "$TS NEXT=$NEXT" >> "$LOG_DIR/roadmap-tick.log"
fi
