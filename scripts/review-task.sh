#!/bin/bash
set -e

TASK_FILE=$1

if [ -z "$TASK_FILE" ]; then
  echo "Usage: ./scripts/review-task.sh <task-file>"
  exit 1
fi

echo "===== TASK ====="
cat "$TASK_FILE"
echo

echo "===== ACCEPTANCE CHECKLIST ====="
cat reviews/acceptance-checklist.md
echo

echo "===== GIT DIFF ====="
git diff -- . ':(exclude)artifacts'
echo

echo "===== STATUS ====="
git status --short
