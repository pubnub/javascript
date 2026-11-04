# Live docs snippet tests

These tests run the code samples of the JavaScript SDK (software development kit) docs against the real PubNub service and check that each sample does what its docs page says.

## What only these tests catch

A mocked test never runs the docs code and never talks to the service, so it cannot find a wrong docs sample.

## Why they do not duplicate the integration tests

- A test here checks only what the docs page claims, through the service. It does not check request encoding, retries or parsing. `test/integration` owns that.
- No step extends a sample to cover more parameters. A passing step means the documented behavior held, not that every option of the method works.
- The code readers see stays simple. All test code sits outside the snippet markers or on `snippet.hide` lines, and a marker lint enforces it.

## Tech stack

The suite adds no dependency. It runs on the Mocha 10.4 and tsx that the existing Node tests use, and checks types with the repository's TypeScript. It has its own Mocha config (`.mocharc.cjs`), its own tsconfigs and no nock, the HTTP mocking library of the integration tests.

## What a run does

| Stage | What happens |
| :--- | :--- |
| 1. Load keys | The loader reads the env names below and prints "set" or "missing" per role |
| 2. Stage | The command line tool, [`harness/cli.ts`](harness/cli.ts), copies the suite to `docs-snippets/.run/<runId>/` and adds the run suffix to resource names |
| 3. Set up DataSync | Only when the run includes the `datasync` role. The setup creates missing classes |
| 4. Preflight | Checks that each keyset has the features its role needs, and names every missing one |
| 5. Steps | Each step runs its docs snippet, then asserts the effect through the service |
| 6. Clean up | The janitor (the cleanup routine) deletes what the run created and proves that no Access Manager grant is left open |
| 7. Report | The reporter writes `report/run.json` and `report/summary.md`, then the run policy decides the exit code |

A shard is the set of steps of one role. CI, the GitHub Actions workflow [`docs-snippets.yml`](../.github/workflows/docs-snippets.yml), runs the three shards one after another in one job, and each shard's report goes to `report/<shard>/`.

## Run the tests locally

You need Node.js 22 or later and your own PubNub keysets, as "Use your own keys" describes. Then, from the repository root:

```bash
npm ci
npm run build:node                                      # the tests use lib/node/index.js of this checkout
cp docs-snippets/.env.example docs-snippets/.env.local  # then fill in your keys
npm run test:docs-snippets                              # everything
```

| Command | What it does |
| :--- | :--- |
| `npm run test:docs-snippets` | Stages the suite, sets up the DataSync classes when the run includes the `datasync` role, then runs every step live |
| `npm run test:docs-snippets -- --shard <role>` | Runs one role: `open` (about 8 min), `pam` (about 1.5 min) or `datasync` (about 3.5 min) |
| `npm run test:docs-snippets -- --grep <regex>` | Runs the steps whose title matches, for example `--grep publishBasicUsage`. Each title carries its snippet ids. The steps a selected step needs run first, and the report lists them as prerequisites. Refused in CI |
| `npm run test:docs-snippets:dry` | No network. Checks the registry, staging, the marker lint, the static mapping, the manifest, the selection, the run policy and the reporter |
| `npm run test:docs-snippets:types` | Type checks the suite (`tsconfig.live.json`) and the browser samples (`tsconfig.browser.json`) |
| `npm run docs-snippets:manifest` | Writes `coverage.json`. With `-- --check` it verifies it instead |
| `npm run docs-snippets:provision` | Creates missing DataSync classes and updates drifted ones. With `-- --check` it shows the difference and writes nothing |
| `npm run test:docs-snippets:janitor` | Removes leftovers of runs older than six hours and revokes the application-level Access Manager grants |

Rebuild with `npm run build:node` after a change under `src/`, otherwise the suite tests the previous build. If `pam` and `datasync` point at the same keyset, do not run those two shards at the same time.

Each run writes two files to `docs-snippets/report/`. `run.json` has one record per step with its snippet ids, page, role, status, skip reason, duration and assertion count, plus the SDK version and commit. `summary.md` has the counts, failures, skips, time per phase and the slowest steps. In GitHub Actions the summary also goes to the job summary.

## How a test runs the exact docs code

A test is a `step()` in a page module that has the same base name as its docs page, for example [`api-reference/publish.ts`](api-reference/publish.ts) for the publish page. The docs embed the code between the markers from this file, so the test and the docs page show the same code.

### Checks that keep the tests honest

