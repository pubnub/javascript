# PubNub JavaScript SDK

Source of the `pubnub` npm package and CDN bundles (Node, browsers, React Native). Customers depend on its public
types and realtime behavior, so small behavior changes can break them.

## Commands
- Install: `npm install`, as `run-tests.yml` does. Use Node 22 or 24, the CI matrix. Mocha fails at startup on Node 26; that's environmental, not an SDK bug.
- Build (no keys needed): `npm run build:node` (tsc → `lib/` + aggregated `lib/types/index.d.ts`) · `npm run build:web` (rollup → `dist/web/`). Run `build:node` before the `release` or `node` suite.
- Typecheck: `npm run typecheck`. It covers Node sources only; browser/worker sources are type-checked by `build:web`.
- Lint: `npm run lint` (src/ only)
- Test, one file: `.scripts/agent-test.sh test/unit/publish/publish.test.ts [--grep '<re>']`
- Keyless tests: `.scripts/agent-test.sh unit` runs with no env keys; nock mocks all HTTP. `integration` also passes without keys, except `test/integration/endpoints/data_sync/` (35 tests), which needs the `DS_*` keys.
- Other suites: `release` needs `build:node`. `node` (unit + integration + release) needs `build:node` and the `DS_*` keys. Browser, live-key and contract suites → sdk-test skill, ask first.
- Wrap any noisy command: `.scripts/agent-test.sh npm run build:node` prints one line on pass and only the failures on fail.
- Don't call mocha/karma/cucumber directly: mocha without `--no-config` silently runs the whole suite.
- Inspect logs with `grep`/`tail`; never read a full log.
- Formatting, lint fixes and the secret scan run in pre-commit. Don't run them manually.

## Layout
- `src/core/`: shared public API. `pubnub-common.ts` (PubNubCore), `endpoints/` (one `AbstractRequest` subclass per REST call), `components/`, `types/api/`
- `src/event-engine/`: subscribe/presence state machines, on by default. `enableEventEngine: false` uses `core/components/subscription-manager.ts` instead
- `src/transport/`: platform transports. `middleware.ts` owns auth, signatures and request retries; `subscription-worker/` is the browser SharedWorker
- `src/{node,web,react_native}/`: entry points. No build config compiles `src/{titanium,nativescript}/`.
- `lib/`, `dist/web/`: committed build output. Regenerate it with the build commands; never edit or search it.
- `test/unit`, `test/integration`: mocha + chai/sinon/nock with network disabled; helpers in `test/utils.ts`
- `test/dist`, `test/feature`, `test/integration/shared-worker`: live-network suites, excluded from `.mocharc.json`

## Conventions that differ from the defaults
- Timetokens are strings (they exceed 2^53). Never convert them to numbers.
- Public methods expose callback and Promise overloads; keep both when changing a signature.
- Optional modules are gated by `process.env.<NAME>_MODULE`. Rollup's `replaceConfiguration` substitutes them in web
  bundles only (PAM is off by default there); Node evaluates them at runtime. Add any new flag to `replaceConfiguration`.
- `src/core`, `src/entities` and `src/event-engine` must not import Node- or browser-only APIs.
- Mark non-public declarations `@internal`; `stripInternal` drops them from the published types.
- Validation, defaults, error text and null/undefined handling are customer-visible. Never "fix" them as incidental cleanup.

## Boundaries
- **Always:** end every change or review with these four fields:
  - breaking change (yes/no/uncertain, with evidence)
  - behavior change, however small
  - validation actually run vs skipped
  - customer impact

  A skipped or zero-test run is not a pass. PR titles and bodies follow `.github/pull_request_template.md`.
- **Always:** when you change a command, script or test prerequisite, update this file or the affected skill in the same change.
- **Always:** run one test or build command at a time (`ci:*` and builds wipe `lib/` and `dist/`). Refer to key env vars by name; never print their values.
- **Ask first:** public API signature or type changes · new dependencies · live-network or real-key suites · endpoint wire-format changes. There are no OpenAPI specs in this repo: ask for the operation's spec rather than inferring it from code.
- **Never** (each is enforced by a hook or CI):
  - hand-edit `lib/`, `dist/`, `package-lock.json`, `CHANGELOG.md`, `.pubnub.yml`, `.env*` or key files → `.agents/hooks/protect-files.sh`
  - force-push or use `--no-verify` → `.agents/hooks/git-policy.sh`
  - commit secrets → gitleaks in pre-commit and CI
  - finish with a failing typecheck → `.agents/hooks/quick-check.sh`

## More context
Skills live in `.agents/skills/`. Read only the one the task needs.
- Internals, per-module invariants and test locations → [sdk-architecture](.agents/skills/sdk-architecture/SKILL.md)
- Feature or endpoint → [sdk-feature](.agents/skills/sdk-feature/SKILL.md) · Bug → [sdk-debug](.agents/skills/sdk-debug/SKILL.md)
- Refactor → [sdk-refactor](.agents/skills/sdk-refactor/SKILL.md) · Review → [sdk-review](.agents/skills/sdk-review/SKILL.md)
- Choosing, writing or running tests → [sdk-test](.agents/skills/sdk-test/SKILL.md)
- Finalizing a PR (rebuild artifacts, release bot) → [sdk-release](.agents/skills/sdk-release/SKILL.md)
- Dependency upgrade → [sdk-deps](.agents/skills/sdk-deps/SKILL.md)
- Delegate mechanical work (running suites, log triage, file moves, `.scripts/check-agent-docs.sh`) to a subagent on a
  light model (e.g. Haiku) that returns only a summary. Keep design, debugging and review on the main model.
