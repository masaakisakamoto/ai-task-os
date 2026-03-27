#!/bin/bash
set -e

TASK_FILE=$1

if [ -z "$TASK_FILE" ]; then
  echo "Usage: ./scripts/claude-task-prompt.sh <task-file>"
  exit 1
fi

if [ ! -f "$TASK_FILE" ]; then
  echo "Task file not found: $TASK_FILE"
  exit 1
fi

cat <<PROMPT
You are working on the AI Task OS repository.

Follow this execution protocol strictly:
- Read:
  - docs/constitution.md
  - docs/current-state.md
  - docs/decision-log.md
  - docs/drift-checklist.md
  - prompts/implement.md
  - protocols/claude-code-execution.md
  - $TASK_FILE

Then respond in this order:
1. Alignment Summary
2. Drift Check
3. File Plan
4. Minimal Implementation
5. Verification
6. Final Report

Constraints:
- Keep v0.1 minimal
- Do not introduce UI
- Do not introduce memory engine logic
- Do not add unnecessary dependencies
- Avoid speculative refactors
- Preserve architecture
- Prefer deterministic behavior

Task content:
$(cat "$TASK_FILE")
PROMPT