| Check | Rule |
| :--- | :--- |
| The snippet ran | In the staged copy every snippet start and end line records itself. A step fails when one of its snippets did not reach its `snippet.end` line |
| It asserted something | A step fails when it recorded zero assertions after its snippet started. Fixture setup does not count |
| Static mapping | Every marker id belongs to exactly one step or stub, every step's `snippets` list equals the markers in its body, and no id appears twice |
| Mutation | `DOCS_SNIPPETS_MUTATE=<id>` throws at the start marker in the staged copy. That step must fail. Refused in CI |
| Same lines | Staging rewrites only registered names and never moves a line, so the line number of a failure matches the source file |

## Keysets, roles and secrets

The suite reads one fixed set of env names, whatever fills them.

| Role | Env names | Used for |
| :--- | :--- | :--- |
| `open` | `SUBSCRIBE_KEY`, `PUBLISH_KEY` | Publish, subscribe, presence, history, message actions, App Context, files, push, channel groups, encryption, misc |
| `pam` | `PAM_SUBSCRIBE_KEY`, `PAM_PUBLISH_KEY`, `PAM_SECRET_KEY` | Access Manager v2 and v3 samples, `publishHandleErrors` and other 403 branches |
| `datasync` | `DS_SUBSCRIBE_KEY`, `DS_PUBLISH_KEY`, `DS_SECRET_KEY` | DataSync samples, including the ones that also need Access Manager |
| admin | `PUBNUB_ADMIN_API_KEY` | DataSync class setup before the tests, and a read-only check of keyset features |

### Use your own keys

