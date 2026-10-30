# Presence

Presence spans [REST endpoints](../../../../src/core/endpoints/presence), core state/heartbeat APIs, [legacy subscriptions](../../../../src/core/components/subscription-manager.ts), [presence engine](../../../../src/event-engine/presence), and [worker managers](../../../../src/transport/subscription-worker). Occupancy queries, presence event subscriptions, heartbeat participation, and leave requests are distinct behaviors.

Trace how channels/groups, presence timeout, heartbeat interval, state payloads, subscription changes, and disconnect/destroy affect traffic. In particular, offline cleanup and explicit unsubscribe need not produce the same leave behavior. Review [subscribe](subscribe.md) for shared ownership and worker coordination; a timing change can alter occupancy observed by other clients.

Tests: [presence units](../../../../test/unit/presence), [presence endpoint](../../../../test/integration/endpoints/presence.test.ts), [heartbeat](../../../../test/integration/operations/heartbeat.test.ts), [state setting](../../../../test/integration/operations/stateSetting.test.ts), [subscribe heartbeat](../../../../test/integration/endpoints/subscribe_heartbeat.test.ts), and [presence engine](../../../../test/unit/event_engine_presence.test.ts). Reuse [presence mock helpers](../../../../test/utils.ts) and ensure timers/clients are cleaned up.
