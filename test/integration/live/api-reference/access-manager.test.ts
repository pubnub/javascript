import assert from 'node:assert/strict';
import type PubNub from 'pubnub';
import { assertTimetoken, rejectsValidation, rejectsWithCategory } from '../support/assertions';
import { captureConsole } from '../support/console';
import { createClient, server, shopper } from '../support/clients';
import { withPlaceholders } from '../support/placeholders';
import { granted } from '../support/access-manager';
import { connected, eventually } from '../support/wait';

/**
 * Access Manager v3 token examples. The `grantToken` calls run on a server that holds the secret key (pam keyset).
 *
 * Tokens are bound to a user id and a resource, never to an application-wide grant, so nothing here opens the keyset for
 * strangers and no cleanup hook is needed. The only residue is tokens that expire by themselves (ttl 15 minutes) and the
 * revoked token of the revoke test, which stays on the service's revoke list until it would have expired.
 *
 * Samples with a placeholder literal ('use-token-string-generated-by-grantToken()', the token to revoke) run unchanged:
 * the test passes the sample a client wrapper (`withPlaceholders`) that swaps the literal for the live token.
 */
describe('api-reference/access-manager', () => {
  const room = 'am_room';
  const other = 'am_other';
  const GRANTED = 'use-token-string-generated-by-grantToken()';
  let aliceToken = '';
  let bobToken = '';

  /** Publishes to a channel and resolves with the timetoken. */
  const publishTo = async (client: PubNub, channel: string): Promise<string> => {
    const response = await client.publish({ channel, message: { text: 'am-check' } });
    return response.timetoken;
  };

  before(async function () {
    this.timeout(60_000);
    // Alice gets read and write on the room, Bob read only.
    const staff = server();
    aliceToken = await staff.grantToken({
      ttl: 15,
      authorizedUserId: 'user-alice',
      resources: { channels: { [room]: { read: true, write: true } } },
    });
    bobToken = await staff.grantToken({
      ttl: 15,
      authorizedUserId: 'user-bob',
      resources: { channels: { [room]: { read: true } } },
    });
  });

  it('accessManagerTokenFixture: Alice and Bob tokens give Bob read only access: publish is denied, subscribe connects', async function () {
    this.timeout(60_000);
    const bob = createClient('pam', 'user-bob');
    bob.setToken(bobToken);
    assert.equal(bob.getToken(), bobToken);
    // Bob holds a read-only token: he can subscribe to the room but not publish to it.
    await rejectsWithCategory(bob.publish({ channel: room, message: 'x' }), 'PNAccessDeniedCategory');
    const subscription = bob.channel(room).subscription();
    const ready = connected(bob, { channels: [room] });
    subscription.subscribe();
    await ready;
    subscription.unsubscribe();
    // Alice with write access can publish.
    const alice = createClient('pam', 'user-alice');
    alice.setToken(aliceToken);
    assertTimetoken(await publishTo(alice, room));
  });

  it('accessManagerBasicUsage: grantToken returns a token whose parsed form carries the user id, channel permissions and ttl that were asked for', async () => {
    const pubnub = server();
    // The sample prints the granted token. Keep it out of the test output.
    const logs = captureConsole('log');
    // snippet.accessManagerBasicUsage
    // Function to use grantToken method
    const token = await pubnub.grantToken({
      ttl: 15,
      authorizedUserId: 'my-authorized-uuid',
      resources: {
        channels: {
          'my-channel': {
            read: true,
            write: true,
          },
        },
      },
    });
    console.log('Granted Token:', token);
    // snippet.end
    logs.restore();
    const parsed = pubnub.parseToken(token);
    assert.equal(parsed?.authorized_uuid, 'my-authorized-uuid');
    assert.deepEqual(granted(parsed?.resources?.channels?.['my-channel']), { read: true, write: true });
    assert.equal(parsed?.ttl, 15);
  });

  it('revokeTokenBasicUsage: revokeToken makes a working token stop working, for the client that was allowed before and for fresh clients with the same token', async function () {
    // The docs say a revoke can take up to one minute, because the non-revoked state is cached for that long.
    this.timeout(300_000);
    // Fixture: a user with a working token, so the effect of the revoke is visible.
    const staff = server();
    const revokee = createClient('pam', 'am-revokee');
    const token = await staff.grantToken({
      ttl: 15,
      authorizedUserId: 'am-revokee',
      resources: { channels: { [other]: { read: true, write: true } } },
    });
    revokee.setToken(token);
    assertTimetoken(await publishTo(revokee, other));

    const pubnub = withPlaceholders(server(), {
      p0AkFl043rhDdHRsple3KgQ3NwY6BDcENnctokenVzcqBDczaWdYIGOAeTyWGJI: token,
    });
    // snippet.revokeTokenBasicUsage
    const response = await pubnub.revokeToken('p0AkFl043rhDdHRsple3KgQ3NwY6BDcENnctokenVzcqBDczaWdYIGOAeTyWGJI');
    // snippet.end
    assert.deepEqual(response, {}, 'revokeToken resolves with an empty object');
    await eventually(() => rejectsWithCategory(publishTo(revokee, other), 'PNAccessDeniedCategory'), {
      timeout: 100_000,
      interval: 2_000,
      label: 'revoked token is rejected',
    });
    for (const attempt of [1, 2]) {
      const fresh = createClient('pam', 'am-revokee');
      fresh.setToken(token);
      await eventually(() => rejectsWithCategory(publishTo(fresh, other), 'PNAccessDeniedCategory'), {
        timeout: 60_000,
        interval: 2_000,
        label: `revoked token is rejected for fresh client ${attempt}`,
      });
    }
  });

  it('parseTokenBasicUsage: parseToken decodes a token locally, and the fixture token shows the right owner and permissions', () => {
    const pubnub = withPlaceholders(server(), { [GRANTED]: aliceToken });
    // snippet.parseTokenBasicUsage
    pubnub.parseToken('use-token-string-generated-by-grantToken()');
    // snippet.end
    const parsed = pubnub.parseToken(aliceToken);
    assert.equal(parsed?.authorized_uuid, 'user-alice');
    assert.deepEqual(granted(parsed?.resources?.channels?.[room]), { read: true, write: true });
  });

  it('setTokenBasicUsage: setToken lets Alice publish to her room but not to another, while Bob stays read only', async function () {
    this.timeout(60_000);
    const pubnub = withPlaceholders(createClient('pam', 'user-alice'), { [GRANTED]: aliceToken });
    // Without a token the secured keyset refuses Alice.
    pubnub.setToken(undefined);
    await rejectsWithCategory(publishTo(pubnub, room), 'PNAccessDeniedCategory');
    // snippet.setTokenBasicUsage
    pubnub.setToken('use-token-string-generated-by-grantToken()');
    // snippet.end
    assert.equal(pubnub.getToken(), aliceToken);
    assertTimetoken(await publishTo(pubnub, room));
    // The token names one room only.
    await rejectsWithCategory(publishTo(pubnub, other), 'PNAccessDeniedCategory');
    // Bob (read only) still cannot publish.
    const bob = createClient('pam', 'user-bob');
    bob.setToken(bobToken);
    await rejectsWithCategory(publishTo(bob, room), 'PNAccessDeniedCategory');
  });

  // Channels, groups and uuids in one token. Property keys are not suffixed, so the parsed token is read with the plain keys.
  it('grantTokenVariousResources: a token with channels, groups and uuids keeps each resource with its permissions in the parsed form', async () => {
    const pubnub = server();
    // snippet.grantTokenVariousResources
    const token = await pubnub.grantToken({
      ttl: 15,
      authorizedUserId: 'my-authorized-uuid',
      resources: {
        channels: {
          'channel-a': {
            read: true,
          },
          'channel-b': {
            read: true,
            write: true,
          },
          'channel-c': {
            read: true,
            write: true,
          },
          'channel-d': {
            read: true,
            write: true,
          },
        },
        groups: {
          'channel-group-b': {
            read: true,
          },
        },
        uuids: {
          'uuid-c': {
            get: true,
          },
          'uuid-d': {
            get: true,
            update: true,
          },
        },
      },
    });
    // snippet.end
    const parsed = pubnub.parseToken(token);
    assert.deepEqual(granted(parsed?.resources?.channels?.['channel-a']), { read: true });
    assert.deepEqual(granted(parsed?.resources?.channels?.['channel-d']), { read: true, write: true });
    assert.deepEqual(granted(parsed?.resources?.groups?.['channel-group-b']), { read: true });
    assert.deepEqual(granted(parsed?.resources?.uuids?.['uuid-d']), { get: true, update: true });
  });

  // Pattern-only token: the regular expression key must survive unchanged in `patterns.channels`.
  it('grantTokenUsingRegEx: a pattern-only token keeps the regular expression unchanged under patterns.channels', async () => {
    const pubnub = server();
    // snippet.grantTokenUsingRegEx
    const token = await pubnub.grantToken({
      ttl: 15,
      authorizedUserId: 'my-authorized-uuid',
      patterns: {
        channels: {
          '^channel-[A-Za-z0-9]$': {
            read: true,
          },
        },
      },
    });
    // snippet.end
    const parsed = pubnub.parseToken(token);
    assert.deepEqual(granted(parsed?.patterns?.channels?.['^channel-[A-Za-z0-9]$']), { read: true });
  });

  // Resources and patterns together, both read back from the parsed token.
  it('grantTokenRegExAndResources: a token with resources and patterns returns both sections when parsed', async () => {
    const pubnub = server();
    // snippet.grantTokenRegExAndResources
    const token = await pubnub.grantToken({
      ttl: 15,
      authorizedUserId: 'my-authorized-uuid',
      resources: {
        channels: {
          'channel-a': {
            read: true,
          },
          'channel-b': {
            read: true,
            write: true,
          },
          'channel-c': {
            read: true,
            write: true,
          },
          'channel-d': {
            read: true,
            write: true,
          },
        },
        groups: {
          'channel-group-b': {
            read: true,
          },
        },
        uuids: {
          'uuid-c': {
            get: true,
          },
          'uuid-d': {
            get: true,
            update: true,
          },
        },
      },
      patterns: {
        channels: {
          '^channel-[A-Za-z0-9]$': {
            read: true,
          },
        },
      },
    });
    // snippet.end
    const parsed = pubnub.parseToken(token);
    assert.deepEqual(granted(parsed?.resources?.channels?.['channel-b']), { read: true, write: true });
    assert.deepEqual(granted(parsed?.patterns?.channels?.['^channel-[A-Za-z0-9]$']), { read: true });
  });

  // Category permissions (`get` on all channel metadata and all uuid metadata).
  it('grantTokenWithCategories: a category token carries get on all channel metadata and all uuid metadata', async () => {
    const pubnub = server();
    // The sample prints the granted token. Keep it out of the test output.
    const logs = captureConsole('log');
    // snippet.grantTokenWithCategories
    // Grants `my-authorized-uuid` permission to list all channel metadata and all uuid metadata.
    // Category permissions support only the `get` operation.
    const token = await pubnub.grantToken({
      ttl: 15,
      authorizedUserId: 'my-authorized-uuid',
      categories: {
        channels: { get: true },
        uuids: { get: true },
      },
    });
    console.log('Granted token:', token);
    // snippet.end
    logs.restore();
    const parsed = pubnub.parseToken(token);
    assert.equal(parsed?.categories?.channels?.get, true);
    assert.equal(parsed?.categories?.uuids?.get, true);
  });

  it('parseTokenWithCategories: parseToken reads the category permissions of a category token', async () => {
    const staff = server();
    const categoryToken = await staff.grantToken({
      ttl: 15,
      authorizedUserId: 'my-authorized-uuid',
      categories: { channels: { get: true }, uuids: { get: true } },
    });
    const pubnub = withPlaceholders(server(), { [GRANTED]: categoryToken });
    // The sample logs the result and does not return it, so read it back from the console output.
    const logs = captureConsole('log');
    try {
      // snippet.parseTokenWithCategories
      // Decodes a token that was granted with category permissions.
      const parsedToken = pubnub.parseToken('use-token-string-generated-by-grantToken()');

      console.log('Can list all channel metadata:', parsedToken?.categories?.channels?.get);
      console.log('Can list all uuid metadata:', parsedToken?.categories?.uuids?.get);
      // snippet.end
    } finally {
      logs.restore();
    }
    assert.deepEqual(logs.lines, ['Can list all channel metadata: true', 'Can list all uuid metadata: true']);
  });

  it('grantTokenDataSyncResources: a token can carry DataSync entity scopes and the top-level users scope, and parseToken returns them', async () => {
    const pubnub = server('datasync');
    // The sample prints the granted token. Keep it out of the test output.
    const logs = captureConsole('log');
    // snippet.grantTokenDataSyncResources
    // Grants `user-alice`:
    // - Get access to the entity `product-sneaker-42`, and to all entities matching the
    //   `product-.*` RegEx pattern.
    // - Get access to the DataSync user `user-bob` through the top-level `users` scope, because
    //   DataSync users are not permissioned under `dataSync`.
    const token = await pubnub.grantToken({
      ttl: 15,
      authorizedUserId: 'user-alice',
      resources: {
        users: {
          'user-bob': {
            get: true,
          },
        },
        dataSync: {
          entities: {
            'product-sneaker-42': {
              get: true,
            },
          },
        },
      },
      patterns: {
        dataSync: {
          entities: {
            'product-.*': {
              get: true,
            },
          },
        },
      },
    });
    console.log('Granted Token:', token);
    // snippet.end
    logs.restore();
    const parsed = pubnub.parseToken(token);
    assert.equal(parsed?.authorized_uuid, 'user-alice');
    assert.ok(parsed?.resources, 'the token carries resources');
  });

  it('grantTokenWithProjection: a token with dataSyncProjections is created and parsed, and carries the projection assignment of the entity', async () => {
    const pubnub = server('datasync');
    // The sample prints the granted token. Keep it out of the test output.
    const logs = captureConsole('log');
    // snippet.grantTokenWithProjection
    // Grants `user-alice` the same access as above and assigns the `public` projection to the entity
    // `product-sneaker-42` and to all entities matching `product-.*`. The entity class must declare
    // a `public` projection. With it, Alice reads and writes only the fields that the projection exposes.
    const token = await pubnub.grantToken({
      ttl: 15,
      authorizedUserId: 'user-alice',
      resources: {
        users: {
          'user-bob': {
            get: true,
          },
        },
        dataSync: {
          entities: {
            'product-sneaker-42': {
              get: true,
            },
          },
        },
      },
      patterns: {
        dataSync: {
          entities: {
            'product-.*': {
              get: true,
            },
          },
        },
      },
      dataSyncProjections: {
        resources: {
          entities: {
            'product-sneaker-42': 'public',
          },
        },
        patterns: {
          entities: {
            'product-.*': 'public',
          },
        },
      },
    });
    console.log('Granted Token:', token);
    // snippet.end
    logs.restore();
    const parsed = pubnub.parseToken(token) as
      | { meta?: Record<string, { res?: Record<string, string>; pat?: Record<string, string> }> }
      | undefined;
    assert.ok(parsed, 'the token parses');
    assert.equal(parsed.meta?.['pn-projections']?.res?.['datasync:entities:product-sneaker-42'], 'public');
    assert.equal(parsed.meta?.['pn-projections']?.pat?.['datasync:entities:product-.*'], 'public');
  });

  it('accessManagerGrantTokenErrors: the documented grantToken mistakes are refused locally with validation errors and create no token', async () => {
    const staff = server();
    await rejectsValidation(staff.grantToken({ ttl: 15 } as never), /Missing values for either Resources or Patterns/);
    await rejectsValidation(
      staff.grantToken({ ttl: 15, resources: { channels: {} } }),
      /Missing values for either Resources or Patterns/,
    );
    await rejectsValidation(staff.revokeToken(''), /token can't be empty/);
    await rejectsValidation(shopper().revokeToken('some-token'), /Missing Secret Key/);
    // The open client has no secret key, so it cannot grant.
    await rejectsValidation(
      shopper().grantToken({ ttl: 15, resources: { channels: { x: { read: true } } } }),
      /Missing Secret Key/,
    );
  });

  // A client that never received a token is rejected on the secured keyset. Fails while an application-level (v2) grant
  // from another page or an earlier run is still open on the pam keyset: the tier-wide cleanup closes it.
  it('accessManagerDeniedWithoutToken: a client that never received a token is refused with a 403 on the secured keyset', async () => {
    const stranger = createClient('pam', 'am-denied');
    await rejectsWithCategory(publishTo(stranger, room), 'PNAccessDeniedCategory');
  });
});
