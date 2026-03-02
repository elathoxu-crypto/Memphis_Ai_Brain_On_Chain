#!/bin/bash
# Self-Reflection for Watra
# Usage: ./self-reflection.sh [check|log|read|stats]

CONFIG="$HOME/.openclaw/self-reflection.json"
STATE="$HOME/.openclaw/self-review-state.json"
MEMORY="$HOME/.openclaw/workspace/memory/self-review.md"

# Load config
THRESHOLD=$(jq -r '.threshold_minutes' "$CONFIG" 2>/dev/null || echo "60")
MAX_ENTRIES=$(jq -r '.max_entries_context' "$CONFIG" 2>/dev/null || echo "5")

check() {
    LAST=$(jq -r '.last_reflection' "$STATE" 2>/dev/null)
    if [ "$LAST" = "null" ]; then
        echo "ALERT: First reflection needed"
        return 1
    fi
    
    NOW=$(date -u +%s)
    LAST_TS=$(date -u -d "$LAST" +%s 2>/dev/null || echo "$NOW")
    DIFF=$(( (NOW - LAST_TS) / 60 ))
    
    if [ "$DIFF" -ge "$THRESHOLD" ]; then
        echo "ALERT: Time for reflection (${DIFF}m since last)"
        return 1
    else
        echo "OK: ${DIFF}m since last reflection (threshold: ${THRESHOLD}m)"
        return 0
    fi
}

log_reflection() {
    local tag="$1"
    local miss="$2"
    local fix="$3"
    
    TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M UTC")
    
    mkdir -p "$(dirname "$MEMORY")"
    echo -e "\n## $TIMESTAMP\n\n**Tag:** $tag\n\n**What went wrong:** $miss\n\n**Fix:** $fix\n" >> "$MEMORY"
    
    # Update state
    jq --arg now "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)" '.last_reflection = $now | .total_reflections += 1' "$STATE" > /tmp/state.tmp && mv /tmp/state.tmp "$STATE"
    
    echo "✓ Logged: $tag"
}

read_reflections() {
    if [ -f "$MEMORY" ]; then
        tail -n $((MAX_ENTRIES * 10)) "$MEMORY"
    else
        echo "No reflections yet"
    fi
}

show_stats() {
    TOTAL=$(jq -r '.total_reflections' "$STATE" 2>/dev/null || echo "0")
    LAST=$(jq -r '.last_reflection' "$STATE" 2>/dev/null || echo "never")
    echo "Total reflections: $TOTAL"
    echo "Last reflection: $LAST"
    echo "Threshold: ${THRESHOLD}m"
}

case "$1" in
    check) check ;;
    log) log_reflection "$2" "$3" "$4" ;;
    read) read_reflections ;;
    stats) show_stats ;;
    *) echo "Usage: $0 {check|log|read|stats}" ;;
esac
