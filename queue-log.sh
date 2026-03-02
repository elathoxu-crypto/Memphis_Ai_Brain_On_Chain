#!/bin/bash
# QUEUE.LOG - Log queue changes to Memphis blockchain
# Usage: ./queue-log.sh "task name" "status change"

THOUGHTS_CHAIN="$HOME/.memphis/chains/thoughts"
QUEUE_FILE="$HOME/.openclaw/workspace/tasks/QUEUE.md"

if [ ! -f "$QUEUE_FILE" ]; then
    echo "Queue file not found: $QUEUE_FILE"
    exit 1
fi

# Get current queue content
QUEUE_CONTENT=$(cat "$QUEUE_FILE")

# Create a new thought block with queue state
node << NODEEOF
import { Store } from "$HOME/memphis/dist/memory/store.js";

const store = new Store("$HOME/.memphis/chains");

const block = await store.appendBlock("thoughts", {
  type: "thought",
  content: \`QUEUE.UPDATE: \$1

Status: \$2

Timestamp: ${new Date().toISOString()}

-- QUEUE SNAPSHOT --
\${\`$QUEUE_CONTENT\`}
\`,
  tags: ["queue", "log", "update", "autonomy"]
});

console.log("✓ Queued to chain:", block.hash.slice(0, 12));
NODEEOF
