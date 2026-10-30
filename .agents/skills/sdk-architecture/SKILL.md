---
name: sdk-architecture
description: Use before changing, debugging, refactoring or reviewing SDK source under src/. Covers the request pipeline, platform and build boundaries, and per-module invariants and tests for publish, subscribe, presence, event engine and access manager.
---

# SDK architecture

Load the module guide for the area you touch. For lifecycle changes, read subscribe and presence together.

| Module | Read when the change touches | Guide |
| --- | --- | --- |
| Publish / signal | payload encoding, GET vs POST, encryption, store/TTL flags | [publish](modules/publish.md) |
| Subscriptions | entities, listeners, cursors, reconnect, SharedWorker | [subscribe](modules/subscribe.md) |
| Presence | heartbeat, leave, state, occupancy | [presence](modules/presence.md) |
| Event engine | state transitions, effects, cancellation | [event-engine](modules/event-engine.md) |
| Access Manager | grant/revoke, tokens, signatures | [access-manager](modules/access-manager.md) |

## Request pipeline
`PubNubCore.sendRequest` (`src/core/pubnub-common.ts`) → an `AbstractRequest` subclass in `src/core/endpoints/`, which owns
validation, the operation identifier, path/query/body and response parsing → `PubNubMiddleware`
(`src/transport/middleware.ts`) → the platform transport.
- `sendRequest` owns validation, operation timeouts, status conversion and callback/Promise delivery.
- Middleware adds `instanceid`/`requestid`/`pnsdk`, auth key or token, signatures, and **request retries**
  (`retryConfiguration`). Auth is skipped for `/v2/auth`, `/v3/pam` and `/time`; signing is skipped for `/time`.
- Copy a neighboring endpoint (`publish.ts`, `time.ts`) rather than inventing a new pipeline.
- Grouped APIs use facades: `pubnub-objects.ts`, `pubnub-data-sync.ts`, `pubnub-channel-groups.ts`, `pubnub-push.ts`.
- Public types live both in endpoint modules and in `src/core/types/api/`. Follow the actual export chain into
  `lib/types/index.d.ts`, which `build:node-types` aggregates under the `PubNub` namespace.

## Subscriptions
- `enableEventEngine` defaults to `true` (`src/event-engine/`). With `false`, the legacy `SubscriptionManager` runs
  with the reconnection and deduplication managers. Both paths emit through `EventDispatcher`.
- Entities (`src/entities/`) and subscription sets can share one client subscription, so removing one owner must not
  break another.
- In browsers, `subscriptionWorkerUrl` routes subscribe, heartbeat and leave through the SharedWorker
  (`src/transport/subscription-worker/`), which is shared across tabs and clients.

## Build boundaries
| Config | Compiles | Excludes |
| --- | --- | --- |
| `tsconfig.json` (`build:node`, `typecheck`) | core, node, react_native | web, worker, titanium, nativescript |
| `tsconfig.rollup.json` (`build:web`) | web + worker bundles | node, react_native, titanium, nativescript |

- `process.env.*_MODULE` flags are replaced by `replaceConfiguration` (`rollup.config.js`) in **web bundles only**.
  Worker bundles skip it, and the Node build evaluates the flags at runtime. A new flag needs an entry there; check the
  build with the module both enabled and disabled.
- Node checks can't prove browser behavior. A browser-affecting change needs `build:web` plus the web suites.
