# Live integration tier

Mocha tests that run the code samples of the public docs against the real PubNub service. The nock-mocked tests in `test/integration/**` stay as they are, and `npm run test:node` never runs this folder (`.mocharc.json` excludes it).

## Run

```bash
npm run build:node                                   # samples import 'pubnub', which resolves to lib/node/index.js of this checkout
cp test/integration/live/.env.example test/integration/live/.env.local   # then fill in the keys (git ignores .env.local)
npm run test:integration:live                        # the docs-sample tier: everything except endpoints/ (needs the docs keysets)
npm run test:integration:live:endpoints              # only endpoints/**: real-network endpoint tests that are not doc samples (each test needs its own role: DS_* for DataSync, SUBSCRIBE_KEY and PUBLISH_KEY for the rest)
npm run test:integration:live -- --grep publishMinimal
npm run test:integration:live -- --dry-run           # lists the tests, no network, no keys needed
npm run test:integration:live:types                  # type check (needs the build for lib/types)
npx eslint "test/integration/live/**/*.ts"           # lint (npm run lint covers src/ only). Do not add --config: it drops the max-len override of live/.eslintrc.cjs
```

Env names: `SUBSCRIBE_KEY`, `PUBLISH_KEY` (open keyset), `PAM_SUBSCRIBE_KEY`, `PAM_PUBLISH_KEY`, `PAM_SECRET_KEY` (Access Manager), `DS_*` (DataSync). Real environment variables win over the file. `LIVE_ENV_FILE=<path>` points at another file. The run fails at once when the open keyset is missing. A docs-tier run without `--grep` (and without spec file arguments) needs every role: it fails at once, with the missing names, when `pam` or `datasync` is not set. A run with `--grep` or a file argument checks a role only when a test builds its client, so a page that needs only the open keyset runs with only that keyset. Run one live run per keyset at a time.

**Two runs, two keysets.** The tier has two Mocha configs.

| Script | Config | Runs | Keys | Janitor / preflight |
| :--- | :--- | :--- | :--- | :--- |
| `test:integration:live` | `.mocharc.cjs` | every test except `endpoints/` (`api-reference/`, `getting-started/`, `migration-guides/`, `shared/`, `use-cases/`) | open, pam and datasync keysets of the docs | on (`LIVE_JANITOR=off`, `LIVE_PREFLIGHT=off` switch them off) |
| `test:integration:live:endpoints` | `.mocharc.endpoints.cjs` | only `endpoints/**`: 6 DataSync event and projection files (`endpoints/data_sync/`) and 3 files with the real-network tests of the SDK endpoint suite (`endpoints/fetch_messages.test.ts`, `history.test.ts`, `message_actions.test.ts`; 14 tests) | no role is checked up front, each test checks its own: `datasync` (`DS_SUBSCRIBE_KEY`, `DS_PUBLISH_KEY`, `DS_SECRET_KEY`) for the DataSync files, `open` (`SUBSCRIBE_KEY`, `PUBLISH_KEY`, with Message Persistence and message actions) for the other three | off by default (`LIVE_JANITOR=on` / `LIVE_PREFLIGHT=on` turn them on) |

