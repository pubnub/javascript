# Live integration tier

Mocha (a JavaScript test runner) runs the code samples from the public documentation against the real PubNub service. The samples come from the PubNub Software Development Kit (SDK) docs. The mocked tests in `test/integration/**` stay as they are. They use nock, a library that fakes HTTP responses. The `npm run test:node` script never runs this folder, because `.mocharc.json` excludes it.

## Run

```bash
npm run build:node                                   # samples import 'pubnub', which resolves to lib/node/index.js of this checkout
cp test/integration/live/.env.example test/integration/live/.env.local   # then fill in the keys (git ignores .env.local)
npm run test:integration:live                        # the docs-sample tier: everything except endpoints/ (needs the docs keysets)
npm run test:integration:live:endpoints              # only endpoints/**: real-network endpoint tests that are not doc samples (each test needs its own role: DS_* for DataSync, SUBSCRIBE_KEY and PUBLISH_KEY for the rest)
npm run test:integration:live -- --grep publishMinimal
npm run test:integration:live -- --dry-run           # lists the tests, no network, no keys needed
npm run test:integration:live:types                  # type check (needs the build for lib/types)
npx eslint "test/integration/live/**/*.ts" --ignore-pattern "test/integration/live/quickstarts/**"           # lint (npm run lint covers src/ only). Do not add --config: it drops the max-len override of live/.eslintrc.cjs
```

Environment variable names: `SUBSCRIBE_KEY` and `PUBLISH_KEY` (open keyset), `PAM_SUBSCRIBE_KEY`, `PAM_PUBLISH_KEY` and `PAM_SECRET_KEY` (Access Manager, PAM), and `DS_*` (DataSync, DS). Real environment variables take precedence over the file. `LIVE_ENV_FILE=<path>` points to another file. The run stops at once if the open keyset is missing.

A docs-tier run without `--grep` and without spec file arguments needs every role. It fails at once, and names the missing variables, when `pam` or `datasync` is not set. A run with `--grep` or a file argument checks a role only when a test builds its client. So a page that needs only the open keyset runs with only that keyset. Run one live run per keyset at a time.

**Two runs, two keysets.** The tier has two Mocha configuration files.

| Script | Config | Runs | Keys | Janitor / preflight |
| :--- | :--- | :--- | :--- | :--- |
| `test:integration:live` | `.mocharc.cjs` | every test except `endpoints/` (`api-reference/`, `getting-started/`, `migration-guides/`, `shared/`, `use-cases/`) | open, pam and datasync keysets of the docs | on (`LIVE_JANITOR=off`, `LIVE_PREFLIGHT=off` switch them off) |
| `test:integration:live:endpoints` | `.mocharc.endpoints.cjs` | only `endpoints/**`: 6 DataSync event and projection files (`endpoints/data_sync/`) and 3 files with the real-network tests of the SDK endpoint suite (`endpoints/fetch_messages.test.ts`, `history.test.ts`, `message_actions.test.ts`; 14 tests) | no role is checked up front, each test checks its own: `datasync` (`DS_SUBSCRIBE_KEY`, `DS_PUBLISH_KEY`, `DS_SECRET_KEY`) for the DataSync files, `open` (`SUBSCRIBE_KEY`, `PUBLISH_KEY`, with Message Persistence and message actions) for the other three | off by default (`LIVE_JANITOR=on` / `LIVE_PREFLIGHT=on` turn them on) |

The DataSync endpoint tests need the DataSync classes `JSCustomer`, `JSLoanQuote` and `JSREQUESTED_BY`. These classes exist on a different keyset from the one the docs samples use.

The other three files (`fetch_messages`, `history`, `message_actions`) publish to the real service and read the result back. They moved out of `test/integration/endpoints/`. The files with the same names there are mocked. This keeps `npm run test:node` fully offline. A root hook in `test/setup-why.ts` refuses every request that no nock scope matches. These three files are not documentation samples, and they carry no `// snippet.` markers.

Continuous Integration (CI) runs the whole folder as one separate step. It uses the SDK's own keysets, the ones `run-tests.yml` uses: `SDK_SUB_KEY` and `SDK_PUB_KEY` as `SUBSCRIBE_KEY` and `PUBLISH_KEY`, and `SDK_DS_*` as `DS_*`. It does not use the docs keysets.

