#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}" )/.." && pwd)"
LOG_DIR="$ROOT_DIR/logs/soul-status"
mkdir -p "$LOG_DIR"

STAMP="$(date +"%Y-%m-%d")"
LOG_FILE="$LOG_DIR/${STAMP}.log"
TMP_JSON="$(mktemp)"
MEMPHIS_DIR="${MEMPHIS_CLI_DIR:-$ROOT_DIR/memphis-code}"
CLI_CMD="${MEMPHIS_CLI_BIN:-node dist/cli/index.js}"
IFS_OLD=$IFS
IFS=' ' read -r -a CLI_BIN <<<"$CLI_CMD"
IFS=$IFS_OLD

run_cli() {
  ( cd "$MEMPHIS_DIR" && "${CLI_BIN[@]}" soul status --workspace "$ROOT_DIR" )
}

STATUS=0
{
  echo "[$(date -Is)] >>> memphis soul status --workspace $ROOT_DIR"
  if ! run_cli > "$TMP_JSON" 2>>"$LOG_FILE"; then
    STATUS=$?
  fi
  if [[ $STATUS -ne 0 ]]; then
    echo "[$(date -Is)] !!! command failed with exit $STATUS" | tee -a "$LOG_FILE" >&2
    cat "$TMP_JSON" >&2 || true
  else
    cat "$TMP_JSON" >> "$LOG_FILE"
  fi
} >> "$LOG_FILE"

if [[ $STATUS -ne 0 ]]; then
  rm -f "$TMP_JSON"
  exit $STATUS
fi

SOUL_STATUS_WORKSPACE="$ROOT_DIR" python3 - "$TMP_JSON" <<'PY'
import json, sys, os, datetime
report_path = sys.argv[1]
with open(report_path, 'r', encoding='utf-8') as f:
    data = json.load(f)
alerts = data.get('alerts') or []
signals = data.get('signals') or {}
summary = data.get('summary') or 'SOUL status collected'
print(summary)
for alert in alerts[:2]:
    print(f"- ALERT: {alert.get('message')}")
print("Signals:")
for key in ['shareSync','autosummary','semanticRecall','soulStatus']:
    sig = signals.get(key)
    if not sig:
        continue
    status = sig.get('status')
    detail = sig.get('detail') or sig.get('timestamp') or ''
    print(f"  • {sig.get('label','?')}: {status}{' (' + detail + ')' if detail else ''}")

workspace = os.environ.get('SOUL_STATUS_WORKSPACE') or os.path.abspath(os.path.join(report_path, '..', '..'))
if alerts and workspace:
    memory_dir = os.path.join(workspace, 'memory')
    os.makedirs(memory_dir, exist_ok=True)
    today = datetime.date.today().isoformat()
    entry_path = os.path.join(memory_dir, f"{today}.md")
    timestamp = datetime.datetime.now().astimezone().isoformat(timespec='seconds')
    lines = ["", f"## {timestamp} – SOUL status alerts", summary]
    for alert in alerts[:5]:
        lines.append(f"- {alert.get('message')}")
    with open(entry_path, 'a', encoding='utf-8') as f:
        f.write("\n".join(lines) + "\n")
PY

cp "$TMP_JSON" "$LOG_DIR/latest.json"
rm -f "$TMP_JSON"
