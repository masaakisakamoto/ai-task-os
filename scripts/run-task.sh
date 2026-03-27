#!/bin/bash
set -e

TASK_FILE=$1

if [ -z "$TASK_FILE" ]; then
  echo "Usage: ./scripts/run-task.sh <task-file>"
  exit 1
fi

if [ ! -f "$TASK_FILE" ]; then
  echo "Task file not found: $TASK_FILE"
  exit 1
fi

PROMPT_OUT="/tmp/ai-task-os-claude-prompt.txt"

echo "======================================"
echo "AI Task OS :: Run Task"
echo "======================================"
echo "Task file: $TASK_FILE"
echo

echo "1) Generating Claude Code prompt..."
./scripts/claude-task-prompt.sh "$TASK_FILE" > "$PROMPT_OUT"
echo "✅ Prompt generated: $PROMPT_OUT"
echo

echo "2) Task summary"
echo "--------------------------------------"
cat "$TASK_FILE"
echo
echo "--------------------------------------"
echo

echo "3) Next action for Claude Code"
echo "Copy the generated prompt into Claude Code:"
echo
echo "cat $PROMPT_OUT"
echo
echo "Then ask Claude Code:"
echo "  First output only:"
echo "  - Alignment Summary"
echo "  - Drift Check"
echo "  - File Plan"
echo
echo "If the plan looks correct, tell Claude Code to continue with implementation."
echo

echo "4) Local execution check"
TASK_ID=$(node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); console.log(data.id);" "$TASK_FILE")
ARTIFACT_PATH="artifacts/${TASK_ID}-run.json"

echo
echo "Run this command after implementation:"
echo "  node cli/index.js run $TASK_FILE"
echo

if [ -f "$ARTIFACT_PATH" ]; then
  echo "5) Existing artifact summary"
  node -e "
const fs=require('fs');
const path=process.argv[1];
const data=JSON.parse(fs.readFileSync(path,'utf8'));
console.log('status:', data.status);
if (data.verify_summary) {
  console.log('verify_summary:', JSON.stringify(data.verify_summary));
}
" "$ARTIFACT_PATH"
  echo
fi

echo "6) Review commands"
echo "  ./scripts/review-task.sh $TASK_FILE"
echo "  git status --short"
echo

echo "7) Decision guide"
if [ -f "$ARTIFACT_PATH" ]; then
  STATUS=$(node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); console.log(data.status);" "$ARTIFACT_PATH")
  if [ "$STATUS" = "success" ]; then
    echo "✅ Last known artifact status: success"
    echo "Next:"
    echo "  - review diff"
    echo "  - confirm scope"
    echo "  - commit manually if approved"
  else
    echo "❌ Last known artifact status: failed"
    echo "Next:"
    echo "  - inspect artifact verify_results"
    echo "  - fix only the failing scope"
    echo "  - re-run: node cli/index.js run $TASK_FILE"
  fi
else
  echo "No artifact found yet."
  echo "Next:"
  echo "  - implement the task"
  echo "  - run: node cli/index.js run $TASK_FILE"
  echo "  - review result"
fi

echo
echo "Done."
