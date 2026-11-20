# Event engine

The [core engine](../../../../src/event-engine/core/engine.ts) processes transitions with context and queued events. [State definitions](../../../../src/event-engine/states) define subscribe states (handshaking, receiving, handshake_failed, receive_failed, handshake_stopped, receive_stopped, unsubscribed); [presence states](../../../../src/event-engine/presence) handle heartbeat/leave. [Dispatchers](../../../../src/event-engine/core/dispatcher.ts) execute managed effects and cancel them by invocation type. Core injects service calls, delays, and emitters.

For a bug, capture initial state/context → incoming event → transition → effects → emitted status/message. Compare expected and actual traces. Review cancellation of obsolete requests/delays, retry termination (request retries live in src/transport/middleware.ts, not in states), retained cursors/channel sets, and disposal. Do not fix a state symptom without following the triggering API and effect callback.

Use [event-engine tests](../../../../test/unit/event_engine.test.ts) and [presence-engine tests](../../../../test/unit/event_engine_presence.test.ts); despite their unit location, they exercise mocked HTTP flows. Add coverage for the failing transition and relevant interrupted/recovery path. Compare [legacy subscriptions](subscribe.md) when a public behavior must stay consistent.