The DataSync endpoint tests need the DataSync classes `JSCustomer`, `JSLoanQuote` and `JSREQUESTED_BY`, which exist on a different keyset from the one the docs samples use. The other three files (`fetch_messages`, `history`, `message_actions`) are the tests that publish to the real service and read the result back; they were moved out of `test/integration/endpoints/` of the same names, whose remaining tests are nock-mocked, so that `npm run test:node` runs fully offline (a root hook in `test/setup-why.ts` refuses every request that no nock scope matches). They are not documentation samples and carry no `// snippet.` markers. CI runs the whole folder as one separate step with the SDK's own keysets (the ones `run-tests.yml` uses: `SDK_SUB_KEY`/`SDK_PUB_KEY` as `SUBSCRIBE_KEY`/`PUBLISH_KEY`, and `SDK_DS_*` as `DS_*`), not the docs keysets. Every test titles itself `endpoints/<file>: ...`, so `--grep '^endpoints/(fetch_messages|history|message_actions)'` runs only the open-keyset files and `--grep '^endpoints/data_sync'` only the DataSync files; a test whose role is not set fails with `missing keys: the <role> keyset is not configured, set <env names>`. These tests use channels named after a fresh UUID per test, so they are safe on a shared, persistent keyset, and they poll eventually consistent reads with `eventually` instead of a fixed wait. The janitor's resource list and the preflight's feature checks belong to the docs keysets, and the endpoint tests remove their own uniquely named objects. `.mocharc.endpoints.cjs` sets `LIVE_TIER=endpoints`, which `support/hooks.ts` reads: no role is required up front and the full-run rule below does not apply. Mocha adds a spec file on the command line to the config's `spec` (it does not replace it), so the docs-tier config excludes `endpoints/**` with `exclude`, and a file argument of the other tier is not added to a run. Check what a script runs with `-- --dry-run`. The root `npm run test:node` lists none of this folder. The workflow (`.github/workflows/live-integration.yml`) runs nightly and on demand; it does not alert anyone on failure yet (the notify job was removed, the GitHub run logs are the only signal).

Rebuild with `npm run build:node` after a change under `src/`, otherwise the tier tests the previous build.

## Conventions

