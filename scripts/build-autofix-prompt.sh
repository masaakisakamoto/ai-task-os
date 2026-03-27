#!/usr/bin/env bash

set -e

INPUT=${1:-/tmp/autofix-task.json}
OUTPUT=${2:-/tmp/autofix-prompt.txt}

if [ ! -f "$INPUT" ]; then
  echo "Input not found: $INPUT"
  exit 1
fi

echo "Building autofix prompt..."

cat > "$OUTPUT" <<PROMPT
You are working on the AI Task OS repository.

Follow this execution protocol strictly:
- Keep changes minimal
- Do not expand scope
- Preserve existing passing behavior
- No UI
- No memory engine
- No external API
- No unnecessary dependencies

Task:
$(cat "$INPUT")

Respond in this order:
1. Alignment Summary
2. Drift Check
3. File Plan
4. Minimal Implementation
5. Verification
6. Final Report
PROMPT

echo "✅ Prompt generated: $OUTPUT"
