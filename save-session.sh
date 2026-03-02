#!/usr/bin/env bash
# Save session - run before closing/resetting
# Usage: ./save-session.sh [--what "..."] [--learned "..."] [--issues "..."] [--next "..."] [--no-prompt]

set -euo pipefail

DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M)
MEMORY_FILE="$HOME/.openclaw/workspace/memory/$DATE.md"
PROMPT=1
WHAT=""
LEARNED=""
ISSUES=""
NEXT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --what|-w)
      WHAT="$2"
      shift 2
      ;;
    --learned|-l)
      LEARNED="$2"
      shift 2
      ;;
    --issues|-i)
      ISSUES="$2"
      shift 2
      ;;
    --next|-n)
      NEXT="$2"
      shift 2
      ;;
    --no-prompt)
      PROMPT=0
      shift
      ;;
    --help|-h)
      cat <<'EOF'
save-session.sh
-----------------
Append a session summary into memory/YYYY-MM-DD.md and log a Memphis journal entry.

Flags:
  --what/-w "text"     Bullet(s) for "What happened"
  --learned/-l "text"  Bullet(s) for "What I learned"
  --issues/-i "text"   Bullet(s) for "What went wrong"
  --next/-n "text"     Bullet(s) for "Next time"
  --no-prompt          Skip interactive prompts even if stdin is a TTY

If any section text is omitted, interactive prompts are shown (unless --no-prompt).
Multiple bullets can be entered by separating lines with '\n'.
EOF
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

if [[ $PROMPT -eq 1 && -t 0 ]]; then
  [[ -z "$WHAT" ]] && read -erp "What happened? " WHAT || true
  [[ -z "$LEARNED" ]] && read -erp "What did you learn? " LEARNED || true
  [[ -z "$ISSUES" ]] && read -erp "What went wrong? " ISSUES || true
  [[ -z "$NEXT" ]] && read -erp "Next time? " NEXT || true
fi

format_section() {
  local text="$1"
  if [[ -z "$text" ]]; then
    echo "- "
    return
  fi
  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    printf -- "- %s\n" "$line"
  done <<< "$text"
}

WHAT_BLOCK=$(format_section "$WHAT")
LEARNED_BLOCK=$(format_section "$LEARNED")
ISSUES_BLOCK=$(format_section "$ISSUES")
NEXT_BLOCK=$(format_section "$NEXT")

cat <<EOF
=== WATRA SESSION SAVE ===
Date: $DATE
Time: $TIME
EOF

mkdir -p "$(dirname "$MEMORY_FILE")"

cat >> "$MEMORY_FILE" << EOF

## Session: $DATE $TIME

### What happened:
$WHAT_BLOCK

### What I learned:
$LEARNED_BLOCK

### What went wrong:
$ISSUES_BLOCK

### Next time:
$NEXT_BLOCK

EOF

echo "✓ Memory file: $MEMORY_FILE"

echo ""
echo "Saving to Memphis..."
memphis journal "Session save: $DATE $TIME - see memory file" --tags session,save

echo ""
echo "✅ Session saved! Review $MEMORY_FILE to add more detail."
