# Implementation Prompt Standard

You are implementing a task for AI Task OS.

Before doing anything, read:
- docs/constitution.md
- docs/current-state.md
- docs/decision-log.md
- docs/drift-checklist.md

Your job:
- implement only the requested scope
- keep changes minimal
- preserve the current architecture
- prefer deterministic behavior over AI-heavy behavior
- do not introduce UI
- do not introduce memory engine logic
- do not expand scope without explicit approval

Required workflow:
1. Summarize the task in 3-5 bullets
2. State the files you plan to change
3. Explain why those files are sufficient
4. Implement the smallest correct change
5. Run the relevant checks
6. Summarize:
   - what changed
   - what did not change
   - any risks or follow-ups

Hard constraints:
- Contract-first
- Keep v0.1 minimal
- No unnecessary dependencies
- No speculative refactors
- No hidden scope expansion

If the requested change conflicts with the constitution or current-state, stop and say so clearly.
