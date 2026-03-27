#!/usr/bin/env bash
set -e

PROMPT_FILE="/tmp/autofix-prompt.txt"

if [ ! -f "$PROMPT_FILE" ]; then
  echo "Autofix prompt not found: $PROMPT_FILE"
  exit 1
fi

echo "======================================"
echo "AI Task OS :: Autofix Execution Loop"
echo "======================================"
echo
echo "1) Autofix prompt is ready:"
echo "   $PROMPT_FILE"
echo
echo "2) Next action:"
echo "   Open the prompt with:"
echo "   cat $PROMPT_FILE"
echo
echo "3) Paste the prompt into Claude Code."
echo
echo "4) After Claude edits files, run:"
echo "   git status --short"
echo "   ./scripts/review-task.sh tasks/014-autofix-execution-loop.json || true"
echo
echo "5) Then run the relevant verification task again."
echo "   Example:"
echo "   node cli/index.js run tasks/007-run-artifact-json-checks.json"
echo
echo "6) If verification passes, review the diff and commit manually."
echo
echo "✅ Autofix execution loop prepared"
