import assert from '../harness/assert.js';
import type PubNub from 'pubnub';
import { page, step, check } from '../harness/step.js';
import { eventually, connected } from '../harness/wait.js';
import { rejectsValidation, rejectsWithCategory } from '../harness/assertions.js';

/** Parsed tokens list every permission flag. The docs show the granted ones, so compare only those. */
export const granted = (permissions: object | undefined): Record<string, boolean> =>
  Object.fromEntries(Object.entries(permissions ?? {}).filter(([, value]) => value === true));

/**
 * docs/sdks/javascript/api-reference/access-manager.md (Access Manager v3 tokens)
 *
 * Secured keyset only. The docs call `grantToken` as a server that holds the secret key, so every snippet runs
 * as `world.server`. Property keys inside `resources` and `patterns` (`'channel-a'`, `'user-bob'`) are never
 * rewritten by the staging step, only values are. The authorized user ids are registered names, so each run
 * grants to its own user ids and never touches another module's tokens.
 *
 * Alice and Bob: the check `accessManagerTokenFixture` grants them real tokens for the private room
 * `am_room`, wires Bob through `world.setToken('bob', ...)` and leaves Alice's token to `setTokenBasicUsage`,
 * which is the docs sample for exactly that call.
 *
 * Phase P1. Sneaker Drop role: the staff server (secret key) issues Access Manager (v3) tokens to the shop's
 * clients. Alice (read and write) and Bob (read only) share the private room `am_room`.
 *
 * Proves: every `grantToken` sample returns a token the SDK can parse, and the parsed token holds the scopes the
 * snippet asked for. Real enforcement is proven for the room (Alice publishes, Bob and a stranger are denied)
 * and for `revokeToken` (a revoked token ends up rejected).
 * Does not prove: that the DataSync scopes (`dataSync`, `dataSyncProjections`) are enforced. Those two samples
 * only check that the token is created and parses, enforcement belongs to the DataSync page. Also not proven:
 * the ttl expiring, which would take 15 minutes.
 */
