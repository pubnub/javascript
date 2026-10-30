---
name: sdk-review
description: Use when reviewing a PubNub JavaScript SDK diff or PR. Covers an SDK-specific compatibility checklist, finding format, and the confirmed-versus-uncertain split.
---

# sdk-review

1. Read the diff and its callers and tests. Review source before generated `lib/` and `dist/`; look at those only to
   confirm build or export consistency.
2. Check the SDK-specific risks. Linting covers style, so don't raise style findings.
   - **Public types:** removed or renamed exports, overload resolution, newly required params, return types,
     `@internal` leaks into `lib/types/index.d.ts`.
   - **Behavior:** validation, defaults, null/undefined handling, error category and message, callback vs Promise
     agreement and timing.
   - **Realtime lifecycle:** ordering/dedup, retry/backoff, reconnect cursors, listener delivery, heartbeat/leave traffic,
     cleanup on unsubscribe/destroy, both event-engine and legacy paths, SharedWorker clients.
   - **Platform and bundle:** Node/browser-only imports in shared core, feature-flag guards, bundle size, new silent
     network traffic.
   - **Contract:** the wire format matches a supplied spec, or the PR states the spec is missing.
   - **Tests:** cover the changed behavior. A test that only mirrors implementation doesn't count.
3. For each finding give the location, trigger, customer consequence and severity. Keep confirmed defects separate
   from uncertainties.
4. End with the four report fields from `AGENTS.md`. "No findings" isn't proof of compatibility.
