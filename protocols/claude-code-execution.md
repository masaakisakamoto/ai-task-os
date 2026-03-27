# Claude Code Execution Protocol

## Purpose
Run implementation tasks with high consistency, minimal drift, and explicit verification.

## Required Read Order
Before making any change, read in this order:
1. docs/constitution.md
2. docs/current-state.md
3. docs/decision-log.md
4. docs/drift-checklist.md
5. prompts/implement.md
6. the assigned task file

## Required Response Flow

### Step 1: Alignment Summary
Summarize briefly:
- what this project is
- current phase
- what must NOT be built
- what this task is asking for

### Step 2: Drift Check
Explicitly confirm:
- this is still not a task manager
- scope remains developer-first
- no UI is being introduced
- no memory engine is being introduced
- v0.1 remains minimal

If any item fails, stop.

### Step 3: File Plan
State:
- which files you will change
- which files you will not change
- why the selected files are sufficient

### Step 4: Minimal Implementation
Implement the smallest correct change.
Do not expand scope.
Do not refactor unrelated parts.

### Step 5: Verification
Run only the relevant checks.
At minimum, include:
- the command(s) you ran
- the result
- whether the success criteria were met

### Step 6: Final Report
Report using this structure:
- changed files
- unchanged files
- checks run
- result
- risks / follow-ups
