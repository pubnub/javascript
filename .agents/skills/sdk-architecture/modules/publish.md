# Publish and signal

Trace [PubNubCore](../../../../src/core/pubnub-common.ts) → [PublishRequest](../../../../src/core/endpoints/publish.ts) or [SignalRequest](../../../../src/core/endpoints/signal.ts) → [middleware](../../../../src/transport/middleware.ts) → platform transport. Preserve the distinction between GET URL payloads and POST bodies, encoding/serialization, encryption, history/TTL flags, metadata, custom message types, and string timetokens.

Read the supplied endpoint contract before changing accepted inputs: existing truthiness checks and documented payload types may disagree, and fixing that is an observable behavior change. Check callback and Promise delivery as well as request bytes.

Start with [unit publish tests](../../../../test/unit/publish/publish.test.ts), [integration publish tests](../../../../test/integration/endpoints/publish.test.ts), and [signal tests](../../../../test/integration/endpoints/signal.test.ts). Add boundary/error cases to the nearest suite; use mocked HTTP before considering live publish traffic.
