---
name: sdk-feature
description: Use when adding or enhancing a PubNub JavaScript SDK feature, endpoint, parameter or public API. Contract-first steps, public-surface checklist and validation.
---

# sdk-feature

1. **Contract first.** There are no OpenAPI specs in this repo. Before changing request or response semantics, ask
   for the operation's spec (operationId/path and revision) and record it in the PR. If the spec is missing or contradicts
   current behavior, stop and surface the gap. Gherkin scenarios in `sdk-specifications` describe SDK behavior; they
   aren't schemas.
2. Load [sdk-architecture](../sdk-architecture/SKILL.md) and the relevant module guide. Copy the nearest existing endpoint
   or facade method rather than designing a new shape.
3. Public surface:
   - callback and Promise overloads
   - JSDoc with defaults, an example and any deprecation
   - `@internal` on anything non-public
   - export chain through to `lib/types/index.d.ts`
   - validation and error messages consistent with neighboring APIs
4. Optional feature module? Add the `process.env.<NAME>_MODULE` guard and its `replaceConfiguration` entry.
5. Tests, via [sdk-test](../sdk-test/SKILL.md): validation boundaries, the encoded request, response/error mapping,
   and both callback and Promise forms.
6. `npm run build:node`, then `.scripts/agent-test.sh release` (declaration checks).
7. Report with the four report fields from `AGENTS.md`. Call out new network traffic, bundle size and any platform restrictions.
