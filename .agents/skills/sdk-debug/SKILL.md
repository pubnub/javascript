---
name: sdk-debug
description: Use when investigating a PubNub JavaScript SDK bug, regression, flaky behavior or customer-reported issue. Covers reproduction, root-cause classification, regression test first, then the narrow fix.
---

# sdk-debug

1. **Evidence first.** Gather the SDK version, platform/runtime, configuration (with secrets removed), and expected vs
   actual behavior. Work from the evidence provided; ask only for inputs that block diagnosis.
2. **Classify the root cause** as one of: service or configuration, contract mismatch, timing/resource leak, or SDK
   defect. Don't present an unexecuted reproduction as confirmed.
3. **Trace** with the module guide from [sdk-architecture](../sdk-architecture/SKILL.md):
   public API → endpoint or subscribe/presence path → middleware → transport. For the event engine, record
   `state + context → event → transition → effects → emitted status` and compare the expected trace with the actual one.
   Check the legacy manager and SharedWorker paths only where they're implicated.
4. **Regression test first** ([sdk-test](../sdk-test/SKILL.md)), then the narrowest fix. Record the run before and after
   the fix. If tests can't run, say the hypothesis is unverified.
5. A fix can break customers who rely on the old behavior. Report the root cause, the behavior change and who it affects,
   using the four report fields from `AGENTS.md`.
