# Writing SDK tests

Start from the nearest existing test for the endpoint or component and keep its Chai/Sinon/Nock style. Test
customer-visible behavior, not implementation details.

| Change | Cover |
| --- | --- |
| REST feature/fix | validation boundaries, encoded path/query/body, response/error mapping, callback and Promise forms |
| Subscribe/presence | legacy and event-engine paths, channel/group ownership, status/message order, reconnect/cancel, heartbeat/leave, cleanup |
| Public typings | declaration aggregation (`release` suite), overload assignability |
| Bug | minimal failing reproduction plus adjacent behavior the fix could affect |

**Helpers** (`test/utils.ts`):
- `createNock()` matches `ps*.pndsn.com`.
- `createSubscribeMockScopes` and `createPresenceMockScopes` build subscribe and presence mocks.

Use these helpers instead of copying protocol fixtures. Assert that the expected interceptors were consumed.

**Client setup and teardown:**
- Tests unrelated to retries set `retryConfiguration: PubNub.NoneRetryPolicy()`. Otherwise a mocked 5xx keeps retrying
  past mocha's 5 s timeout.
- Retry tests must set the retry policy they exercise explicitly.
- Tear down with `pubnub.destroy(true)` to avoid leave traffic, unless leave behavior is under test.
- Restore fake timers and stubs, remove listeners, and destroy clients even when assertions fail (use `afterEach`).

**Determinism:**
- Prefer deterministic completion signals or fake timers over sleeps.
- Timetokens exceed safe-integer precision; keep them as strings.
- Never add a live-service dependency to a mocked test, or use a real key to stand in for a missing nock mock.
- Don't add mocha parallel mode.
