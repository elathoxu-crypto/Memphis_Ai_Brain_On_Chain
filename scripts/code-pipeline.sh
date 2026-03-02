#!/bin/bash
# Code → Review → Test pipeline

TASK="$1"

echo "🔥 Step 1: Coding (GLM-5)..."
# Ja koduję

echo "🔍 Step 2: Auto-delegating to code-reviewer (GLM-4.7)..."
openclaw agent send code-reviewer "Review this code: $TASK"

echo "🧪 Step 3: Auto-delegating to test-writer (GLM-4.5-air)..."
openclaw agent send test-writer "Write tests for: $TASK"

echo "✅ Pipeline complete!"
