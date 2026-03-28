# AI Task OS

AI-native Execution OS for builders.

This project is **not** a task manager.  
It is a deterministic execution loop for turning tasks into **reproducible runs, explicit decisions, and retryable improvements**.

It is built around:

- explicit execution artifacts
- deterministic loop transitions
- path-based artifact lineage
- minimal invariant validation

## Core idea

Task -> Run -> Verify -> Eval -> Decision -> Retry

Each step produces explicit artifacts and deterministic transitions.

This repo is centered on explicit execution artifacts and deterministic loop transitions.

## Current scope (v0.1)

- minimal task contract
- minimal run artifact
- CLI runner
- comparison / decision / retry contracts
- minimal invariant validation for explicit artifact lineage
- example task
- handoff system for long-term AI collaboration

## Non-goals in v0.1

- memory engine
- UI
- external API
- automatic commit / merge
- full automation

## Quickstart

Run an example task:

    npm run run:example

Inspect the resulting execution artifact:

    cat artifacts/run.json

Then validate invariant consistency:

    npm run test:invariants

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

Most tools stop at task management or orchestration.

This project focuses on execution itself:
making it explicit, reproducible, and verifiable through artifacts and deterministic transitions.

## Docs

- docs/constitution.md
- docs/current-state.md
- docs/decision-log.md
- docs/next-chat-prompt.md
- docs/drift-checklist.md

## Invariant validation

This repo includes a minimal invariant checker for explicit artifact lineage across:

- `comparison_report`
- `comparison_decision`
- `retry_input`

These checks are intentionally minimal for v0.1.

### Run the invariant fixture suite

    npm run test:invariants

### Validate a single artifact directly

    npm run check:invariants -- fixtures/invariants/comparison-report/pass/valid.pass.json

The invariant checker enforces minimal cross-file rules such as:

- `before_run_path !== after_run_path`
- `source_run_path` must match the referenced comparison inputs
- `retry_input.source_run_path` must match the referenced decision

This keeps the loop explicit and deterministic without introducing higher-level lineage abstractions yet.
