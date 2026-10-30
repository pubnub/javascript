---
name: sdk-refactor
description: Use when restructuring PubNub JavaScript SDK code without intending behavior change. Covers the invariant checklist, characterization tests and a deterministic public-type-surface gate.
---

# sdk-refactor

1. **Public type surface must not change.** Run `npm run build:node && git diff --exit-code lib/types/index.d.ts`
   before you finish. A non-empty diff means a public-API change: stop and report it, or revert it.
2. Map callers and the affected modules ([sdk-architecture](../sdk-architecture/SKILL.md)). Keep platform boundaries
   and module guards intact.
3. Write down the invariants that apply:
   - overloads and types
   - defaults, validation, error categories and messages
   - event order and timing
   - retry and cancellation
   - network traffic (heartbeat, leave)
   - cleanup of timers and listeners
4. Rely on existing tests. Add characterization tests only for invariants that nothing currently covers, and run them
   before and after the change.
5. Don't mix behavior fixes into a refactor; list any you find as follow-ups.
6. Report every observable difference, however small. "Refactor" alone isn't a compatibility claim.
