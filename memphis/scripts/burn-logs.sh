#!/usr/bin/env bash
set -euo pipefail
CHAIN_DIR="$HOME/.memphis/chains/logs-efemerald"
TTL_SECONDS=${1:-300}
now=$(date +%s)
for file in $(ls "$CHAIN_DIR"/*.json 2>/dev/null); do
  ts=$(python3 -c 'import json,sys; print(json.load(sys.stdin)["timestamp"])' < "$file" 2>/dev/null || echo 0)
  [ "$ts" = 0 ] && continue
  age=$((now - $(date --date="$ts" +%s)))
  if [ $age -gt $TTL_SECONDS ]; then
    rm -f "$file"
  fi
done
