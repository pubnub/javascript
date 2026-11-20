---
name: sdk-test
description: Use when choosing, writing or running PubNub JavaScript SDK tests, including browser (karma), live-key feature and contract (cucumber) suites. Covers the suite map, prerequisites, env vars and how to report results.
---

# sdk-test

Always run tests through `.scripts/agent-test.sh`. It prints one line on pass and only the failures on fail, and it
blocks with exit 2 when a prerequisite is missing. Running a suite and summarizing it is mechanical, so it can go to a
light-model subagent that returns the wrapper output verbatim.

## Pick the smallest suite
| Run | Covers | Needs | Network |
| --- | --- | --- | --- |
| `<path>.test.ts [--grep re]` | one mocha file | `npm install` | per file (most use nock) |
| `unit` | `test/unit` | `npm install` | mocked; **no keys needed** |
| `integration` | `test/integration` (minus shared-worker) | `npm install` | mocked, **no keys needed** except `endpoints/data_sync/` (35 tests need `DS_*` keys) |
| `release` | version consistency + `lib/types` declarations | `build:node` | none |
| `node` | unit + integration + release (= `npm run test:node`) | `build:node` | mocked |
| `web` | `test/dist/web-titanium.test.js` in ChromeHeadless | `build:web`, Chrome, port 9898 | **live**, demo keys |
| `shared-worker` | `test/integration/shared-worker` | `build:web`, Chrome, port 9876 | **live**, demo keys |
| `feature-files` / `feature-objects` | file upload / App Context | `PUBLISH_KEY`, `SUBSCRIBE_KEY` with Files / App Context enabled | **live**; creates or mutates resources. Ask first |
| `contract` | cucumber scenarios | see [contract.md](contract.md) | mock on :8090 |

- `test/unit/event_engine*.test.ts` drive full clients over nock-mocked HTTP.
- `npm test` includes live browser traffic; it is not an offline smoke test.
- `ci:*` scripts clean, build, lint and test everything. Use them only for full validation, never concurrently.
- Run one suite at a time. Suites share ports, fake timers, mocks and build directories.

## Secrets
- Env var names: `PUBLISH_KEY`, `SUBSCRIBE_KEY`, plus `PAM_{PUBLISH,SUBSCRIBE,SECRET}_KEY` and `DS_{PUBLISH,SUBSCRIBE,SECRET}_KEY`.
  CI supplies these. `unit`, and `integration` outside `endpoints/data_sync/`, run without them. `data_sync` needs the
  `DS_*` keys, and `node` includes it, so it needs them too.
- Load them inside the same command: `set -a; . test/.env.local; set +a; .scripts/agent-test.sh feature-files`
  (`test/.env.local` is gitignored).
- Never print values. Never pass real signing secrets to browser tests. The wrapper redacts secret-looking env values
  from its output.

## Results
- Exit codes: `0` pass · `1` (or the runner's code) fail · `2` blocked or no tests ran.
- On failure, the wrapper prints the full log's path. `grep` it; don't read it whole.
- Zero tests, entirely skipped, blocked or unrun suites are validation gaps, never passes. Report the exact commands
  you ran and what you didn't run.
- Browser demo-key passes don't prove production delivery behavior.

## Writing tests
Follow [authoring.md](authoring.md).
