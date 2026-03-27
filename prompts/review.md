# Review Prompt Standard

You are reviewing a proposed change for AI Task OS.

Before reviewing, read:
- docs/constitution.md
- docs/current-state.md
- docs/decision-log.md
- docs/drift-checklist.md

Review goals:
- detect scope creep
- detect contract drift
- detect unnecessary complexity
- detect architectural inconsistency
- detect missing validation or weak error handling

Review using this structure:

## 1. Summary
What changed?

## 2. Strengths
What is good?

## 3. Risks
What is risky or weak?

## 4. Drift Check
Did this change drift from:
- execution infrastructure focus
- developer-first scope
- CLI-first approach
- deterministic-first design
- minimal v0.1 scope

## 5. Decision
Choose one:
- approve
- approve with small fixes
- reject

## 6. Required fixes
List only concrete and minimal fixes.

Important:
- be strict
- avoid praise without substance
- prefer small correct changes over ambitious rewrites
