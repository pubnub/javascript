import assert from 'node:assert/strict';
import type PubNub from 'pubnub';
import { rejectsValidation } from '../support/assertions';
import { server } from '../support/clients';
import { granted } from '../support/access-manager';

/**
 * Access Manager token examples that use the deprecated `spaces`, `users` and `uuids` terms. The SDK maps them to the
 * current terms, so a `spaces` grant appears as `channels` in the parsed token.
 * Port of docs-snippets/api-reference/access-manager-legacy.ts. Only `grantToken` is called (no application-level grant),
 * so no cleanup hook is needed. Tokens expire by themselves (ttl 15).
 */
describe('api-reference/access-manager-legacy', () => {
  interface LegacyGrantClient {
    grantToken(parameters: PubNub.PAM.ObjectsGrantTokenParameters): Promise<string>;
    parseToken: PubNub['parseToken'];
  }
  const legacy = (): LegacyGrantClient => server() as unknown as LegacyGrantClient;

  it('grantTokenSpacesBasicUsage: a grant that uses the deprecated spaces scope returns a token whose parsed form lists the space under channels', async () => {
    const pubnub = legacy();
    let tokenOut = '';
    // prettier-ignore
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
        tokenOut = token;
        // snippet.show
    } catch (status) {
        console.log(status);
    }
    // snippet.end
    // The sample swallows errors with its catch, so an empty token means the grant failed.
    assert.ok(tokenOut, 'the grant returned a token');
    const parsed = pubnub.parseToken(tokenOut);
    assert.equal(parsed?.authorized_uuid, 'my-authorized-userId');
    assert.deepEqual(granted(parsed?.resources?.channels?.['my-space']), { read: true });
  });

  it('grantTokenSpacesVariousResources: a token with mixed spaces and users resources keeps one space entry and one user entry with their permissions', async () => {
    const pubnub = legacy();
    let tokenOut = '';
    // prettier-ignore
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
        tokenOut = token;
        // snippet.show
    } catch (status) {
        console.log(status);
    }
    // snippet.end
    // The sample swallows errors with its catch, so an empty token means the grant failed.
    assert.ok(tokenOut, 'the grant returned a token');
    const parsed = pubnub.parseToken(tokenOut);
    assert.deepEqual(granted(parsed?.resources?.channels?.['space-b']), { read: true, write: true });
    assert.deepEqual(granted(parsed?.resources?.users?.['userId-d']), { get: true, update: true });
  });

  it('grantTokenSpacesRegEx: a pattern-only grant with the deprecated spaces scope keeps the regular expression unchanged under patterns.channels', async () => {
    const pubnub = legacy();
    let tokenOut = '';
    // prettier-ignore
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
        tokenOut = token;
        // snippet.show
    } catch (status) {
        console.log(status);
    }
    // snippet.end
    // The sample swallows errors with its catch, so an empty token means the grant failed.
    assert.ok(tokenOut, 'the grant returned a token');
    const parsed = pubnub.parseToken(tokenOut);
    assert.deepEqual(granted(parsed?.patterns?.channels?.['^space-[A-Za-z0-9]$']), { read: true });
  });

  it('grantTokenSpacesRegExAndResources: resources and patterns in one deprecated-scope grant both survive in the parsed token', async () => {
    const pubnub = legacy();
    let tokenOut = '';
    // prettier-ignore
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
        tokenOut = token;
        // snippet.show
    } catch (status) {
        console.log(status);
    }
    // snippet.end
    // The sample swallows errors with its catch, so an empty token means the grant failed.
    assert.ok(tokenOut, 'the grant returned a token');
    const parsed = pubnub.parseToken(tokenOut);
    assert.deepEqual(granted(parsed?.resources?.channels?.['space-a']), { read: true });
    assert.deepEqual(granted(parsed?.patterns?.channels?.['^space-[A-Za-z0-9]$']), { read: true });
  });

  it('accessManagerLegacyAuthorizedUuidAlias: authorized_uuid and authorizedUserId produce the same token owner, and passing both is a validation error', async () => {
    const staff = server();
    const user = 'my-authorized-userId';
    const resources = { channels: { 'legacy-alias': { read: true } } };
    const viaAlias = await staff.grantToken({ ttl: 15, authorized_uuid: user, resources });
    const viaCurrent = await staff.grantToken({ ttl: 15, authorizedUserId: user, resources });
    assert.equal(staff.parseToken(viaAlias)?.authorized_uuid, user);
    assert.equal(staff.parseToken(viaCurrent)?.authorized_uuid, user);
    await rejectsValidation(
      staff.grantToken({ ttl: 15, authorizedUserId: user, authorized_uuid: user, resources } as never),
      /Cannot mix `authorizedUserId` with `authorized_uuid`/,
    );
  });

  // The `uuids` scope is the old name of `users`. The parsed token keeps it under `uuids`, for resources and patterns.
  it('accessManagerLegacyUuidsScope: the uuids scope is the old name of users and the parsed token keeps it under uuids for resources and patterns', async () => {
    const staff = server();
    const token = await staff.grantToken({
      ttl: 15,
      authorizedUserId: 'my-authorized-userId',
      resources: { uuids: { 'uuid-1': { get: true, update: true, delete: true } } },
      patterns: { uuids: { 'uuid-.*': { get: true } } },
    });
    const parsed = staff.parseToken(token);
    assert.deepEqual(granted(parsed?.resources?.uuids?.['uuid-1']), { get: true, update: true, delete: true });
    assert.deepEqual(granted(parsed?.patterns?.uuids?.['uuid-.*']), { get: true });
  });

  // The SDK refuses to mix old and new scope names in one grant. These are client-side validation errors, so no
  // request leaves the process and the secured keyset sees no traffic.
  it('accessManagerLegacyMixingErrors: mixing old and new scope names in one grant is refused locally with a validation error', async () => {
    const staff = server();
    const ttl = 15;
    // users and uuids: the check spans resources and patterns together.
    await rejectsValidation(
      staff.grantToken({
        ttl,
        resources: { users: { a: { get: true } } },
        patterns: { uuids: { 'a.*': { get: true } } },
      }),
      /Cannot mix `users` with `uuids`/,
    );
    await rejectsValidation(
      staff.grantToken({
        ttl,
        resources: { spaces: { a: { read: true } }, channels: { b: { read: true } } },
      } as never),
      /Cannot mix `spaces` with `channels`/,
    );
    await rejectsValidation(
      staff.grantToken({
        ttl,
        resources: { spaces: { a: { read: true } }, uuids: { b: { get: true } } },
      } as never),
      /Cannot mix `spaces` with `uuids`/,
    );
  });
});
