# AI Task OS

AI-native Execution OS for builders.

This project is **not** a task manager.  
It turns tasks into **reproducible runs**.

## Core idea

Task -> Run -> Eval -> Memory

## Current scope (v0.1)

- minimal task contract
- minimal run artifact
- CLI runner
- example task
- handoff system for long-term AI collaboration

## Quickstart

node cli/index.js run examples/pr-review.json
cat artifacts/run.json

Or:

npm run run:example

## Example task shape

{
  "id": "example-pr-review",
  "type": "code_review",
  "objective": "detect critical issues",
  "input": {
    "diff": "if (user.name) { console.log(user.profile.bio) }"
  }
}

## Output

The CLI generates:

- artifacts/run.json

## Why this exists

Most tools stop at task management.  
This project focuses on execution infrastructure.

## Non-goals

- generic productivity app
- UI-first product
- memory engine in v0.1

## Docs

- docs/constitution.md
- docs/current-state.md
- docs/decision-log.md
- docs/next-chat-prompt.md
- docs/drift-checklist.md
