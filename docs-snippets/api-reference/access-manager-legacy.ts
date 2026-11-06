import assert from '../harness/assert.js';
import type PubNub from 'pubnub';
import { page, step, check } from '../harness/step.js';
import { rejectsValidation } from '../harness/assertions.js';
import { granted } from './access-manager.js';

/**
 * Access Manager token examples that use the deprecated `spaces`, `users` and `uuids` terms. The SDK maps them to the
 * current terms, so a `spaces` grant appears as `channels` in the parsed token.
 */
export default page('api-reference/access-manager-legacy', 'P8', (world) => {
  const secured = { keyset: 'pam' } as const;

  interface LegacyGrantClient {
    grantToken(parameters: PubNub.PAM.ObjectsGrantTokenParameters): Promise<string>;
    parseToken: PubNub['parseToken'];
  }
  const legacy = (): LegacyGrantClient => world.server as unknown as LegacyGrantClient;

  step('grantTokenSpacesBasicUsage', { ...secured, proves: 'A grant that uses the deprecated spaces scope returns a token whose parsed form lists the space under channels.' }, async () => {
    const pubnub = legacy();
    // snippet.grantTokenSpacesBasicUsage
    try {
        const token = await pubnub.grantToken({
            ttl: 15,
            authorizedUserId: "my-authorized-userId",
            resources: {
                spaces: {
                    "my-space": {
                        read: true,
                    },
                },
            },
        });
        // snippet.hide
        world.keep('token', token);
        // snippet.show
    } catch (status) {
        console.log(status);
    }
    // snippet.end
    const token = world.take<string>('token');
    const parsed = pubnub.parseToken(token);
    assert.equal(parsed?.authorized_uuid, world.n('my-authorized-userId'));
    assert.deepEqual(granted(parsed?.resources?.channels?.['my-space']), { read: true });
  });

  // Mixed `spaces` and `users` resources with different permission sets. Asserts one space and one user entry
  // in the parsed token (`users` keeps its name, `get` and `update` survive).
  step('grantTokenSpacesVariousResources', { ...secured, proves: 'A token with mixed spaces and users resources keeps one space entry and one user entry with their permissions.' }, async () => {
    const pubnub = legacy();
    // snippet.grantTokenSpacesVariousResources
    try {
        const token = await pubnub.grantToken({
            ttl: 15,
            authorizedUserId: "my-authorized-userId",
            resources: {
                spaces: {
                    "space-a": {
                        read: true,
                    },
                    "space-b": {
                        read: true,
                        write: true,
                    },
                    "space-c": {
                        read: true,
                        write: true,
                    },
                    "space-d": {
                        read: true,
                        write: true,
                    },
                },
                users: {
                    "userId-c": {
                        get: true,
                    },
                    "userId-d": {
                        get: true,
                        update: true,
                    },
                },
            },
        });
        // snippet.hide
        world.keep('token', token);
        // snippet.show
    } catch (status) {
        console.log(status);
    }
    // snippet.end
    const token = world.take<string>('token');
    const parsed = pubnub.parseToken(token);
    assert.deepEqual(granted(parsed?.resources?.channels?.['space-b']), { read: true, write: true });
    assert.deepEqual(granted(parsed?.resources?.users?.['userId-d']), { get: true, update: true });
  });

  // Pattern-only grant. The regular expression key must appear unchanged under `patterns.channels`.
  step('grantTokenSpacesRegEx', { ...secured, proves: 'A pattern-only grant with the deprecated spaces scope keeps the regular expression unchanged under patterns.channels.' }, async () => {
    const pubnub = legacy();
    // snippet.grantTokenSpacesRegEx
    try {
        const token = await pubnub.grantToken({
            ttl: 15,
            authorizedUserId: "my-authorized-userId",
            patterns: {
                spaces: {
                    "^space-[A-Za-z0-9]$": {
                        read: true,
                    },
                },
            },
        });
        // snippet.hide
        world.keep('token', token);
        // snippet.show
    } catch (status) {
        console.log(status);
    }
    // snippet.end
    const token = world.take<string>('token');
    const parsed = pubnub.parseToken(token);
    assert.deepEqual(granted(parsed?.patterns?.channels?.['^space-[A-Za-z0-9]$']), { read: true });
  });

  // Resources and patterns in one token. Checks both sections of the parsed token survive side by side.
  step('grantTokenSpacesRegExAndResources', { ...secured, proves: 'Resources and patterns in one deprecated-scope grant both survive in the parsed token.' }, async () => {
    const pubnub = legacy();
    // snippet.grantTokenSpacesRegExAndResources
    try {
        const token = await pubnub.grantToken({
            ttl: 15,
            authorizedUserId: "my-authorized-userId",
            resources: {
                spaces: {
                    "space-a": {
                        read: true,
                    },
                    "space-b": {
                        read: true,
                        write: true,
                    },
                    "space-c": {
                        read: true,
                        write: true,
                    },
                    "space-d": {
                        read: true,
                        write: true,
                    },
                },
                users: {
                    "userId-c": {
                        get: true,
                    },
                    "userId-d": {
                        get: true,
                        update: true,
                    },
                },
            },
            patterns: {
                spaces: {
                    "^space-[A-Za-z0-9]$": {
                        read: true
                    },
                },
            },
        });
        // snippet.hide
        world.keep('token', token);
        // snippet.show
    } catch (status) {
        console.log(status);
    }
    // snippet.end
    const token = world.take<string>('token');
    const parsed = pubnub.parseToken(token);
    assert.deepEqual(granted(parsed?.resources?.channels?.['space-a']), { read: true });
    assert.deepEqual(granted(parsed?.patterns?.channels?.['^space-[A-Za-z0-9]$']), { read: true });
  });

  check('accessManagerLegacyAuthorizedUuidAlias', { ...secured, proves: 'authorized_uuid and authorizedUserId produce the same token owner, and passing both is a validation error.' }, async () => {
    const server = world.server;
    const user = world.n('my-authorized-userId');
    const resources = { channels: { 'legacy-alias': { read: true } } };
    const viaAlias = await server.grantToken({ ttl: 15, authorized_uuid: user, resources });
    const viaCurrent = await server.grantToken({ ttl: 15, authorizedUserId: user, resources });
    assert.equal(server.parseToken(viaAlias)?.authorized_uuid, user);
    assert.equal(server.parseToken(viaCurrent)?.authorized_uuid, user);
    await rejectsValidation(
      server.grantToken({ ttl: 15, authorizedUserId: user, authorized_uuid: user, resources } as never),
      /Cannot mix `authorizedUserId` with `authorized_uuid`/,
    );
  });

  // The `uuids` scope is the old name of `users`. The parsed token keeps it under `uuids`, for resources and patterns.
  check('accessManagerLegacyUuidsScope', { ...secured, proves: 'The uuids scope is the old name of users and the parsed token keeps it under uuids for resources and patterns.' }, async () => {
    const server = world.server;
    const token = await server.grantToken({
      ttl: 15,
      authorizedUserId: world.n('my-authorized-userId'),
      resources: { uuids: { 'uuid-1': { get: true, update: true, delete: true } } },
      patterns: { uuids: { 'uuid-.*': { get: true } } },
    });
    const parsed = server.parseToken(token);
    assert.deepEqual(granted(parsed?.resources?.uuids?.['uuid-1']), { get: true, update: true, delete: true });
    assert.deepEqual(granted(parsed?.patterns?.uuids?.['uuid-.*']), { get: true });
  });

  // The SDK refuses to mix old and new scope names in one grant. These are client-side validation errors, so no
  // request leaves the process and the secured keyset sees no traffic.
  check('accessManagerLegacyMixingErrors', { ...secured, proves: 'Mixing old and new scope names in one grant is refused locally with a validation error and sends no request.' }, async () => {
    const server = world.server;
    const ttl = 15;
    // users and uuids: the check spans resources and patterns together.
    await rejectsValidation(
      server.grantToken({
        ttl,
        resources: { users: { a: { get: true } } },
        patterns: { uuids: { 'a.*': { get: true } } },
      }),
      /Cannot mix `users` with `uuids`/,
    );
    await rejectsValidation(
      server.grantToken({
        ttl,
        resources: { spaces: { a: { read: true } }, channels: { b: { read: true } } },
      } as never),
      /Cannot mix `spaces` with `channels`/,
    );
    await rejectsValidation(
      server.grantToken({
        ttl,
        resources: { spaces: { a: { read: true } }, uuids: { b: { get: true } } },
      } as never),
      /Cannot mix `spaces` with `uuids`/,
    );
  });
});