Each test titles itself `endpoints/<file>: ...`. So `--grep '^endpoints/(fetch_messages|history|message_actions)'` runs only the open-keyset files, and `--grep '^endpoints/data_sync'` runs only the DataSync files. A test whose role is not set fails with `missing keys: the <role> keyset is not configured, set <env names>`.

These tests use a channel named after a fresh Universally Unique Identifier (UUID), one per test. So they are safe on a shared, persistent keyset. They poll eventually consistent reads with `eventually` instead of a fixed wait.

The janitor's resource list and the preflight's feature checks belong to the docs keysets. The endpoint tests remove their own uniquely named objects. `.mocharc.endpoints.cjs` sets `LIVE_TIER=endpoints`, and `support/hooks.ts` reads that value. With it set, no role is required up front, and the full-run rule below does not apply.

Mocha adds a spec file from the command line to the config's `spec`. It does not replace it. So the docs-tier config excludes `endpoints/**` with `exclude`, and a file argument for the other tier is not added to a run. Check what a script runs with `-- --dry-run`. The root `npm run test:node` lists none of this folder.

The workflow (`.github/workflows/live-integration.yml`) runs on non-draft pull requests into `master`, when the paths it watches change, and on demand. It has no scheduled runs. It does not alert anyone on failure yet. The GitHub run logs are the only signal.

Rebuild with `npm run build:node` after a change under `src/`. Otherwise the tier tests the previous build.

## Conventions

- **One file per docs page.** Put each page in `<page>.test.ts` under the folder that matches its docs section (`api-reference/`, `getting-started/`, `migration-guides/`, `shared/` or `use-cases/`). The docs URL then maps to `test/integration/live/<folder>/<page>.test.ts`. Use one `describe` per page and one `it` per sample. Start each `it` title with the snippet id or ids, then say what the test proves.
- Use plain Mocha `describe` and `it`, and `node:assert/strict`. Do not use staging, a recorder, or `page`, `step` or `check`.
- **Markers.** Put the markers inside the `it` body: `// snippet.<id>` ... `// snippet.end`. The code between them is the published sample text. Indentation may differ, because readers see it unindented. Do not change the sample without approval from the docs owner. Setup, listeners and assertions stay outside the markers. Use `// snippet.hide` and `// snippet.show` only where the sample cannot run without a line that readers must not see.
- Run the marker lint (`npm run test:integration:live:lint`) after every change. A snippet id is part of the docs URL, so keep each id stable.
- **Literal names.** The code in the markers uses the exact names the docs show (`'my_channel'`, `'foo'`, and so on). Those names run as written. Isolation comes from two things: one live run per keyset at a time, and a cleanup pass (the janitor) before and after each run.
- **Assertions must not assume a private, clean resource.** Channels, users and groups are shared, and they persist across runs. Assert on data from this run: the `timetoken` the sample returned, an ID, or a unique value that the test generates outside the markers. Do not assert exact counts or "the latest N". If the sample does not keep its response, match as narrowly as the sample allows, for example by publisher or payload, and explain why in a comment.
- **Reset, then assert exactly.** A test that uses a literal resource (a channel group, a user, a device token, or a DataSync object) first resets it to a known state. It removes the resource, then seeds what it needs. Then it asserts the exact result. This is safe because the janitor cleans the listed names, and one run owns a keyset at a time. Put the reset in the test or in a hook of the page, not in the sample.
- **Real keys.** A sample shows placeholder keys. Put the real keys in a `// snippet.hide` ... `// snippet.show` block inside the call: `...openKeys(),`, `...securedKeys()` or `...subscribeKeyOnly(),` from `support/env.ts`. These helpers are typed `Partial`, so no cast is needed, and TypeScript does not raise error TS2783. Readers never see the block.
- **Placeholder literals.** When a sample shows a placeholder where a run needs a live value (a token, a file id `'...'`, or a timetoken), keep the sample text. Pass the test a client wrapped by `withPlaceholders(client, { placeholder: liveValue })` from `support/placeholders.ts`.
- **Prettier.** Wrap a marker region in `/* eslint-disable prettier/prettier */` ... `/* eslint-enable prettier/prettier */`, placed outside the markers, when `eslint --fix` would reformat the sample.
- **Unique run ids.** Anything a test asserts on exactly, and does not own, gets a per-run suffix. Examples are a channel the test reads back, or a payload marker. Use `unique('name')` from `support/util.ts`, or `randomUUID()` in the payload. The janitor never clears such names, because they cannot be listed in `support/resources.ts`. Their messages expire with the retention period of the keyset.
- **Console.** A client that logs at Debug or Trace level prints its configuration, including the real keys. Wrap the test in `quietConsole()` from `support/console.ts`, and call `restore()` in a `finally` block. The root hook also mutes the console while it destroys clients, so the dumps printed at destroy time stay out of the log. Sample `console.log` output is fine. A sample that prints a granted token (`console.log('Granted Token:', token)`) runs under `captureConsole('log')`. The root hook restores any capture that a failed test left behind, with `restoreAllConsoles()`.
- **Retry setup, never the sample.** Setup and cleanup code outside the markers (seeding and resets) may wrap a call in `retryTransient` from `support/retry.ts`. It repeats only HTTP (Hypertext Transfer Protocol) 5xx and 429 responses, and network, timeout or unclassified transport failures. It never repeats a 4xx response, a validation error or an assertion error. It logs one `retryTransient:` line per retry. Code inside the markers, the assertions about a sample's effect, and calls whose failure a test asserts are never retried or wrapped. Mocha `retries` stays at 0, and timeouts are not lengthened to hide flakiness.
- **Creates with a run-unique id, and seeding on a fresh channel (endpoint tests only).** A create call is not idempotent, so `retryTransient` alone is wrong for it. If the service stored the first attempt, a retry gets a 409 response (conflict). Use `createWithRunUniqueId(create, readBack, { label })` from `support/retry.ts` for ids that no one else can hold. These are `freshId` and `projectionId`. Both end in `uniqueSuffix()` from `support/util.ts`. That suffix is the time in base 36 (digits and letters) plus six random base-36 characters. So an id cannot match an object that earlier runs left on a keyset that is years old.

  The helper retries transient failures. On a retry, it treats a 409 with DS-0301 as proof that the earlier attempt was stored, and it returns `readBack()` (a get by id). On the first attempt, it throws the 409. `seedOnFreshChannel(newChannel, seed)` seeds a run-unique channel. On a transient failure, it starts the whole seeding again on a new channel. Tests that assert exact counts must never reuse a half-seeded channel. Neither helper belongs in a documentation sample, which uses fixed literal ids and runs once.
