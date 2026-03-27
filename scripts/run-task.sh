#!/bin/bash
set -e

TASK_FILE=$1

if [ -z "$TASK_FILE" ]; then
  echo "Usage: ./scripts/run-task.sh <task-file>"
  exit 1
fi

echo "🚀 Running task: $TASK_FILE"
echo "----- TASK CONTENT -----"
cat "$TASK_FILE"
echo
echo "🧪 Running minimal CLI example..."
node cli/index.js run examples/pr-review.json
echo "✅ Done"
