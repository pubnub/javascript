# Access Manager

Trace [access endpoints](../../../../src/core/endpoints/access_manager), [token manager](../../../../src/core/components/token_manager.ts), and [transport middleware](../../../../src/transport/middleware.ts). Distinguish legacy grant/audit from token grant/revoke and token consumption on normal requests. Signing credentials, tokens, auth keys, resource permissions, and authorized user identity are different concepts.

Check permission serialization, TTL validation, signatures, error/status mapping, token precedence, and how auth changes affect subsequent subscribe/reconnect traffic. Do not introduce secret-key requirements into clients that only consume tokens; never put signing secrets in browser examples or diagnostics.

Tests: [unit access tests](../../../../test/unit/access_manager), [access integration](../../../../test/integration/endpoints/access.test.ts), [grant token](../../../../test/integration/endpoints/grant_token.test.ts), [token manager](../../../../test/integration/components/token_manager.test.ts), and [contract definitions](../../../../test/contract/definitions/grant.ts). Contract setup: [contract.md](../../sdk-test/contract.md).
