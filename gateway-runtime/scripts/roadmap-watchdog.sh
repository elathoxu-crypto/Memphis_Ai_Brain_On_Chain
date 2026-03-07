#!/usr/bin/env bash
set -euo pipefail

ROADMAP="/home/memphis_ai_brain_on_chain/.openclaw/workspace/ROADMAP-MASTER-QUEUE.md"
LOG_DIR="$HOME/.memphis/logs"
STATE_FILE="$HOME/.memphis/state/roadmap-watchdog.state"
mkdir -p "$LOG_DIR" "$HOME/.memphis/state"

TS="$(date -Iseconds)"
NEXT="$(grep -E '^- \[ \] \*\*RM-[0-9]+' "$ROADMAP" | head -n1 | sed -E 's/^- \[ \] \*\*(RM-[0-9]+)\*\*.*/\1/' || true)"
DONE_COUNT="$(grep -E '^- \[x\] \*\*RM-[0-9]+' "$ROADMAP" | wc -l | tr -d ' ')"
OPEN_COUNT="$(grep -E '^- \[ \] \*\*RM-[0-9]+' "$ROADMAP" | wc -l | tr -d ' ')"

PREV_NEXT=""
if [[ -f "$STATE_FILE" ]]; then
  PREV_NEXT="$(cat "$STATE_FILE" 2>/dev/null || true)"
fi

echo "$TS done=$DONE_COUNT open=$OPEN_COUNT next=${NEXT:-NONE}" >> "$LOG_DIR/roadmap-watchdog.log"

if [[ -n "${NEXT:-}" && -n "$PREV_NEXT" && "$NEXT" == "$PREV_NEXT" ]]; then
  echo "$TS warning=stalled_on_$NEXT" >> "$LOG_DIR/roadmap-watchdog.log"
fi

printf '%s' "${NEXT:-NONE}" > "$STATE_FILE"