- **Objects a test creates are removed whatever the outcome (endpoint tests).** Register the id before the create, with `removeAfterTest(client, 'entity' | 'user' | 'channel' | 'relationship' | 'membership', freshId(...))`. The helper lives in `support/datasync-live-helpers.ts` and uses `support/cleanup.ts`. The root `afterEach` removes the registered objects, newest first, before it destroys the clients. It does this whether the test passed, failed an assertion, or failed in the create itself. A 404 response (not found) is expected and silent. Nothing lists or sweeps the keyset. Only the ids that this test generated get removed. A hook that creates objects (`before`) removes them in its own `after`.
- **Failures explain themselves.** `support/hooks.ts` wraps Mocha's `Runner#fail` once. For each failed test or hook in either npm script, if its error is a PubNub SDK error, or wraps one through `.cause`, the failure list gets two extra lines. They show `category`, `statusCode`, `operation` and the service's error data (`support/explain-error.ts`). Keys, tokens and URL queries are masked. No test opts in, and pass or fail results do not change.
- **Retried publishes can be stored twice.** A failed attempt may still have reached the service. A seeder whose test counts messages adds `run: seedRun.id` to the payload. It publishes through `seedPublish`, then calls `settleSeeded` from `support/history.ts`. That call deletes the stored copies that the caller never received a timetoken for.
- **Waiting.** Poll with `eventually`. Listen with `watch` or `expectEvent`. Use a fixed `sleep` only where the test proves that something did NOT arrive. `PRESENCE_EVENT_TIMEOUT` (30 s) is for a presence event that the test caused. `PRESENCE_TIMEOUT` (45 s) is for polling `hereNow` and similar reads.
- **`settled` instead of `eventually`.** `eventually` returns on the first read that passes, and that proves only that one replica caught up. Use `settled` as the precondition of a sample that reads eventually consistent state once and asserts the result exactly. Examples of such state are a filter or sort index, a list, a count, history, presence, message actions, file listing, push registrations and App Context members. The default is 3 passes in a row, 750 ms apart, so about 1.5 s once the state is visible. Poll the same read the sample will make, from a helper client, and put that poll outside the markers.

  Keep `eventually` where the wait is the final assertion of the test, or where it waits for an event or local state. A fixed `sleep` or a longer timeout is never a substitute, because neither shows that consecutive reads agree. Do not run a sample inside the wait to retry it.
