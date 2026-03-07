#!/usr/bin/env bash
set -euo pipefail

NODE_ID="${1:-node-b}"
ROLES="${ROLES:-executor,repair,test}"
PROVIDERS="${PROVIDERS:-codex,minimax}"

LOG_DIR="$HOME/.memphis/logs"
mkdir -p "$LOG_DIR"
TS="$(date -Iseconds)"

echo "$TS node-rejoin start node=$NODE_ID roles=$ROLES providers=$PROVIDERS" >> "$LOG_DIR/node-rejoin.log"
# Placeholder for real register+heartbeat wiring
cat <<EOF
{
  "node_id": "$NODE_ID",
  "roles": ["executor","repair","test"],
  "providers": ["codex","minimax"],
  "provider_health": {"codex":"ok","minimax":"ok"},
  "ts": "$TS"
}
EOF

echo "$TS node-rejoin sanity=ok" >> "$LOG_DIR/node-rejoin.log"
