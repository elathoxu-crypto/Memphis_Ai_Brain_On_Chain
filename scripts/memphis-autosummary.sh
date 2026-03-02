#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/logs/autosummary"
mkdir -p "$LOG_DIR"

STAMP="$(date +"%Y-%m-%d")"
LOG_SUFFIX="${AUTOSUMMARY_LOG_SUFFIX:-}"
if [[ -n "$LOG_SUFFIX" ]]; then
  LOG_FILE="$LOG_DIR/${STAMP}-${LOG_SUFFIX}.log"
else
  LOG_FILE="$LOG_DIR/${STAMP}.log"
fi

COMMAND_DISPLAY="memphis summarize $*"
echo "[$(date -Is)] >>> $COMMAND_DISPLAY" >> "$LOG_FILE"

set +e
(
  cd "$HOME/memphis"
  node dist/cli/index.js summarize "$@"
) >> "$LOG_FILE" 2>&1
STATUS=$?
set -e

echo "[$(date -Is)] <<< exit $STATUS" >> "$LOG_FILE"

if [[ $STATUS -ne 0 ]]; then
  echo "Autosummary run failed (exit $STATUS); see $LOG_FILE" >&2
  exit $STATUS
fi

STATE_FILE="$ROOT_DIR/logs/heartbeat-state.json"
python3 - "$STATE_FILE" <<'PY'
import json, os, sys, datetime
path = sys.argv[1]
now = datetime.datetime.now(datetime.timezone.utc).astimezone().isoformat()
data = {}
if os.path.exists(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError:
        pass
if not isinstance(data, dict):
    data = {}
data['memphisAutosummary'] = now
os.makedirs(os.path.dirname(path), exist_ok=True)
with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)
    f.write('\n')
PY

echo "Updated logs/heartbeat-state.json with memphisAutosummary=$STAMP" >> "$LOG_FILE"
