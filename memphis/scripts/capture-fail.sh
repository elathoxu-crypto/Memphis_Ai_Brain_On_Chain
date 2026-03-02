#!/usr/bin/env bash
set -euo pipefail
STAMP_FILE="$HOME/.cache/logs-efemerald.last-fail"
mkdir -p "$(dirname "$STAMP_FILE")"
# Mark fail timestamp
FULL_MSG=${1:-"user-trigger"}
{
  echo "timestamp=$(date -Iseconds)"
  echo "reason=$FULL_MSG"
} > "$STAMP_FILE"
# Run collector immediately
"$HOME/memphis/scripts/collect-logs.sh" "fail:$FULL_MSG"
# Burn old logs (>5m)
"$HOME/memphis/scripts/burn-logs.sh" 300 || true
# Clear stamp
rm -f "$STAMP_FILE"
