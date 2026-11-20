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
LIVE_GROUP=publish npm run test:integration:live     # one API group of groups.cjs (see "Groups and CI jobs")
LIVE_GROUP=endpoints-datasync npm run test:integration:live:endpoints   # one group of the endpoint tier
npm run test:integration:live:types                  # type check (needs the build for lib/types)
npx eslint "test/integration/live/**/*.ts" --ignore-pattern "test/integration/live/quickstarts/**"           # lint (npm run lint covers src/ only; the live-tier rules are a block in eslint.config.mjs)
```

Environment variable names: `SUBSCRIBE_KEY` and `PUBLISH_KEY` (open keyset), `PAM_SUBSCRIBE_KEY`, `PAM_PUBLISH_KEY` and `PAM_SECRET_KEY` (Access Manager, PAM), and `DS_*` (DataSync, DS). Real environment variables take precedence over the file. `LIVE_ENV_FILE=<path>` points to another file. The run stops at once if the open keyset is missing.

A docs-tier run without `--grep` and without spec file arguments needs every role. It fails at once, and names the missing variables, when `pam` or `datasync` is not set. A group run (`LIVE_GROUP`) without `--grep` needs exactly the `roles` of its group, in both tiers. A run with `--grep` or a file argument checks a role only when a test builds its client. So a page that needs only the open keyset runs with only that keyset. Run one live run per keyset at a time.

**Two runs, two keysets.** The tier has two Mocha configuration files.

| Script | Config | Runs | Keys | Janitor / preflight |
| :--- | :--- | :--- | :--- | :--- |
| `test:integration:live` | `.mocharc.cjs` | every test except `endpoints/` (`api-reference/`, `getting-started/`, `migration-guides/`, `shared/`, `use-cases/`) | open, pam and datasync keysets of the docs | on (`LIVE_JANITOR=off`, `LIVE_PREFLIGHT=off` switch them off) |
| `test:integration:live:endpoints` | `.mocharc.endpoints.cjs` | only `endpoints/**`: 6 DataSync event and projection files (`endpoints/data_sync/`) and 3 files with the real-network tests of the SDK endpoint suite (`endpoints/fetch_messages.test.ts`, `history.test.ts`, `message_actions.test.ts`; 14 tests) | no role is checked up front, each test checks its own: `datasync` (`DS_SUBSCRIBE_KEY`, `DS_PUBLISH_KEY`, `DS_SECRET_KEY`) for the DataSync files, `open` (`SUBSCRIBE_KEY`, `PUBLISH_KEY`, with Message Persistence and message actions) for the other three | off by default (`LIVE_JANITOR=on` / `LIVE_PREFLIGHT=on` turn them on) |

The DataSync endpoint tests need the DataSync classes `JSCustomer`, `JSLoanQuote` and `JSREQUESTED_BY`. These classes exist on a different keyset from the one the docs samples use.

The other three files (`fetch_messages`, `history`, `message_actions`) publish to the real service and read the result back. They moved out of `test/integration/endpoints/`. The files with the same names there are mocked. This keeps `npm run test:node` fully offline. A root hook in `test/setup-why.ts` refuses every request that no nock scope matches. These three files are not documentation samples, and they carry no `// snippet.` markers.

Continuous Integration (CI) runs this folder in two jobs of its own, `endpoints-datasync` and `endpoints-history`. They use the SDK's own keysets, the ones `run-tests.yml` uses: `SDK_SUB_KEY` and `SDK_PUB_KEY` as `SUBSCRIBE_KEY` and `PUBLISH_KEY`, and `SDK_DS_*` as `DS_*`. It does not use the docs keysets.

Each test titles itself `endpoints/<file>: ...`. So `--grep '^endpoints/(fetch_messages|history|message_actions)'` runs only the open-keyset files, and `--grep '^endpoints/data_sync'` runs only the DataSync files. A test whose role is not set fails with `missing keys: the <role> keyset is not configured, set <env names>`.

These tests use a channel named after a fresh Universally Unique Identifier (UUID), one per test. So they are safe on a shared, persistent keyset. They poll eventually consistent reads with `eventually` instead of a fixed wait.

The janitor's resource list and the preflight's feature checks belong to the docs keysets. The endpoint tests remove their own uniquely named objects. `.mocharc.endpoints.cjs` sets `LIVE_TIER=endpoints`, and `support/hooks.ts` reads that value. With it set, no role is required up front, and the full-run rule below does not apply.

Mocha adds a spec file from the command line to the config's `spec`. It does not replace it. So the docs-tier config excludes `endpoints/**` with `exclude`, and a file argument for the other tier is not added to a run. Check what a script runs with `-- --dry-run`. The root `npm run test:node` lists none of this folder.

The workflow (`.github/workflows/live-integration.yml`, named "Live tests") runs on every non-draft pull request into `master` (whatever files it changes) and on demand. It has no scheduled runs. It does not alert anyone on failure yet. The GitHub run logs are the only signal.

## Groups and CI jobs

`groups.cjs` splits the tier into API groups. Each group has a `name`, a `tier` (`docs` or `endpoints`), the keyset `roles` its tests use, and its `files`. `LIVE_GROUP=<name>` makes `.mocharc.cjs` or `.mocharc.endpoints.cjs` run only the files of that group (`support/group-select.cjs`). The config's `spec` is replaced, so no other file runs. A name of the other tier stops the run and names the right script. `--grep` still works inside a group.

| Group | Tier | Files | About |
| :--- | :--- | :--- | :--- |
| `messaging` | docs | `api-reference/publish*`, `subscribe*`, `presence`, `channel-groups`, `file-sharing*`, `mobile-push`, `message-persistence*`, `message-actions` | 130 s |
| `getting-started` | docs | `getting-started/*`, `shared/*`, `api-reference/configuration*`, `encryption*`, `misc`, `migration-guides/*` | 100 s |
| `use-cases` | docs | `use-cases/*` | 180 s |
| `access-manager` | docs | `api-reference/access-manager*` | 60 s |
| `app-context` | docs | `api-reference/objects` | 40 s |
| `datasync` | docs | `api-reference/datasync` | 50 s |
| `endpoints-datasync` | endpoints | `endpoints/data_sync/*` | 90 s |
| `endpoints-history` | endpoints | `endpoints/fetch_messages`, `history`, `message_actions` | 3 s |

`groups.cjs` is the source of truth. The table above is a summary, and the times are rough runtimes of a green run.

`datasync`, `endpoints-datasync`, `app-context` and `endpoints-history` stay separate because they failed most often in CI history, so a single re-run does not repeat stable tests. `access-manager` stays alone too, because it needs the DataSync role that the flaky groups share. The endpoint groups use other keysets and another Mocha config, so they never merge with docs groups.

**Every test file is in exactly one group.** `npm run test:integration:live:lint` runs `support/groups.ts --check`. It fails when a test file is in no group or in two groups, when a listed file does not exist or sits in the other tier, when a file uses the `pam` or `datasync` keyset and its group does not list that role, and when the workflow's `group` input options differ from the group names. So a new test file fails the lint until you add it to a group. So the groups together run exactly the full run. Compare the `-- --dry-run` lists when in doubt.

**One job per group.** The offline job checks the lint and types, then turns `groups.cjs` into the job matrix (`npm run test:integration:live:groups -- --matrix all`). The `live` job runs one matrix entry per group, one at a time (`max-parallel: 1`). A failed group does not stop the others (`fail-fast: false`), and the run is red when any group failed. Each job checks out, installs, builds and runs its group on its own. No job depends on another, so a single job can be re-run.

- Re-run one failed group in Actions: open the run, select the group's job, and choose "Re-run job". "Re-run failed jobs" re-runs only the failed groups.
- Start one group by hand: run the workflow with the `group` input set to its name (`all` runs every group). The `grep` input narrows the tests inside the selected groups.
- Run one group locally: `LIVE_GROUP=<name> npm run test:integration:live` (docs tier) or `LIVE_GROUP=<name> npm run test:integration:live:endpoints`.

The whole workflow has one concurrency group, `docs-snippets-live`, with `cancel-in-progress: false`. So the jobs of two runs never interleave on the keysets. A run that gets no live job (a draft or fork pull request) takes one group per pull request (`github.ref`), with `cancel-in-progress` on. So it never waits for a live run, and a new push cancels the older run of the same pull request.

To add a group: add it to `groups.cjs`, then add its name to the `group` input options of the workflow, in the same order. The lint fails until both match.

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
| `hooks.ts` | root hooks: role check before a full run or a group run, janitor, preflight, client cleanup after each test |
| `groups.ts` | `GROUPS`, `selectedGroup()`, `checkGroups()`, `matrixOf()`; `--check` and `--matrix` on the command line |
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

The janitor runs automatically from the root hooks. It runs once before all tests of a run, so once before each group job in CI. A failure fails the run, and the output lists what could not be removed. On a secured keyset, the janitor then waits until a client without a token is refused again. That can take up to about 60 s when the previous run just changed a grant. It gives up after 120 s. This wait runs only when the run uses a secured keyset: always for a run of the whole tier, and for a group only when its `roles` list `pam` or `datasync`. It also runs once after all tests. A failure there prints a loud banner and does not fail the run. The exception is a failed grant revoke, which leaves a secured keyset open. The next run's cleanup retries before the run, and it fails if the keyset is still dirty.

**Cancelling a run.** A cancelled or failed docs-tier job runs the step "Revoke grants and clean up", which calls the janitor and revokes the Access Manager grant. The cancel signal gives that step a short window to run. If it does not run (a forced cancel, or a runner that dies), the next job starts with its own janitor pass before any test. That pass removes every listed name and revokes the grant, and it is safe to repeat. So a cancelled run does not break the next run. Two things stay behind. Names with a per-run suffix, such as the channels of `unique()`, are not listed, and their messages expire with the keyset's retention. The endpoint tier has no cleanup step, so a cancelled endpoint job can leave DataSync objects with run-unique ids. They cannot collide with a later run, and no script sweeps them. A new push to a pull request cancels the older live runs of the same pull request, through `.github/workflows/cancel-superseded-live-runs.yml`. That workflow runs at once, because a run that waits for the shared concurrency group cannot run any step. It cancels only runs of the same pull request with a different head commit, never a run of another pull request. A cancelled run cleans up as described here, and the new run waits until the cancelled one has finished. GitHub keeps only one waiting run per concurrency group. So if three pull requests push while one run is in progress, the middle waiting run is replaced. Push again or use "Re-run all jobs" to get it back.

```bash
npm run test:integration:live:janitor            # the janitor alone, all roles; exit code 1 when something could not be removed
npm run test:integration:live:janitor -- --role open
```

A full pass walks every listed name. In CI it takes about 4 s, plus about 3 s for the wait on the secured keyset. The tests take the rest of the time. For a single page or a `--grep` run, you can turn the janitor off: `LIVE_JANITOR=off npm run test:integration:live -- --grep publishMinimal`. Run the janitor command before and after such runs when you want a clean slate.

**Not scoped by group.** A group job cleans the whole list for every role that has keys, not only the names of its group. Most names (`my_channel`, `game.chat` and many others) are shared by several groups. A list per group could miss a name without any error. A full pass is cheap, and it starts each job from a clean keyset whatever the job before it left. After a failed or cancelled docs-tier job, the workflow runs `npm run test:integration:live:janitor` again. That revokes the application-level Access Manager grant and waits until the secured keyset refuses a client without a token.

**Adding a name.** Add one string to the right list of the right role in `support/resources.ts`: `channels`, `fileChannels`, `channelGroups`, `appContext.users`, `appContext.channels`, `pushDevices`, or `dataSync.*`. The file holds data only. A resource that a test creates and does not list is never cleaned, so it stays on the keyset from run to run. One channel is left out on purpose: `history_documented_behavior`. It holds more than 100 messages, which its test writes once and reuses (see the comment in `resources.ts`). Names with a per-run suffix are not listed either. Their messages expire with the keyset's retention period. A channel in a channel group must also be listed under `channels`, because deleting a group does not delete its member channels.

### Preflight (`support/preflight.ts`)

After the janitor, the root hook fails fast. Its message names each missing feature. A group run checks only the roles of its group. With `PUBNUB_ADMIN_API_KEY` and the keyset ids (`DOCS_SNIPPETS_OPEN_KEYSET_ID`, `DOCS_SNIPPETS_PAM_KEYSET_ID`, `DOCS_SNIPPETS_DS_KEYSET_ID`), the hook reads each keyset's configuration through the Admin API, read-only. It lists what the role needs and lacks: Presence, Message Persistence, Delete-From-History, App Context and its events, Files, Stream Controller, Access Manager and DataSync.

Live probes on the open keyset always run. They check publish (keys and network), Message Persistence, Delete-From-History, and Presence when the Admin API did not confirm it. The full list per role is in "Keyset and API key requirements" below.

### Provisioning (`provision/`)

`provision/provision-datasync.ts` creates the DataSync classes from `provision/datasync-classes.json`. The script is idempotent. It never deletes a class, and it fails on a class whose immutable fields differ. The tests never run it. Run it when a DataSync keyset is new or when the class file changes.

CI runs only the read-only check (`provision:check`), as a step of each docs-tier group whose `roles` list `datasync` (`access-manager` and `datasync`; the merged groups `messaging` and `getting-started` do not list it). Those are the groups that use the DataSync classes of the docs keyset. A failed check does not skip the tests of the job. The endpoint tier uses other classes on another keyset, so its jobs do not run the check.

```bash
npm run test:integration:live:provision:check    # dry diff, writes nothing, exit code 1 when anything differs
npm run test:integration:live:provision          # creates missing classes, updates drifted mutable fields
```

Without `PUBNUB_ADMIN_API_KEY`, the script only checks through the SDK that each class exists. The key permissions are in "Keyset and API key requirements" below.

### Environment variables

| Name | Meaning |
| :--- | :--- |
| `SUBSCRIBE_KEY`, `PUBLISH_KEY`, `PAM_*`, `DS_*` | keysets, as above |
| `PUBNUB_ADMIN_API_KEY` | optional; Admin API feature check and provisioning |
| `DOCS_SNIPPETS_OPEN_KEYSET_ID`, `DOCS_SNIPPETS_PAM_KEYSET_ID`, `DOCS_SNIPPETS_DS_KEYSET_ID` | optional; keyset ids for the feature check (not secrets) |
| `LIVE_GROUP` | run only one group of `groups.cjs` |
| `LIVE_JANITOR=off` | skip the janitor before and after the run (any other value runs it) |
| `LIVE_PREFLIGHT=off` | skip the preflight |
| `LIVE_ENV_FILE` | another env file |

Everything the janitor, the preflight and the provisioning print goes through `redact()` (`support/env.ts`). It masks every key of the environment, the admin key, key-shaped strings and long token-like strings.

## Keyset and API key requirements

This section lists what you must set up on fresh PubNub keysets and on the Admin API integration key so that all 8 groups pass. Every row comes from the code, and the last column names the file. A value marked "not verified from code" is not proven by any file in this folder. Check it in the Admin Portal.

Shorthand: "preflight" is `missingFeatures` and the live probes in `support/preflight.ts`. "Test" means the header comment or the assertions of the named test file. The preflight reads the Admin API only when `PUBNUB_ADMIN_API_KEY` and the keyset id of the role are set (see "Admin API integration key"). Without them, a feature below is still required, but only a failing test shows it.

### Keysets and roles

| Role | Env names | Docs tier (CI secrets) | Endpoint tier (CI secrets) |
| :--- | :--- | :--- | :--- |
| open | `SUBSCRIBE_KEY`, `PUBLISH_KEY` | `SDK_DOCS_OPEN_SUBSCRIBE_KEY`, `SDK_DOCS_OPEN_PUBLISH_KEY` | `SDK_SUB_KEY`, `SDK_PUB_KEY` (the SDK open keyset) |
| pam | `PAM_SUBSCRIBE_KEY`, `PAM_PUBLISH_KEY`, `PAM_SECRET_KEY` | `SDK_DOCS_PAM_SUBSCRIBE_KEY`, `SDK_DOCS_PAM_PUBLISH_KEY`, `SDK_DOCS_PAM_SECRET_KEY` | not used |
| datasync | `DS_SUBSCRIBE_KEY`, `DS_PUBLISH_KEY`, `DS_SECRET_KEY` | `SDK_DOCS_DS_SUBSCRIBE_KEY`, `SDK_DOCS_DS_PUBLISH_KEY`, `SDK_DOCS_DS_SECRET_KEY` | `SDK_DS_SUB_KEY`, `SDK_DS_PUB_KEY`, `SDK_DS_SEC_KEY` (the SDK DataSync keyset) |

Sources: `support/env.ts`, `.github/workflows/live-integration.yml`.

- The docs tier needs the open role in every run, even for a group that lists no other role (`support/hooks.ts`, the check before the janitor).
- The docs tier has three role slots but may use two keysets. `pam` and `datasync` may be one keyset (`sharedSecured` in `support/env.ts`, `.env.example`). Then that one keyset needs every `pam` and every `datasync` feature below, and the janitor revokes the application-level grant once (`support/janitor.ts`).
- The open keyset must differ from the secured keyset: Access Manager is off on open and on for pam (preflight).
- The endpoint tier never uses the docs keysets and has no pam role (`.github/workflows/live-integration.yml`, step "Endpoint tests (SDK keysets)").
- Run one live run per keyset at a time. The tests use fixed names (`support/resources.ts`, workflow `concurrency`).

### Open keyset (docs tier)

| Feature or setting | Required value | Groups | Proof |
| :--- | :--- | :--- | :--- |
| Access Manager | off | all docs groups | preflight (`missingFeatures`); the clients of `shopper()`, `friend()` and `observer()` never carry a token (`support/clients.ts`) |
| Presence | on | `messaging`, `getting-started`, `use-cases` | preflight; `api-reference/presence.test.ts`, `api-reference/subscribe.test.ts` and `subscribe-legacy.test.ts` (headers), `migration-guides/v11.test.ts` (header), `use-cases/real-time-chat.test.ts`, `fan-re-engagement.test.ts`, `live-event-rate-limiting.test.ts` (headers) |
| Presence tracking rule | a rule with pattern `*` and tracking on | same | preflight |
| Presence events to listeners | join events reach a subscriber; leave or timeout events too | `messaging`, `use-cases` | `subscribe.test.ts` (`eventListenerBasicUsage` reads the join event), `use-cases/fan-re-engagement.test.ts` (leave or timeout) |
| Message Persistence | on | `messaging`, `getting-started`, `use-cases`, `endpoints-history` | preflight (config and `fetchMessages` probe); `publish.test.ts`, `message-persistence*.test.ts`, `message-actions.test.ts`, `file-sharing.test.ts`, `configuration-legacy.test.ts`, `use-cases/live-commentary.test.ts`, `live-polls.test.ts`, `match-stats.test.ts`, `real-time-chat.test.ts`, `automated-polling.test.ts`, `endpoints/history.test.ts` (headers) |
| Delete-From-History | on | `messaging`, `use-cases` | preflight (config and an empty-range `deleteMessages` probe); `message-persistence.test.ts` and `message-persistence-legacy.test.ts` (headers); the janitor skips history cleanup with a note when it is off (`support/janitor.ts`, `cleanHistory`) |
| Message actions (add, remove, fetch, and the events they raise) | on | `messaging`, `endpoints-history` | `api-reference/message-actions.test.ts`, `endpoints/message_actions.test.ts`; no config field is read, so the preflight does not check it |
| Stream Controller | on, with wildcard subscribe | `messaging`, `use-cases` | preflight; `channel-groups.test.ts`, `presence.test.ts` (channel group `cg1`), `subscribe-legacy.test.ts` (`OLDsubscribeWithWildCardChannels`), `use-cases/match-stats.test.ts` (header) |
| App Context | on | `app-context`, `use-cases` | preflight; `objects.test.ts` (the `before` hook fails with "does not have App Context"), `use-cases/real-time-chat.test.ts` |
| App Context events | user metadata, channel metadata and membership events on | `app-context`, `use-cases` | preflight; `objects.test.ts` (`setChannelMetadataBasicUsage` reads the channel event). The user and membership events are proven only by the preflight |
| App Context referential integrity | off | `app-context`, `use-cases` | preflight; `support/janitor.ts` (`cleanAppContext` removes memberships first because deleting a user or channel leaves them) |
| App Context disallow get all (user and channel metadata) | off | `app-context` | preflight; `objects.test.ts` (`getAllUUIDMetadata`, `getAllChannelMetadata`) |
| Files | on | `messaging` | preflight; `file-sharing.test.ts` (header) |
| Push Notifications add-on | on. No APNs or FCM credentials: the tests only register device tokens and list them | `messaging`, `use-cases` | `api-reference/mobile-push.test.ts` (header and `PUSH_OFF`), `use-cases/fan-re-engagement.test.ts`, `use-cases/score-alerts.test.ts`. The preflight does not check it, and the janitor treats a push 400, 403 or 404 as "not applicable" |
| Subscribe filter expressions (Stream Filtering) | usable with `setFilterExpression` and message `meta` | `getting-started` | `api-reference/configuration.test.ts` (`filterExpressionDropsMessage`). No config field is read, so the preflight does not check it |
| Encryption | no keyset setting (client side only) | `getting-started` | `api-reference/encryption.test.ts` (header), `encryption-legacy.test.ts` |
| Illuminate Business Rules | none. The tests publish the trigger messages themselves | `use-cases` | `use-cases/automated-polling.test.ts`, `real-time-ads.test.ts` (headers) |

### Pam keyset (docs tier)

| Feature or setting | Required value | Groups | Proof |
| :--- | :--- | :--- | :--- |
| Access Manager | on, with the secret key | `messaging`, `getting-started`, `use-cases`, `access-manager` | preflight; `publish.test.ts` (a client without a token must get 403), `getting-started/status-events.test.ts`, `troubleshooting.test.ts` (header), `use-cases/game-chat-moderation.test.ts` |
| No application-level grant | none left over. The janitor revokes it and waits until a tokenless client is refused (3 refusals in a row, up to 120 s) | all groups that list `pam` or `datasync` | `support/janitor.ts` (`revokeApplicationGrant`, `verifyApplicationGrantClosed`), `support/hooks.ts` |
| Access Manager token revocation | on | `access-manager`, `use-cases` | preflight (role `pam` only); `access-manager.test.ts` (`revokeTokenBasicUsage`), `use-cases/fan-behavior-management.test.ts` (`revokeToken`) |
| Access Manager v3 tokens | `grantToken`, `parseToken`, `revokeToken`, `authorizedUserId`, patterns | `access-manager` and others | `access-manager.test.ts`, `access-manager-legacy.test.ts` (header: only `grantToken` is called) |
| Access Manager v2 grant | the janitor calls `grant({ read: false, write: false, ttl: 1 })`. The v2 grant call must stay allowed | all groups that list `pam` or `datasync` | `support/janitor.ts`. No test calls `grant` or uses an `authKey` for a live request |
| Message Persistence | on | `use-cases` | preflight; `use-cases/game-chat-moderation.test.ts` (header) |
| Delete-From-History | on | `use-cases` | `use-cases/game-chat-moderation.test.ts` (header). The preflight does not check it for this role |
| Presence | on | `getting-started`, `use-cases` | preflight only. No pam test reads presence |

### Datasync keyset (docs tier)

| Feature or setting | Required value | Groups | Proof |
| :--- | :--- | :--- | :--- |
| DataSync | on. The built-in classes `User` v1 (global), `Channel` v1 (global) and `Membership` v1 exist | `datasync`, `access-manager` | preflight; `provision/provision-datasync.ts` (`expectedBuiltIns`) |
| Access Manager | on, with the secret key | `datasync`, `access-manager` | preflight; `access-manager.test.ts` (`grantTokenDataSyncResources`, `grantTokenWithProjection` sign on `server('datasync')`) |
| Message Persistence | on | `datasync`, `access-manager` | preflight only |
| Presence | on | `datasync`, `access-manager` | preflight only |
| Classes, projections, event rules | see "DataSync classes, projections and event rules" | `datasync`, `access-manager` | `api-reference/datasync.test.ts` (header and `preconditions`) |

### SDK open keyset (endpoint tier, `endpoints-history`)

| Feature or setting | Required value | Proof |
| :--- | :--- | :--- |
| Message Persistence | on | `endpoints/history.test.ts`, `fetch_messages.test.ts`, `message_actions.test.ts` (headers) |
| Message actions | on, including the events of add and remove | `endpoints/message_actions.test.ts` (`should trigger event`) |
| Access Manager | off. The clients carry no token | `endpoints/*.test.ts` use `createClient('open', ...)` without a token |
| Everything else | not needed. Presence, Files, App Context, Stream Controller, Delete-From-History and Push are not used | no test in `endpoints/` calls them |

The preflight and the janitor are off in this tier (`.mocharc.endpoints.cjs`), so nothing checks the keyset up front. A missing feature shows as a failing test.

### SDK datasync keyset (endpoint tier, `endpoints-datasync`)

| Feature or setting | Required value | Proof |
| :--- | :--- | :--- |
| DataSync | on, with the classes of the endpoint tests (see below) | `support/datasync-live-helpers.ts`, `endpoints/data_sync/*.test.ts` |
| Access Manager | on, with the secret key (the projection tests call `grantToken`) | `endpoints/data_sync/projections.test.ts` |
| Event rules | on for every class listed below | `endpoints/data_sync/events.*.test.ts`, `projections.test.ts` |
| Other features | none proven (Presence and Message Persistence are not used) | no test in `endpoints/data_sync/` calls them |

### Groups, roles and the setting behind a failure

| Group | Tier | Roles (`groups.cjs`) | Settings that make it fail when missing |
| :--- | :--- | :--- | :--- |
| `messaging` | docs | open, pam | open: Presence, Message Persistence, Delete-From-History, message actions, Stream Controller (channel groups), Files, Push add-on. pam: Access Manager on, no leftover grant |
| `getting-started` | docs | open, pam | open: Presence (v11 guide), Message Persistence (legacy configuration), filter expressions. pam: Access Manager on |
| `use-cases` | docs | open, pam | open: Presence, Message Persistence, App Context and its events, wildcard subscribe, Push add-on. pam: Access Manager with token revocation, Message Persistence, Delete-From-History |
| `access-manager` | docs | open, pam, datasync | pam: Access Manager with token revocation. datasync: Access Manager and DataSync (token grants only, no DataSync object is created). The group runs `provision:check` first |
| `app-context` | docs | open, pam | open: App Context, the three event switches, referential integrity off, disallow get all off. `objects.test.ts` builds no pam client, but `groups.cjs` lists the role, so the run needs the `PAM_*` keys |
| `datasync` | docs | open, datasync | datasync: DataSync, the classes `product` and `ProductOwner`, the event rules and the `admin` projection of `product`. `datasync.test.ts` builds no open client, but the docs tier needs the open keys anyway. The group runs `provision:check` first |
| `endpoints-datasync` | endpoints | datasync | SDK datasync keyset: classes `JSCustomer`, `JSLoanQuote`, `JSREQUESTED_BY`, event rules, `admin` projection |
| `endpoints-history` | endpoints | open | SDK open keyset: Message Persistence, message actions |

### DataSync classes, projections and event rules

Provisioning creates only what `provision/datasync-classes.json` lists, on the docs datasync keyset. The Admin Portal holds the rest.

| Class | Kind | Version | Fields (property, type, filtering, nullable) | Projections | Created by |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `User` | built-in entity, level `Global` | 1 | none declared by this tier | `__default__` | PubNub, when DataSync is on |
| `Channel` | built-in entity, level `Global` | 1 | none declared by this tier | `__default__` | PubNub, when DataSync is on |
| `Membership` | built-in relationship | 1 | none (the class cannot be extended, `datasync.test.ts`) | `__default__` | PubNub, when DataSync is on |
| `product` | entity | 1 | `name` string full nullable; `price` number simple not nullable; `stock` number simple nullable. Class `ttlSec` 2678400 | `name` and `price`: `__default__`, `public`, `admin`; `stock`: `__default__`, `admin` | `npm run test:integration:live:provision` |
| `ProductOwner` | relationship | 1 | many-to-many, entity B class `product`, entity A any class; `tier` string full nullable | `tier`: `__default__`, `public`, `admin` | `npm run test:integration:live:provision` |

Facts for provisioning (`provision/provision-datasync.ts`):

- It never deletes a class. It fails on a relationship class whose cardinality or entity sides differ, because those fields are immutable. Only a person may delete and recreate it.
- It replaces mutable fields of a class that drifted (PUT) and creates a missing class (POST). `--check` writes nothing and exits with 1 on any difference.
- It reads only classes it lists. It never touches the `JS*` classes.
- The per-class event switch ("Select entities to sync") has no Admin API endpoint. You set it by hand in the Admin Portal, DataSync tab.

Event rules to switch on by hand in the Admin Portal:

| Keyset | Event rule (class and version) | Needed by |
| :--- | :--- | :--- |
| docs datasync | `User` v1, `Channel` v1, `product` v1 | `api-reference/datasync.test.ts` (header and the `events and subscriptions` block). A kind without a rule fails the test that waits for its event |
| docs datasync | `ProductOwner` v1, `Membership` v1 | the comment in `provision/datasync-classes.json` lists them. No test in `datasync.test.ts` waits for their events |
| SDK datasync | `User` v1, `Channel` v1, `Membership` v1, `JSCustomer` v1, `JSREQUESTED_BY` v1 | `events.user`, `events.channel`, `events.membership`, `events.entity`, `events.relationship` tests |
| SDK datasync | `JSLoanQuote` v1 | `projections.test.ts`: the flag `LOAN_QUOTE_AND_RELATIONSHIP_EVENTS_ENABLED` is `true`, so the mirror channel events of `JSLoanQuote` and `JSREQUESTED_BY` are asserted |

The classes of the endpoint tier are not in `datasync-classes.json`, and no script creates them. `support/datasync-live-helpers.ts` calls them "provisioned" (version 1). What the tests prove about them:

| Class | Kind | Fields the tests send and read | Projections the tests rely on |
| :--- | :--- | :--- | :--- |
| `JSCustomer` v1 | entity | `customerId`, `firstName`, `lastName`, `email`, `creditScore`, `city` | `__default__`: all six fields. `admin`: the same without `email`, plus `private` |
| `JSLoanQuote` v1 | entity | `quoteId`, `make`, `model`, `price` | `__default__`: all four. `admin`: `quoteId` and `private` |
| `JSREQUESTED_BY` v1 | relationship, from `JSCustomer` (entity A) to `JSLoanQuote` (entity B) | `linkedAt` | `__default__`: `linkedAt`. `admin`: `linkedAt` and `private` |

Source: `endpoints/data_sync/projections.test.ts` (header table and the field constants), `events.relationship.test.ts`, `support/datasync-live-helpers.ts`. The `private` field must exist in every class, and the `admin` projection must exist on all three. The tests assert that an unknown projection name is rejected, so `nosuchprojection` must not exist. Property types, filtering modes and cardinality of these three classes are not in the code (see "Not verified from code").

Projection names used by the docs tier (`api-reference/datasync.test.ts`, `access-manager.test.ts`): `admin` (the mirror channel `__admin__<id>`, for example `__admin__product.*`) and `public` (in a token that assigns it to `product-sneaker-42` and `product-.*`). Both are declared on `product` in `datasync-classes.json`.

### Admin API integration key

Both Admin API calls send the raw key in the `Authorization` header (no `Bearer`) and the header `PubNub-Version: 2026-09-17`. The base is `https://admin-api.pubnub.com`.

| Used by | Call | Permission it needs | Code |
| :--- | :--- | :--- | :--- |
| Preflight feature check (docs tier, role open, pam or datasync) | `GET /v2/keysets/{keysetId}` and `GET /v2/keysets/{keysetId}/config` | read access to the keyset configuration of each keyset you give an id for. The exact permission name is not verified from code | `support/preflight.ts` (`readFeatures`) |
| `provision:check` and `provision`, reads | `GET /v2/datasync/subkeys/{subscribeKey}/entity-classes` and `.../relationship-classes` | a DataSync permission row, keyset level, for the docs datasync keyset (the 403 hint says "Read & write") | `provision/provision-datasync.ts` |
| `provision` only, creates | `POST /v2/datasync/subkeys/{subscribeKey}/{entity-classes or relationship-classes}/{name}/versions/{version}` | DataSync, keyset level, write | same |
| `provision` only, updates | `PUT` on the same URL | DataSync, keyset level, write | same |

What the key does in CI:

- The step "Check the DataSync classes (read only)" and the step "Docs samples" get `PUBNUB_ADMIN_API_KEY` from the secret `SDK_DOCS_ADMIN_API_KEY`. The endpoint step and the cleanup step do not get it.
- `provision:check` runs only for groups with `provision: true`, which are the docs groups that list `datasync`: `access-manager` and `datasync`. It never writes. The CI key therefore needs only read access to DataSync. `provision` (writes) is a manual step and needs write access.
- The feature check needs a keyset id per role. The workflow sets only `DOCS_SNIPPETS_DS_KEYSET_ID`, from the repository variable `vars.SDK_DOCS_DS_KEYSET_ID`, on the job. `DOCS_SNIPPETS_OPEN_KEYSET_ID` and `DOCS_SNIPPETS_PAM_KEYSET_ID` are not wired in CI. So in CI the Admin API checks only the `datasync` role. The open and pam roles get no config check, and the open keyset gets only the live probes.
- The `datasync` role feature check also confirms that the keyset of that id holds the `DS_SUBSCRIBE_KEY` (`mismatch` otherwise).

Without the key or without an id:

- Preflight: the role is skipped with the note "Admin API feature check skipped". For the open role, the live probes still check publish, Message Persistence, Delete-From-History and Presence (`hereNow` must list a subscribed client). Nothing else is checked, so the run can fail later in a test.
- `provision:check` and `provision`: the script checks through the SDK, with the datasync keys, that `product` v1 and `ProductOwner` v1 exist, and it writes nothing. It does not diff fields and does not check the built-in classes. `provision` cannot create classes without the key.
- The tests themselves never use the Admin API key. The endpoint tier never uses it.

CI secrets and variables that feed the tier (`.github/workflows/live-integration.yml`):

| Where | Name | Becomes |
| :--- | :--- | :--- |
| secret | `SDK_DOCS_OPEN_SUBSCRIBE_KEY`, `SDK_DOCS_OPEN_PUBLISH_KEY` | `SUBSCRIBE_KEY`, `PUBLISH_KEY` |
| secret | `SDK_DOCS_PAM_SUBSCRIBE_KEY`, `SDK_DOCS_PAM_PUBLISH_KEY`, `SDK_DOCS_PAM_SECRET_KEY` | `PAM_SUBSCRIBE_KEY`, `PAM_PUBLISH_KEY`, `PAM_SECRET_KEY` |
| secret | `SDK_DOCS_DS_SUBSCRIBE_KEY`, `SDK_DOCS_DS_PUBLISH_KEY`, `SDK_DOCS_DS_SECRET_KEY` | `DS_SUBSCRIBE_KEY`, `DS_PUBLISH_KEY`, `DS_SECRET_KEY` (docs tier, janitor, `provision:check`) |
| secret | `SDK_DOCS_ADMIN_API_KEY` | `PUBNUB_ADMIN_API_KEY` (docs tier and `provision:check`) |
| variable | `SDK_DOCS_DS_KEYSET_ID` | `DOCS_SNIPPETS_DS_KEYSET_ID` (job level) |
| secret | `SDK_SUB_KEY`, `SDK_PUB_KEY` | `SUBSCRIBE_KEY`, `PUBLISH_KEY` (endpoint tier) |
| secret | `SDK_DS_SUB_KEY`, `SDK_DS_PUB_KEY`, `SDK_DS_SEC_KEY` | `DS_SUBSCRIBE_KEY`, `DS_PUBLISH_KEY`, `DS_SECRET_KEY` (endpoint tier) |

### Setup checklist

1. Create the keysets: one open keyset and one or two secured keysets for pam and datasync, plus the two SDK keysets (open and datasync) for the endpoint tier. Keep the open keysets free of Access Manager.
2. Open keysets: turn on Message Persistence and message actions on both (the SDK open keyset needs nothing else). For the docs open keyset, also turn on Delete-From-History, Presence with a tracking rule for `*`, Stream Controller with wildcard subscribe, App Context with the user, channel and membership events (referential integrity and "disallow get all" off), Files and the Push Notifications add-on.
3. Secured keysets: turn on Access Manager (with token revocation), Message Persistence, Delete-From-History (the pam role) and Presence. On the datasync keyset, turn on DataSync.
4. Create the Admin API integration key with the permissions in "Admin API integration key". Note the keyset id of the docs datasync keyset.
5. Copy `.env.example` to `.env.local` and fill the keys, `PUBNUB_ADMIN_API_KEY` and the `DOCS_SNIPPETS_*_KEYSET_ID` values (the file is read in memory and git ignores it). Add the CI secrets and the variable `SDK_DOCS_DS_KEYSET_ID`.
6. Run `npm run test:integration:live:provision` once on the docs datasync keyset to create `product` v1 and `ProductOwner` v1.
7. In the Admin Portal, DataSync tab, switch on the event rules in the table above. The three `JS*` classes must exist on the SDK datasync keyset with the `admin` projection and the `private` field. No script in this folder creates them.
8. Confirm the setup without changing state:
   - `npm run test:integration:live -- --dry-run` and `npm run test:integration:live:endpoints -- --dry-run` list the tests and need no keys.
   - `npm run test:integration:live:provision:check` diffs the classes and writes nothing.
   - The preflight has no command of its own. It runs in the `before all` hook of every docs-tier run, after the janitor. It reads the Admin API (read only) and sends a few probe requests to the open keyset (a publish, a history read, an empty-range delete and a presence subscribe). Those requests are the only traffic it adds. The janitor sends requests too (it deletes the listed resources), so start a real run only against keysets meant for the tier.

### Not verified from code

- The exact Admin API permission name and level for `GET /v2/keysets/{id}` and `/config`.
- Whether the CI key needs write access for `provision:check` (the code only reads), and whether a Read permission row is enough. The 403 hint names "Read & write".
- Message Persistence retention: the tests need messages to stay only for the length of a run, and the channel `history_documented_behavior` is refilled when it holds fewer than 100 messages. No minimum retention is in the code.
- Message actions: no config field is read, so the name of the portal switch is not known.
- Stream Filtering: whether it needs its own portal switch.
- Presence: announce max, interval mode, and any minimum or maximum for `presenceTimeout` and `heartbeatInterval` on the server. The client uses `presenceTimeout: 20` and `heartbeatInterval: 8`. The Presence rule pattern is the only server setting the code reads.
- File retention, Files region, App Context region, data region of any keyset, and the plan tier or rate limits. No code reads them.
- Push Notifications as a keyset setting: the code proves only the add-on is needed and not APNs or FCM credentials.
- Whether the pam and datasync keysets are one keyset in the CI secrets. The code supports both.
- Whether Message Persistence, Presence or Delete-From-History is needed on the secured keysets beyond the preflight list and the `game-chat-moderation` header.
- Whether the Membership and `ProductOwner` event rules are needed in the docs tier, and whether `User` and `Channel` need a named projection other than `__default__`.
- The schema of `JSCustomer`, `JSLoanQuote` and `JSREQUESTED_BY` beyond the field lists above (types, filtering modes, cardinality, class `ttlSec`), and who creates them.
- Whether `grantToken` with `dataSyncProjections` is validated against the class at grant time (the `public` projection comment says the class must declare it).
- Whether the application-level v2 grant call (used only by the janitor) can be disabled on a keyset.

## Offline checks: marker lint, coverage manifest, docs cross-check

Three scripts need no keys and no network. They answer one question: does every snippet that the public docs embed from this repository run against the real service in a test here, or is it on a listed exception with a reason?

```bash
npm run test:integration:live:lint                  # marker lint + manifest --check + groups --check + eslint of the tier
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