1. In the [Admin Portal](https://admin.pubnub.com), create the keysets of "Features each keyset needs" below. One keyset can serve both `pam` and `datasync`.
2. Copy [`docs-snippets/.env.example`](.env.example) to `docs-snippets/.env.local` and fill in the keys. Git ignores `.env.local`.
3. Run `npm run test:docs-snippets -- --shard open` first. It needs only the open keyset.

Leave a role empty and its steps skip as `missing-env:<role>`. You can also keep the file elsewhere and set `DOCS_SNIPPETS_ENV_FILE=<path>`, or export the env names in your shell. Real environment variables always win over the file. The file may also use the older `PN_DOCS_*` names, which the loader maps onto the names above.

The loader reads the file in memory and prints only "set" or "missing" per role. It never prints a key or part of one, and the reporter redacts every file before it writes it.

### Keys in CI

The workflow sets the same names from repository secrets in one `env:` block of the `live` job:

| Secret | Env name |
| :--- | :--- |
| `SDK_DOCS_OPEN_SUBSCRIBE_KEY`, `SDK_DOCS_OPEN_PUBLISH_KEY` | `SUBSCRIBE_KEY`, `PUBLISH_KEY` |
| `SDK_DOCS_PAM_SUBSCRIBE_KEY`, `SDK_DOCS_PAM_PUBLISH_KEY`, `SDK_DOCS_PAM_SECRET_KEY` | `PAM_*` |
| `SDK_DOCS_DS_SUBSCRIBE_KEY`, `SDK_DOCS_DS_PUBLISH_KEY`, `SDK_DOCS_DS_SECRET_KEY` | `DS_*` |
| `SDK_DOCS_ADMIN_API_KEY` (only the `datasync` shard gets it) | `PUBNUB_ADMIN_API_KEY` |

Optional and not secret: `DOCS_SNIPPETS_OPEN_KEYSET_ID`, `DOCS_SNIPPETS_PAM_KEYSET_ID` and `DOCS_SNIPPETS_DS_KEYSET_ID` (the workflow reads `vars.SDK_DOCS_DS_KEYSET_ID`). With the admin key the preflight reads each keyset's feature configuration through the Admin API, after it confirms that the keyset of that id has the role's subscribe key.

Give this suite keysets of its own, not the keysets of `run-tests.yml`. Some Access Manager v2 samples grant on the whole keyset for a moment. The suite closes every grant when its step ends and checks before and after the run that a client without a token is refused, but a test that runs in parallel on the same keyset could still see the grant.

### Features each keyset needs

The suite never changes a keyset. A preflight names every missing feature in one message, for example "Presence is off on the open keyset".

| Role | Features |
| :--- | :--- |
| `open` | Presence with tracking on all channels (pattern `*`), Message Persistence with Delete-From-History, App Context with user, channel and membership events on and referential integrity off, Files, Mobile Push Notifications (no credentials needed), Stream Controller with wildcard subscribe. Access Manager off |
| `pam` | Access Manager with token revocation, Message Persistence, Presence |
| `datasync` | Access Manager, DataSync, the classes `product` v1 and `ProductOwner` v1 with a `public` projection (the setup creates them), DataSync event rules for `User`, `Channel`, `Membership`, `product` and `ProductOwner` v1 (Admin Portal only, DataSync tab, "Select entities to sync") |

### DataSync classes

[`provision/datasync-classes.json`](provision/datasync-classes.json) defines the classes. Every live run that includes the `datasync` role sets them up first:

- It creates missing classes and updates classes whose mutable fields drifted. It never deletes a class.
- A class whose immutable fields differ (relationship cardinality or entity sides) fails the run with the difference, because only a person may recreate it.
- A second run reports every class as unchanged and writes nothing.
- It touches only the classes of that file. Classes of other tests on a shared keyset stay as they are.
- Without `PUBNUB_ADMIN_API_KEY` it checks through the SDK, and a missing class fails the run with its name.

## Skips

Every skip prints its reason, and the report counts it. [`harness/skips.ts`](harness/skips.ts) holds the closed list of reasons.

| Reason | Meaning | Effect in CI |
| :--- | :--- | :--- |
| `browser-only` | Needs a browser (File API, `toFile`, `toBlob`) | Allowed |
| `react-native` | Needs React Native | Allowed |
| `needs-real-device` | Needs a device | Allowed |
| `needs-feature:push-notifications` | The keyset has no Mobile Push add-on | Allowed, fatal when `DOCS_SNIPPETS_REQUIRE_FEATURES` names it (nightly) |
| `needs-feature:datasync-events` | DataSync event rules are off (Admin Portal only) | Allowed, fatal when `DOCS_SNIPPETS_REQUIRE_FEATURES` names it (nightly) |
| `missing-env:<role>` | The role's keys are not set | Fatal |
| `blocked-by:<id>` | A step this one needs did not pass | Counts against `DOCS_SNIPPETS_SKIP_BUDGET` (0 in CI) |

`DOCS_SNIPPETS_STRICT=1` makes every skip fatal.

The browser, React and React Native sources in `quickstarts/` stay here because the docs embed them. `tsconfig.browser.json` type checks the browser ones. Nothing compiles the React and React Native ones here, because the SDK has no React dependencies. A separate test project with a browser and React Native runs them.

## Control variables

| Variable | Effect |
| :--- | :--- |
| `DOCS_SNIPPETS_ENV_FILE` | Env file to read keys from. Default: `docs-snippets/.env.local` |
| `DOCS_SNIPPETS_SHARD` | Same as `--shard` |
| `DOCS_SNIPPETS_ONLY` | Comma-separated step ids, like `--grep` with exact ids. Refused in CI |
| `DOCS_SNIPPETS_MUTATE` | See "Checks that keep the tests honest". Refused in CI |
| `DOCS_SNIPPETS_INJECT_FAILURE` | Makes a step fail with an SDK-style 403 after it ran. Refused in CI |
| `DOCS_SNIPPETS_SKIP_BUDGET` | Most `blocked-by` skips allowed. Default 0 in CI, unlimited locally |
| `DOCS_SNIPPETS_REQUIRE_FEATURES` | Comma-separated features whose `needs-feature` skips fail the run |
| `DOCS_SNIPPETS_STRICT` | `1` makes every skip fatal |
| `DOCS_SNIPPETS_LOG_LEVEL` | SDK log level of the samples. `trace` and `debug` are refused in CI, because the SDK logs its configuration at those levels |
| `DOCS_SNIPPETS_VERBOSE` | `1` prints the console output of every step |
| `DOCS_SNIPPETS_RUN_ID` | Fixed run id. In CI it is derived from the time, `GITHUB_RUN_ID`, `GITHUB_RUN_ATTEMPT` and the shard |
| `DOCS_SNIPPETS_DOCS_DIR` | Docs checkout for the manifest's docs id report. Default: a `documentation` folder next to this repository |

## Add a snippet

1. Write the docs code inside a `step()` of the page module, between `// snippet.<id>` and `// snippet.end`.
2. Register new resource names in `fixtures/names.ts`.
3. Assert the effect the page claims, outside the markers. Use a second client or a read back, not "it did not throw".
4. Run `npm run test:docs-snippets:dry`, then `npm run docs-snippets:manifest`, then `npm run test:docs-snippets -- --grep <id>`.