- One file per docs page: `<page>.test.ts`, named like the old page module (`docs-snippets/api-reference/publish.ts` becomes `api-reference/publish.test.ts`; keep the folder (`api-reference/`, `getting-started/`, `migration-guides/`, `shared/`) so the docs URL changes only its prefix and suffix). One `describe` per page, one `it` per old step. Start the `it` title with the snippet id(s), then what it proves.
- Plain `describe` / `it`, `node:assert/strict`. No staging, no recorder, no `page` / `step` / `check`.
- Markers sit inside the `it` body: `// snippet.<id>` ... `// snippet.end`. The code between them is copied character for character from the old page (indentation may differ, readers get it un-indented). Everything else (setup, listeners, assertions) stays outside. Use `// snippet.hide` / `// snippet.show` only where the sample cannot run without a line readers must not see.
- Check each page with the equivalence script (below). Every snippet id must stay and its text must not change.
- **Literal names.** The code in the markers uses exactly the names the docs show (`'my_channel'`, `'foo'`, ...), and that is what runs. Isolation comes from one live run per keyset at a time and a cleanup pass before and after (the janitor).
- **Assertions must not assume a private, clean resource.** Channels, users and groups are shared and persist across runs. Assert on this run's own data: the `timetoken` the sample returned, an ID, or a unique value your test generates outside the markers. Do not assert exact counts or "the latest N". When the sample does not keep its response, match as narrowly as the sample allows (publisher, payload) and say why in a comment.
- **Reset, then assert exactly.** A test that works on a literal resource (a channel group, a user, a device token, a DataSync object) first resets it to a known state (remove, then seed what it needs), and then asserts the exact result. This is safe because the janitor cleans the listed names and one run owns a keyset at a time. Put the reset in the test or in a hook of the page, not in the sample.
- **Real keys.** A sample shows placeholder keys. Put the real ones in a `// snippet.hide` ... `// snippet.show` block inside the call: `...openKeys(),`, `...securedKeys(),` or `...subscribeKeyOnly(),` from `support/env.ts` (typed `Partial`, so no cast and no TS2783). Readers never see the block.
- **Placeholder literals.** When a sample shows a placeholder where a run needs a live value (a token, a file id `'...'`, a timetoken), the sample text stays and the test passes it a client wrapped by `withPlaceholders(client, { placeholder: liveValue })` (`support/placeholders.ts`).
- **Prettier.** Wrap a marker region in `/* eslint-disable prettier/prettier */` ... `/* eslint-enable prettier/prettier */`, placed outside the markers, when `eslint --fix` would reformat the sample.
- **Unique run ids.** Anything a test asserts on exactly and does not own (a channel it reads back, a payload marker) carries a per-run suffix: `unique('name')` from `support/util.ts`, or `randomUUID()` in the payload. Such names cannot be listed in `support/resources.ts`, so the janitor never clears them. Their messages expire with the retention of the keyset.
- **Console.** A client that logs at Debug or Trace level prints its configuration with the real keys. Wrap the test in `quietConsole()` (`support/console.ts`) and call `restore()` in a `finally`. The root hook also mutes the console while it destroys clients, so the destroy-time dumps stay out of the log. Sample `console.log` output is fine, but a sample that prints a granted token (`console.log('Granted Token:', token)`) runs under `captureConsole('log')`. The root hook restores any capture a failed test left behind (`restoreAllConsoles()`).
- **Transient service errors: retry setup, never the sample.** Setup and cleanup code outside the markers (seeding, resets) may wrap a call in `retryTransient` (`support/retry.ts`). It repeats only HTTP 5xx, 429 and network, timeout or unclassified transport failures, never a 4xx, a validation error or an assertion error, and it logs one `retryTransient:` line per retry. Code inside the markers, the assertions about a sample's effect, and calls whose failure a test asserts are never retried or wrapped. Mocha `retries` stays 0 and timeouts are not lengthened to hide flakiness.
- **Retried publishes can be stored twice.** A failed attempt may have reached the service. A seeder whose test counts messages puts `run: seedRun.id` in the payload, publishes through `seedPublish` and calls `settleSeeded` (`support/history.ts`), which deletes stored copies the caller never received a timetoken for.
- **Waiting.** Poll with `eventually`, listen with `watch` / `expectEvent`. Use a fixed `sleep` only where the test proves that something did NOT arrive. `PRESENCE_EVENT_TIMEOUT` (30 s) is for a presence event the test caused; `PRESENCE_TIMEOUT` (45 s) is for polling `hereNow` and similar reads.
- **`settled` instead of `eventually`.** `eventually` returns on the first read that passes, which proves only that one replica caught up. Use `settled` (default: 3 passes in a row, 750 ms apart, so about 1.5 s once the state is visible) as the precondition of a sample that reads the same eventually consistent state ONCE and is asserted exactly: a filter or sort index, a list, a count, history, presence, message actions, file listing, push registrations, App Context members. Poll the same read the sample will make, from a helper client, and put it outside the markers. Keep `eventually` where the wait is itself the final assertion of the test, or where it waits for an event or local state. A fixed `sleep` or a longer timeout is never a substitute: they do not show that consecutive reads agree. Do not run a sample inside the wait to retry it.
- Clients come from `support/clients.ts` and are destroyed after every test by the root hook. Do not call `destroy()` for them yourself. A client built by hand (the sample's own `new PubNub(...)`) goes through `track()`.

## Helpers (`support/`)

| File | Exports |
| :--- | :--- |
| `env.ts` | `env()`, `keysOf(role)`, `openKeys()`, `securedKeys(role?)`, `subscribeKeyOnly()`, `describeRoles()`, `loadEnv()`, `redact()` |
| `clients.ts` | `createClient(role, userId, extra?)`, `shopper()`, `friend()`, `observer()`, `server(role?)`, `unreachable`, `track()`, `destroyClients()` |
| `wait.ts` | `eventually`, `settled`, `watch` (returns a `Watch` with `events`, `next`, `stop`), `connected`, `expectEvent`, `expectStatus`, `sleep`, `PRESENCE_TIMEOUT`, `PRESENCE_EVENT_TIMEOUT` |
| `assertions.ts` | `assertTimetoken` (a string, as `publish()` returns it), `assertServerTime` (a number, as `time()` returns it), `addToTimetoken`, `rejectsValidation`, `rejectsWithCategory` |
| `placeholders.ts` | `withPlaceholders(client, values)` |
| `util.ts` | `unique(base)`, `sorted(values)` |
| `history.ts` | `storedMessage(client, channel, timetoken)`, `untilStored(channel, tokens)`, `newSeedRun`, `seedPublish`, `settleSeeded` (seeding with retry and duplicate removal) |
| `retry.ts` | `retryTransient(fn, { attempts, label })`, `isTransient(error)`; the janitor's `retry` calls it too |
| `console.ts` | `captureConsole(method)`, `quietConsole()`, `restoreAllConsoles()` |
| `resources.ts` | the janitor's resource list; `DATASYNC_PAGE_OBJECTS` is shared with `datasync-state.ts` |
| `hooks.ts` | root hooks: role check before a full run, janitor, preflight, client cleanup after each test |
| `snippets.ts`, `compare-snippets.ts` | snippet extraction with the docs rules, and the equivalence check |

Other files in `support/` serve one page or one tool (`janitor*.ts`, `preflight.ts`, `datasync-*.ts`, `subscribe-groups.ts`, `proxy.ts`, `file-workdir.ts`, `access-manager.ts`).

Every `observer()`, `shopper()` call builds a new client, so a test can have two clients with the same user id when it needs them.

## Equivalence check

```bash
npx tsx test/integration/live/support/compare-snippets.ts docs-snippets/api-reference/publish.ts test/integration/live/api-reference/publish.test.ts
```

It extracts every snippet of both files with the rules of the docs extractor and compares them per id. It exits 1 on any difference, missing or extra id, or marker problem.

## Cleanup (janitor), preflight, provisioning

The tests use the literal names the docs show (`'my_channel'`, `'family'`, ...), so the state they leave behind is shared and persistent. Three pieces keep a run honest.

### Janitor (`support/janitor.ts`, `janitor-datasync.ts`, `resources.ts`)

`runJanitor()` cleans **exactly the resources listed in `support/resources.ts`**, per keyset role, and nothing else. It never lists a keyset to delete what it finds, never touches a DataSync class and never changes keyset configuration. A role whose keys are missing is skipped with a note. It is best effort and idempotent, and it reports what it removed, what it could not remove and what it left on purpose.

| Role | What it does |
| :--- | :--- |
| open | deletes the listed channel groups; removes the listed App Context users and channels and the memberships/members between listed ones; removes push registrations of the listed device tokens on fcm, apns and apns2 (production, development); deletes all files on the listed file channels (paged); deletes the message history of the listed channels (`deleteMessages` without start/end, only on channels that have messages) |
| pam | revokes the application-level Access Manager grant; the same lists as open when the role has any; history of its listed channels |
| datasync | the same revoke (once when pam and datasync are one keyset); DataSync relationships and memberships, then entities, users and channels from the list; history |

It runs automatically from the root hooks: once before all tests (a failure fails the run with the list of what could not be removed; on a secured keyset it then waits until a client without a token is refused again, which can take up to about 60 s when the previous run just changed a grant; it gives up after 120 s), and once after all tests (a failure is printed in a loud banner and does not fail the run, except a failed grant revoke, which leaves a secured keyset open; the next run's cleanup before the run retries and fails when the keyset is still dirty).

```bash
npm run test:integration:live:janitor            # the janitor alone, all roles; exit code 1 when something could not be removed
npm run test:integration:live:janitor -- --role open
```

A full pass walks every listed name, so it takes a while (see the measured time in the report of this slice). For a single page or a `--grep` run, switch it off: `LIVE_JANITOR=off npm run test:integration:live -- --grep publishMinimal`. Clean up with the janitor command before and after such runs when you want a clean slate.

**Adding a name.** Add one string to the right list of the right role in `support/resources.ts` (`channels`, `fileChannels`, `channelGroups`, `appContext.users`, `appContext.channels`, `pushDevices`, `dataSync.*`). The file is data only. A resource a test creates that is not listed there is never cleaned and leaks from run to run. One channel is left out on purpose: `history_documented_behavior` holds more than 100 messages that its test writes once and reuses (see the comment in `resources.ts`). Names with a per-run suffix are not listed either; their messages expire with the keyset's retention. Channels that appear in a channel group must be listed under `channels` as well (deleting a group does not delete its member channels).

### Preflight (`support/preflight.ts`)

After the janitor, the root hook fails fast, with a message that names each missing feature. With `PUBNUB_ADMIN_API_KEY` and the keyset ids (`DOCS_SNIPPETS_OPEN_KEYSET_ID`, `DOCS_SNIPPETS_PAM_KEYSET_ID`, `DOCS_SNIPPETS_DS_KEYSET_ID`) it reads each keyset's configuration through the Admin API (read only) and lists what the role needs and lacks (Presence, Message Persistence, Delete-From-History, App Context and its events, Files, Stream Controller, Access Manager, DataSync). Live probes on the open keyset always run: publish (keys and network), Message Persistence, Delete-From-History, and Presence when the Admin API did not vouch for it. The features each keyset needs are listed in `docs-snippets/README.md`.

### Provisioning (`provision/`)

DataSync classes are created by `provision/provision-datasync.ts` from `provision/datasync-classes.json`. It is idempotent, never deletes a class and fails on a class whose immutable fields differ. The tier does not run it. Run it when a datasync keyset is new or the class file changes.

```bash
npm run test:integration:live:provision:check    # dry diff, writes nothing, exit code 1 when anything differs
npm run test:integration:live:provision          # creates missing classes, updates drifted mutable fields
```

Without `PUBNUB_ADMIN_API_KEY` it only checks through the SDK that each class exists. The Admin API key needs a DataSync permission row for the datasync keyset.

### Environment variables

| Name | Meaning |
| :--- | :--- |
| `SUBSCRIBE_KEY`, `PUBLISH_KEY`, `PAM_*`, `DS_*` | keysets, as above |
| `PUBNUB_ADMIN_API_KEY` | optional; Admin API feature check and provisioning |
| `DOCS_SNIPPETS_OPEN_KEYSET_ID`, `DOCS_SNIPPETS_PAM_KEYSET_ID`, `DOCS_SNIPPETS_DS_KEYSET_ID` | optional; keyset ids for the feature check (not secrets) |
| `LIVE_JANITOR=off` | skip the janitor before and after the run (any other value runs it) |
| `LIVE_PREFLIGHT=off` | skip the preflight |
| `LIVE_ENV_FILE` | another env file |

Everything the janitor, the preflight and the provisioning print goes through `redact()` (`support/env.ts`), which masks every key of the environment, the admin key, key-shaped strings and long token-like strings.

## Offline checks: marker lint, coverage manifest, docs cross-check

Three scripts that need no keys and no network. They answer one question: does every snippet the public docs embed from this repository run against the real service in a test here, or sit on a listed exception with a reason?

```bash
npm run test:integration:live:lint                  # marker lint + manifest --check + eslint of the tier
npm run test:integration:live:manifest              # regenerate coverage.json
npm run test:integration:live:docs-check            # docs cross-check (needs the documentation checkout)
```

**Lint** (`support/lint-markers.ts`; a self-test with deliberately broken files is `support/lint-selftest.ts`). It scans every `*.test.ts` and sample file under this folder and fails with `file:line` messages on: malformed, unbalanced or nested markers (the docs extractor would silently cut the outer snippet), `snippet.hide` without `snippet.show`, hidden blocks longer than 3 lines, an id outside `[a-zA-Z0-9_-]`, an id used twice anywhere in the tier, an empty snippet, test-only code in the visible text (`assert`, `expect`, `eventually`, `watch`, anything imported from `support/` or `node:assert`), and `try` / `catch` / `console.error` in a sample (allow-list `ERROR_HANDLING_SNIPPETS` and the `use-cases/` folder, `ERROR_HANDLING_FOLDERS`, both in the lint file). The `use-cases/` exemption is a decision of the docs owner: use-case samples are application code that shows its own error handling (try/catch around each call, `console.error`), so the protection against a swallowed error there is the assertion after the snippet. Instead of the old run-time proof it checks statically, with the TypeScript compiler API, that each snippet sits inside an `it()` (or a named helper an `it()` calls), that an assertion call follows the snippet's end line in that `it()` (`assert*`, `rejects*`, `expect*`, `eventually`, or an `await` of a promise armed earlier by such a call, like `const back = expectStatus(...)` ... `await back`), and that the snippet has no `return` of its own that could skip the rest. When the static check cannot see an assertion, put `// lint: asserted-via <helperName>` after the snippet in the `it()` body: the helper must be called after the snippet, and the lint prints every use. Only import-only snippets may sit at the top of a file (mode `compile-only`). One narrow escape exists for a file-level sample that starts with an `import` but also holds functions and other code (it cannot sit in an `it()`): put `// lint: asserted-by <part of an it title>` on the line right after its `// snippet.end`. The text must match exactly one `it()` title of the file, that `it()` must contain an assertion call, the manifest records mode `live` with that test, and the lint prints every use as a note (today: `fanBehaviorStateStore`, whose state file the test reads back). A hidden block stays at 3 lines or fewer: put setup in a helper defined before the snippet and call it from the hidden block. Known blind spots: the check proves an assertion call exists after the snippet, not that it checks the snippet's effect; a helper called through a variable or callback is not followed.

**Manifest** (`support/manifest.ts`, output `coverage.json`, generated, do not edit). One entry per snippet id: file, the full Mocha title that runs it (describe + it), keyset role when the test names one (heuristic), and `mode`: `live` (inside an `it()`), `compile-only` (import-only samples: type-checked and loaded, not run as an API call), `mocked` (inside a nock-mocked test listed in `MOCKED_FILES` in `support/snippet-scan.ts`: `test/integration/endpoints/objects/channel.test.ts`, `test/integration/endpoints/time.test.ts`, `test/integration/components/subscription_manager.test.ts`, five samples; the same lint rules apply, except the title-names-the-id warning, which is the live tier's convention). `files` lists whole-file samples that a test runs (`getting-started/quickstart-node.mjs`). `-- --check` fails when `coverage.json` is stale. Things the docs embed that are deliberately not run (the browser, React and React Native quickstarts) are listed by hand, with a reason, in `snippet-exceptions.json`.

**Docs cross-check** (`support/docs-check.ts`). Reads every `<EmbeddedCode>` that points at `pubnub/javascript` in the documentation checkout (first argument, `DOCS_REPO`, or `../documentation`) and reports each embed as live, compile-only, mocked, exception or NOT COVERED (exit code 1 unless `--report-only`). It understands both URL styles. An old-style URL (`docs-snippets/<folder>/<page>.ts`) is mapped to `test/integration/live/<folder>/<page>.test.ts`. A new-style URL (a path under `test/integration/live/`, or one of the mocked test files) is checked as it stands: the file must exist and `coverage.json` must list each requested snippet id for that very file (a whole-file embed needs a file named by a test in `coverage.json`, or a listed exception); its `action` in the repoint list is `done`. Use `--out <file>` when you run it on a checkout so the default repoint list is not overwritten. For an embed that points at an old duplicate copy (`docs-snippets/basic-usage/*`, `docs-snippets/<page>.ts`) it finds the same id in the tier and says whether the old copy and the tested twin are IDENTICAL or DIFFERENT (diffs in `/tmp/pn-live/dup-diffs/`). Such embeds stay listed as NOT COVERED until the docs are repointed. It writes the list for repointing the docs URLs to `/tmp/pn-live/docs-repoint.json` (`--out <file>` to change); its `action` is `repoint` (the mapped path), `repoint-to-twin` (the embed points at an old duplicate copy: change it to `newPath`, the tested twin), `keep` (documented exception), `done` (the URL already points at the tested tier) or `blocked` (not covered and no twin). The pages `users`, `spaces`, `memberships` and `access-manager-v2` of the API reference are out of scope. The documentation repository is only read.
