# Contract tests (cucumber)

Ask before starting: setup clones private repos over SSH and **deletes and replaces** its destination directories.

| Source | Local path (gitignored) | Command |
| --- | --- | --- |
| [sdk-specifications](https://github.com/pubnub/sdk-specifications) | `test/specs` | `npm run test:contract:prepare` (rm + shallow clone of `master`) |
| [service-contract-mock](https://github.com/pubnub/service-contract-mock) | `dist/contract` | `npm run contract:refresh` (rm + clone + npm install) |

1. Run `npm run test:contract:prepare`, then `npm run contract:refresh`.
2. Record the resolved commits in the report: `git -C test/specs rev-parse HEAD` and `git -C dist/contract rev-parse HEAD`.
3. Run `npm run build:node`.
4. Start the mock in the background and leave it running: `npm run contract:server`. It must own port 8090 exclusively.
   Another checkout using the same server will interfere.
5. Run the default access scenario with `.scripts/agent-test.sh contract`, or pick scenarios with
   `.scripts/agent-test.sh contract --tags '@featureSet=access and not @na=js and not @skip'`.
6. Stop the mock server when you're done.

- `test/contract/shared/hooks.ts` initializes the scenario state at `localhost:8090`.
- PAM helpers carry fixed fallback keys for the mock, so no real keys are needed.
- The older `contract:test*` scripts use a different compiled setup (`dist/cucumber`). Don't mix the two paths.
- Gherkin scenarios describe SDK behavior; they don't establish an OpenAPI schema.