- Clients come from `support/clients.ts`. The root hook destroys them after every test, so do not call `destroy()` yourself. A client built by hand (the sample's own `new PubNub(...)`) goes through `track()`.

## Helpers (`support/`)

| File | Exports |
| :--- | :--- |
| `env.ts` | `env()`, `keysOf(role)`, `openKeys()`, `securedKeys(role?)`, `subscribeKeyOnly()`, `describeRoles()`, `loadEnv()`, `redact()` |
| `clients.ts` | `createClient(role, userId, extra?)`, `shopper()`, `friend()`, `observer()`, `server(role?)`, `unreachable`, `track()`, `destroyClients()` |
| `wait.ts` | `eventually`, `settled`, `watch` (returns a `Watch` with `events`, `next`, `stop`), `connected`, `expectEvent`, `expectStatus`, `sleep`, `PRESENCE_TIMEOUT`, `PRESENCE_EVENT_TIMEOUT`. A timed-out `expectEvent`, `connected`, `expectStatus` or `Watch.next` reports what the client saw. That includes the statuses (category, operation, and the cursor of a connected status), the count and kinds of events with their channels, and the channels it was subscribed to. Pass `{ describe: () => '...' }` to add what the test knows, such as timetokens. |
| `assertions.ts` | `assertTimetoken` (a string, as `publish()` returns it), `assertServerTime` (a number, as `time()` returns it), `addToTimetoken`, `rejectsValidation`, `rejectsWithCategory` |
| `placeholders.ts` | `withPlaceholders(client, values)` |
| `util.ts` | `unique(base)`, `uniqueSuffix()`, `sorted(values)` |
| `cleanup.ts` | `cleanupAfterTest(label, run)`, `runCleanups()` (called by the root `afterEach`) |
| `history.ts` | `storedMessage(client, channel, timetoken)`, `untilStored(channel, tokens)`, `newSeedRun`, `seedPublish`, `settleSeeded` (seeding with retry and duplicate removal) |
| `retry.ts` | `retryTransient(fn, { attempts, label })`, `isTransient(error)`; the janitor's `retry` calls it too; also `createWithRunUniqueId`, `isAlreadyExists`, `seedOnFreshChannel` |
| `explain-error.ts` | `explainSdkError(err)`: appends the SDK status summary to a failure's message; installed by `hooks.ts` |
| `console.ts` | `captureConsole(method)`, `quietConsole()`, `restoreAllConsoles()` |
| `resources.ts` | the janitor's resource list; `DATASYNC_PAGE_OBJECTS` is shared with `datasync-state.ts` |
| `hooks.ts` | root hooks: role check before a full run, janitor, preflight, client cleanup after each test |
| `snippets.ts` | snippet extraction with the rules of the docs extractor |

Other files in `support/` serve one page or one tool (`janitor*.ts`, `preflight.ts`, `datasync-*.ts`, `subscribe-groups.ts`, `proxy.ts`, `file-workdir.ts`, `access-manager.ts`).

Every `observer()` or `shopper()` call builds a new client. So a test can hold two clients with the same user id when it needs them.

## Cleanup (janitor), preflight, provisioning

The tests use the literal names that the docs show (`'my_channel'`, `'family'`, and so on). So the state they leave behind is shared, and it persists. Three parts keep a run honest.

### Janitor (`support/janitor.ts`, `janitor-datasync.ts`, `resources.ts`)

`runJanitor()` cleans **exactly the resources listed in `support/resources.ts`**, per keyset role, and nothing else. It never lists a keyset to find things to delete. It never touches a DataSync class, and it never changes keyset configuration. A role whose keys are missing is skipped, with a note. The janitor is best effort and idempotent. It reports what it removed, what it could not remove, and what it left on purpose.

| Role | What it does |
| :--- | :--- |
| open | deletes the listed channel groups; removes the listed App Context users and channels and the memberships/members between listed ones; removes push registrations of the listed device tokens on fcm, apns and apns2 (production, development); deletes all files on the listed file channels (paged); deletes the message history of the listed channels (`deleteMessages` without start/end, only on channels that have messages) |
| pam | revokes the application-level Access Manager grant; the same lists as open when the role has any; history of its listed channels |
| datasync | the same revoke (once when pam and datasync are one keyset); DataSync relationships and memberships, then entities, users and channels from the list; history |

The janitor runs automatically from the root hooks. It runs once before all tests. A failure fails the run, and the output lists what could not be removed. On a secured keyset, the janitor then waits until a client without a token is refused again. That can take up to about 60 s when the previous run just changed a grant. It gives up after 120 s. It also runs once after all tests. A failure there prints a loud banner and does not fail the run. The exception is a failed grant revoke, which leaves a secured keyset open. The next run's cleanup retries before the run, and it fails if the keyset is still dirty.

```bash
npm run test:integration:live:janitor            # the janitor alone, all roles; exit code 1 when something could not be removed
npm run test:integration:live:janitor -- --role open
```

A full pass walks every listed name, so it takes a while. For a single page or a `--grep` run, turn the janitor off: `LIVE_JANITOR=off npm run test:integration:live -- --grep publishMinimal`. Run the janitor command before and after such runs when you want a clean slate.

**Adding a name.** Add one string to the right list of the right role in `support/resources.ts`: `channels`, `fileChannels`, `channelGroups`, `appContext.users`, `appContext.channels`, `pushDevices`, or `dataSync.*`. The file holds data only. A resource that a test creates and does not list is never cleaned, so it stays on the keyset from run to run. One channel is left out on purpose: `history_documented_behavior`. It holds more than 100 messages, which its test writes once and reuses (see the comment in `resources.ts`). Names with a per-run suffix are not listed either. Their messages expire with the keyset's retention period. A channel in a channel group must also be listed under `channels`, because deleting a group does not delete its member channels.

### Preflight (`support/preflight.ts`)

After the janitor, the root hook fails fast. Its message names each missing feature. With `PUBNUB_ADMIN_API_KEY` and the keyset ids (`DOCS_SNIPPETS_OPEN_KEYSET_ID`, `DOCS_SNIPPETS_PAM_KEYSET_ID`, `DOCS_SNIPPETS_DS_KEYSET_ID`), the hook reads each keyset's configuration through the Admin API, read-only. It lists what the role needs and lacks: Presence, Message Persistence, Delete-From-History, App Context and its events, Files, Stream Controller, Access Manager and DataSync.

Live probes on the open keyset always run. They check publish (keys and network), Message Persistence, Delete-From-History, and Presence when the Admin API did not confirm it. The features each keyset needs are the ones the message names. `missingFeatures` in `support/preflight.ts` is the full list per role (open, pam, datasync).

### Provisioning (`provision/`)

`provision/provision-datasync.ts` creates the DataSync classes from `provision/datasync-classes.json`. The script is idempotent. It never deletes a class, and it fails on a class whose immutable fields differ. The tier does not run it. Run it when a DataSync keyset is new or when the class file changes.

```bash
npm run test:integration:live:provision:check    # dry diff, writes nothing, exit code 1 when anything differs
npm run test:integration:live:provision          # creates missing classes, updates drifted mutable fields
```

Without `PUBNUB_ADMIN_API_KEY`, the script only checks through the SDK that each class exists. The Admin API key needs a DataSync permission row for the DataSync keyset.

### Environment variables

| Name | Meaning |
| :--- | :--- |
| `SUBSCRIBE_KEY`, `PUBLISH_KEY`, `PAM_*`, `DS_*` | keysets, as above |
| `PUBNUB_ADMIN_API_KEY` | optional; Admin API feature check and provisioning |
| `DOCS_SNIPPETS_OPEN_KEYSET_ID`, `DOCS_SNIPPETS_PAM_KEYSET_ID`, `DOCS_SNIPPETS_DS_KEYSET_ID` | optional; keyset ids for the feature check (not secrets) |
| `LIVE_JANITOR=off` | skip the janitor before and after the run (any other value runs it) |
| `LIVE_PREFLIGHT=off` | skip the preflight |
| `LIVE_ENV_FILE` | another env file |

Everything the janitor, the preflight and the provisioning print goes through `redact()` (`support/env.ts`). It masks every key of the environment, the admin key, key-shaped strings and long token-like strings.

## Offline checks: marker lint, coverage manifest, docs cross-check

Three scripts need no keys and no network. They answer one question: does every snippet that the public docs embed from this repository run against the real service in a test here, or is it on a listed exception with a reason?

```bash
npm run test:integration:live:lint                  # marker lint + manifest --check + eslint of the tier
npm run test:integration:live:manifest              # regenerate coverage.json
npm run test:integration:live:docs-check            # docs cross-check (needs the documentation checkout)
```

**Lint** (`support/lint-markers.ts`). A self-test with deliberately broken files is in `support/lint-selftest.ts`. The lint scans every `*.test.ts` file and every sample file in this folder. It fails with `file:line` messages on these problems:

- Malformed, unbalanced or nested markers. The docs extractor would silently cut the outer snippet.
- `snippet.hide` without `snippet.show`.
- Hidden blocks longer than 3 lines.
- An id outside `[a-zA-Z0-9_-]`.
- An id used twice anywhere in the tier.
- An empty snippet.
- Test-only code in the visible text: `assert`, `expect`, `eventually`, `watch`, or anything imported from `support/` or `node:assert`.
- `try`, `catch` or `console.error` in a sample. The allow-list is `ERROR_HANDLING_SNIPPETS`, and the `use-cases/` folder is listed in `ERROR_HANDLING_FOLDERS`. Both live in the lint file.

The `use-cases/` exemption is a decision of the docs owner. Use-case samples are application code that shows its own error handling: try/catch around each call, and `console.error`. So the protection against a swallowed error there is the assertion after the snippet.

Instead of a run-time proof, the lint checks three things statically, with the TypeScript compiler API:

- Each snippet sits inside an `it()`, or inside a named helper that an `it()` calls.
- An assertion call follows the snippet's end line in that `it()`. Assertion calls are `assert*`, `rejects*`, `expect*`, `eventually`, or an `await` of a promise that an earlier assertion call armed. For example: `const back = expectStatus(...)`, then `await back`.
- The snippet has no `return` of its own that could skip the rest.

When the static check cannot see an assertion, add `// lint: asserted-via <helperName>` after the snippet, inside the `it()` body. The helper must be called after the snippet. The lint prints every use.

Only import-only snippets may sit at the top of a file (mode `compile-only`). A file-level sample that starts with an `import` but also holds functions and other code cannot sit in an `it()`. For that case, one narrow escape exists: put `// lint: asserted-by <part of an it title>` on the line right after its `// snippet.end`. The text must match exactly one `it()` title in the file. That `it()` must contain an assertion call. The manifest records mode `live` for that test. The lint prints every use as a note. Today only `fanBehaviorStateStore` uses it, because its test reads back the state file.

A hidden block stays at 3 lines or fewer. Put setup in a helper defined before the snippet, and call the helper from the hidden block.

Known blind spots: the check proves that an assertion call exists after the snippet. It does not prove that the assertion checks the snippet's effect. A helper called through a variable or a callback is not followed.

**Manifest** (`support/manifest.ts`). It writes `coverage.json`. That file is generated, so do not edit it. It has one entry per snippet id, with these fields: the file, the full Mocha title that runs the snippet (describe plus it), the keyset role when the test names one (a heuristic), and `mode`. The modes are:

- `live`: inside an `it()`.
- `compile-only`: import-only samples. They are type-checked and loaded, but not run as an API call.
- `mocked`: inside a nock-mocked test listed in `MOCKED_FILES` in `support/snippet-scan.ts`: `test/integration/endpoints/objects/channel.test.ts`, `test/integration/endpoints/time.test.ts` and `test/integration/components/subscription_manager.test.ts`. These cover five samples. The same lint rules apply, except the title-names-the-id warning, which is the live tier's convention.

`files` lists whole-file samples that a test runs (`getting-started/quickstart-node.mjs`). `-- --check` fails when `coverage.json` is stale. Docs embeds that are deliberately not run (the browser, React and React Native quickstarts) are listed by hand, with a reason, in `snippet-exceptions.json`.

**Docs cross-check** (`support/docs-check.ts`). It reads every `<EmbeddedCode>` component that points at `pubnub/javascript` in the documentation checkout. The checkout path comes from the first argument, from `DOCS_REPO`, or from the default `../documentation`. Each embed is reported as live, compile-only, mocked, exception, or NOT COVERED. The command exits with code 1 when an embed is NOT COVERED, unless `--report-only` is passed.

The URL must name a file under `test/integration/live/` or one of the mocked test files. The file must exist, and `coverage.json` must list each requested snippet id for that same file. A whole-file embed needs a file that a test in `coverage.json` names, or a listed exception. Any other path, such as a leftover `docs-snippets/...` URL, is NOT COVERED. The API reference pages `users`, `spaces`, `memberships` and `access-manager-v2` are out of scope. This script only reads the documentation repository.
