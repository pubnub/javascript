# Subscriptions

Trace [PubNubCore](../../../../src/core/pubnub-common.ts), [entities](../../../../src/entities), [EventDispatcher](../../../../src/core/components/event-dispatcher.ts), and the selected implementation. `enableEventEngine` (default `true`) selects [event engine](../../../../src/event-engine); otherwise [SubscriptionManager](../../../../src/core/components/subscription-manager.ts) uses reconnection and deduplication helpers.

Preserve channel/group ownership, subscribe cursors, reconnect behavior, message categorization, listener delivery, and unsubscribe cleanup. Entity subscriptions and subscription sets can share client subscriptions; removing one owner's listener/subscription must be assessed against others. Review both implementations rather than assuming behavior is identical.

Browser `subscriptionWorkerUrl` introduces [worker middleware and managers](../../../../src/transport/subscription-worker), which coordinate subscribe/heartbeat/leave across clients. Consult [presence](presence.md) whenever changing lifecycle or subscription state.

Tests: [subscribe endpoint](../../../../test/integration/endpoints/subscribe.test.ts), [legacy manager](../../../../test/integration/components/subscription_manager.test.ts), [event engine](../../../../test/unit/event_engine.test.ts), [unsubscribe](../../../../test/integration/operations/unsubscribe.test.ts), and [SharedWorker](../../../../test/integration/shared-worker/shared-worker.test.ts). The latter uses real demo-key traffic; see the [sdk-test](../../sdk-test/SKILL.md) skill.