export default page('api-reference/access-manager', 'P1', (world) => {
  const secured = { keyset: 'pam' } as const;
  let aliceToken = '';
  let bobToken = '';

  /** Publishes to a channel and resolves with the timetoken. */
  const publishTo = async (client: PubNub, channel: string): Promise<string> => {
    const response = await client.publish({ channel, message: { text: 'am-check' } });
    return response.timetoken;
  };

  // Harness fixture, no snippet. Grants Alice read and write and Bob read only on `am_room`, installs Bob's token
  // on his client and keeps both tokens for the steps below (`needs` this check). The assertions prove the
  // fixture works, so later failures point at the snippet and not at the setup: Bob is denied on publish but
  // can subscribe, and `connected` is registered before `subscribe()` because statuses are not replayed.
  check('accessManagerTokenFixture', { keyset: 'pam', timeout: 60_000, proves: 'Fixture: Alice gets read and write and Bob read only on the room, and Bob is denied on publish but can subscribe.' }, async () => {
    const server = world.server;
    const room = world.n('am_room');
    aliceToken = await server.grantToken({
      ttl: 15,
      authorizedUserId: world.alice.getUserId(),
      resources: { channels: { [room]: { read: true, write: true } } },
    });
    bobToken = await server.grantToken({
      ttl: 15,
      authorizedUserId: world.bob.getUserId(),
      resources: { channels: { [room]: { read: true } } },
    });
    world.setToken('bob', bobToken);
    assert.equal(world.bob.getToken(), bobToken);
    // Bob holds a read-only token: he can subscribe to the room but not publish to it.
    await rejectsWithCategory(world.bob.publish({ channel: room, message: 'x' }), 'PNAccessDeniedCategory');
    const subscription = world.bob.channel(room).subscription();
    const ready = connected(world.bob, { channels: [room] });
    subscription.subscribe();
    await ready;
    subscription.unsubscribe();
  });

  // Basic `grantToken` sample. The parsed token is checked field by field (user id with run suffix, channel
  // permissions, ttl). The token is stored as the `grantedToken` placeholder for snippets that parse it later.
  step('accessManagerBasicUsage', { ...secured, proves: 'grantToken returns a token whose parsed form carries the user id, channel permissions and ttl that were asked for.' }, async () => {
    const pubnub = world.server;
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
    const parsed = pubnub.parseToken(token);
    assert.equal(parsed?.authorized_uuid, world.n('my-authorized-uuid'));
    assert.deepEqual(granted(parsed?.resources?.channels?.['my-channel']), { read: true, write: true });
    assert.equal(parsed?.ttl, 15);
    world.setPh('grantedToken', token);
  });

  // The docs pass a literal token (a registered placeholder, so the staged snippet revokes the real one). The step
  // first builds a user with a working token, so the revoke has an effect to observe. The long timeout and the
  // polling exist because the service caches the non-revoked state for up to a minute.
  step('revokeTokenBasicUsage', { ...secured, timeout: 240_000, proves: 'revokeToken makes a working token stop working, observed by a client that was allowed before and by two fresh clients with the same token.' }, async () => {
    // Fixture: a user with a working token, so the effect of the revoke is visible.
    const room = world.n('am_other');
    const revokee = world.client('secured', 'am-revokee');
    const token = await world.server.grantToken({
      ttl: 15,
      authorizedUserId: revokee.getUserId(),
      resources: { channels: { [room]: { read: true, write: true } } },
    });
    revokee.setToken(token);
    world.check.timetoken(await publishTo(revokee, room));
    world.setPh('tokenToRevoke', token);

    const pubnub = world.server;
    // snippet.revokeTokenBasicUsage
    const response = await pubnub.revokeToken('p0AkFl043rhDdHRsple3KgQ3NwY6BDcENnctokenVzcqBDczaWdYIGOAeTyWGJI');
    // snippet.end
    assert.deepEqual(response, {}, 'revokeToken resolves with an empty object');
    await eventually(
      () => rejectsWithCategory(publishTo(revokee, room), 'PNAccessDeniedCategory'),
      // The docs say a revoke can take up to one minute, because the non-revoked state is cached for that long.
      { timeout: 100_000, interval: 2_000, label: 'revoked token is rejected' },
    );
    // Enforcement reaches the service nodes unevenly, so one refusal is not enough. Two fresh clients with the same user id
    // and the revoked token (a client without any token would be refused anyway and prove nothing) must be refused too.
    for (const attempt of [1, 2]) {
      const fresh = world.client('secured', 'am-revokee');
      fresh.setToken(token);
      await eventually(
        () => rejectsWithCategory(publishTo(fresh, room), 'PNAccessDeniedCategory'),
        { timeout: 60_000, interval: 2_000, label: `revoked token is rejected for fresh client ${attempt}` },
      );
    }
  });

  // `parseToken` is local. The snippet parses a placeholder, the assertions parse Alice's real token from the
  // fixture and check owner and permissions.
  step('parseTokenBasicUsage', { ...secured, needs: ['accessManagerTokenFixture'], proves: 'parseToken decodes a token locally, and the fixture token shows the right owner and permissions.' }, () => {
    const pubnub = world.server;
    world.setPh('grantedToken', aliceToken);
    // snippet.parseTokenBasicUsage
    pubnub.parseToken('use-token-string-generated-by-grantToken()');
    // snippet.end
    const parsed = pubnub.parseToken(aliceToken);
    assert.equal(parsed?.authorized_uuid, world.alice.getUserId());
    assert.deepEqual(granted(parsed?.resources?.channels?.[world.n('am_room')]), { read: true, write: true });
  });

  // Alice starts without a token and is denied. The snippet installs the token (placeholder staged to Alice's
  // real token), then the effect is checked: she publishes to her room, not to another one, and Bob stays read only.
  step('setTokenBasicUsage', { ...secured, needs: ['accessManagerTokenFixture'], timeout: 60_000, proves: 'setToken lets Alice publish to her room but not to another, while Bob stays read only.' }, async () => {
    const pubnub = world.alice;
    const room = world.n('am_room');
    world.setPh('grantedToken', aliceToken);
    // Without a token the secured keyset refuses Alice.
    pubnub.setToken(undefined);
    await rejectsWithCategory(publishTo(pubnub, room), 'PNAccessDeniedCategory');
    // snippet.setTokenBasicUsage
    pubnub.setToken('use-token-string-generated-by-grantToken()');
    // snippet.end
    assert.equal(pubnub.getToken(), aliceToken);
    world.check.timetoken(await publishTo(pubnub, room));
    // The token names one room only.
    await rejectsWithCategory(publishTo(pubnub, world.n('am_other')), 'PNAccessDeniedCategory');
    // Bob (read only) still cannot publish, he reads what Alice sent.
    await rejectsWithCategory(publishTo(world.bob, room), 'PNAccessDeniedCategory');
  });

  // Channels, groups and uuids in one token. Property keys are not suffixed (see header), so the parsed token is
  // read with the plain keys.
  step('grantTokenVariousResources', { ...secured, proves: 'A token with channels, groups and uuids keeps each resource with its permissions in the parsed form.' }, async () => {
    const pubnub = world.server;
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
  step('grantTokenUsingRegEx', { ...secured, proves: 'A pattern-only token keeps the regular expression unchanged under patterns.channels.' }, async () => {
    const pubnub = world.server;
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
  step('grantTokenRegExAndResources', { ...secured, proves: 'A token with resources and patterns returns both sections when parsed.' }, async () => {
    const pubnub = world.server;
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

  // Category permissions (`get` on all channel metadata and all uuid metadata). Stores the token as the
  // `grantedToken` placeholder for `parseTokenWithCategories`.
  step('grantTokenWithCategories', { ...secured, proves: 'A category token carries get on all channel metadata and all uuid metadata.' }, async () => {
    const pubnub = world.server;
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
    const parsed = pubnub.parseToken(token);
    assert.equal(parsed?.categories?.channels?.get, true);
    assert.equal(parsed?.categories?.uuids?.get, true);
    world.setPh('grantedToken', token);
  });

  // Parses the token from the previous step through the placeholder. `needs` it because the placeholder only has
  // a value after that step passed.
  step('parseTokenWithCategories', { ...secured, needs: ['grantTokenWithCategories'], proves: 'parseToken reads the category permissions of the token created by the previous step.' }, () => {
    const pubnub = world.server;
    // snippet.parseTokenWithCategories
    // Decodes a token that was granted with category permissions.
    const parsedToken = pubnub.parseToken('use-token-string-generated-by-grantToken()');

    console.log('Can list all channel metadata:', parsedToken?.categories?.channels?.get);
    console.log('Can list all uuid metadata:', parsedToken?.categories?.uuids?.get);
    // snippet.end
    assert.equal(parsedToken?.categories?.channels?.get, true);
    assert.equal(parsedToken?.categories?.uuids?.get, true);
  });

  // DataSync scopes in a token (`dataSync.entities` plus the top-level `users` scope for DataSync users). Creation
  // and parsing only. The ids are registered DataSync names, so the authorized user is Alice's suffixed id.
  step('grantTokenDataSyncResources', { keyset: 'datasync', proves: 'A token can carry DataSync entity scopes and the top-level users scope, and parseToken returns them.' }, async () => {
    const pubnub = world.server;
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
    const parsed = pubnub.parseToken(token);
    assert.equal(parsed?.authorized_uuid, world.alice.getUserId());
    assert.ok(parsed?.resources, 'the token carries resources');
  });

  // Same grant plus `dataSyncProjections`. Creation and parsing only. `authorizedUserId` combines with `dataSyncProjections`
  // in the SDK types (checked with tsc). The projection is assigned to entities of the `product` class only, because that
  // class declares `public`. The built-in Global User class declares only `__default__`, so a `public` assignment to a
  // user would make the token fail with 403 when used (docs row 24, the page now assigns no user projection).
  step('grantTokenWithProjection', { keyset: 'datasync', proves: 'A token with dataSyncProjections is created and parsed, and the projection assignment for an entity of a class that declares it is carried in the token.' }, async () => {
    const pubnub = world.server;
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
    const parsed = pubnub.parseToken(token) as { meta?: Record<string, { res?: Record<string, string>; pat?: Record<string, string> }> } | undefined;
    assert.ok(parsed, 'the token parses');
    assert.equal(parsed.meta?.['pn-projections']?.res?.['datasync:entities:product-sneaker-42'], 'public');
    assert.equal(parsed.meta?.['pn-projections']?.pat?.['datasync:entities:product-.*'], 'public');
  });

  // Error behavior the page documents or implies. Local validation, no token is created.
  check('accessManagerGrantTokenErrors', { ...secured, proves: 'The documented grantToken mistakes are refused locally with validation errors and create no token.' }, async () => {
    const server = world.server;
    await rejectsValidation(server.grantToken({ ttl: 15 } as never), /Missing values for either Resources or Patterns/);
    await rejectsValidation(
      server.grantToken({ ttl: 15, resources: { channels: {} } }),
      /Missing values for either Resources or Patterns/,
    );
    await rejectsValidation(server.revokeToken(''), /token can't be empty/);
    await rejectsValidation(world.shopper.revokeToken('some-token'), /Missing Secret Key/);
    // The open client has no secret key, so it cannot grant.
    await rejectsValidation(
      world.shopper.grantToken({ ttl: 15, resources: { channels: { x: { read: true } } } }),
      /Missing Secret Key/,
    );
  });

  // A client that never received a token is rejected on the secured keyset.
  check('accessManagerDeniedWithoutToken', { ...secured, proves: 'A client that never received a token is refused with a 403 on the secured keyset.' }, async () => {
    const stranger = world.client('secured', 'am-denied');
    await rejectsWithCategory(publishTo(stranger, world.n('am_room')), 'PNAccessDeniedCategory');
  });
});
