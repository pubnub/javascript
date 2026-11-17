import assert from '../harness/assert.js';
import type PubNub from 'pubnub';
import { page, step, check } from '../harness/step.js';
import { eventually, expectStatus } from '../harness/wait.js';
import { rejectsValidation } from '../harness/assertions.js';
import { revokeApplicationGrant } from '../harness/revoke.js';

/**
 * Access Manager v2 `grant` examples. These calls require the secret key.
 */
export default page('api-reference/access-manager-v2', 'P1', (world) => {
  const secured = { keyset: 'pam' } as const;
  /** Loose view of a grant response. The union in the types is wide, the assertions read plain fields. */
  const loose = (response: unknown): Record<string, any> => response as Record<string, any>;

  /** A client that sends `authKey` with every request. */
  const withAuthKey = (label: string, authKey: string): PubNub =>
    world.client('secured', label, { authKey: world.n(authKey) });

  const publishTo = async (client: PubNub, channel: string): Promise<string> =>
    (await client.publish({ channel, message: { text: 'am-v2' } })).timetoken;

  const closeGrant = (params: Record<string, unknown>): Promise<unknown> =>
    world.server.grant({ read: false, write: false, ttl: 1, ...params } as never);

  step('grantBasicUsage', { ...secured, proves: 'grant returns the permissions asked for on one auth key and channel, and a client carrying that auth key can publish there.' }, async () => {
    const pubnub = world.server;
    // snippet.grantBasicUsage
    const result = await pubnub.grant({
      authKeys: ['my_authkey'],
      channels: ['my_channel'],
      ttl: 12313, // 0 for infinite
      read: true, // false to disallow
      write: true, // false to disallow
      manage: true, // false to disallow
      delete: true, // false to disallow
    });
    // snippet.end
    try {
      const response = loose(result);
      console.log(JSON.stringify(response));
      const channel = world.n('my_channel');
      const auth = world.n('my_authkey');
      // The SDK resolves with the payload itself, not with the status envelope the docs show.
      // The docs Response block shows exactly these keys and the ttl the request sent.
      assert.deepEqual(Object.keys(response).sort(), ['auths', 'channel', 'level', 'subscribe_key', 'ttl']);
      assert.equal(response.ttl, 12313);
      assert.equal(response.channel, channel);
      assert.equal(response.level, 'user');
      const entry = response.auths?.[auth];
      assert.deepEqual([entry?.r, entry?.w, entry?.m, entry?.d], [1, 1, 1, 1], 'all four permissions are granted');
      // Effect: a client with that auth key can publish to the channel.
      world.check.timetoken(await publishTo(withAuthKey('am-v2-user', 'my_authkey'), channel));
    } finally {
      await closeGrant({ authKeys: [world.n('my_authkey')], channels: [world.n('my_channel')], manage: false, delete: false });
    }
  });

  // Downgrade of the same pair to read only. `needs` the first grant so the response describes a change.
  // No effect check, see the comment at the end of the body. The long timeout is headroom for slow grant propagation.
  step('grantChannelOnAuthKey', { ...secured, needs: ['grantBasicUsage'], timeout: 60_000, proves: 'A second grant on the same auth key and channel reports the downgrade to read only in its response.' }, async () => {
    const pubnub = world.server;
    // snippet.grantChannelOnAuthKey
    const result = await pubnub.grant({
      authKeys: ['my_authkey'],
      channels: ['my_channel'],
      ttl: 5,
      read: true, // false to disallow
      write: false, // false to disallow
    });
    // snippet.end
    try {
      const entry = loose(result).auths?.[world.n('my_authkey')];
      assert.deepEqual([entry?.r, entry?.w], [1, 0]);
    } finally {
      await closeGrant({ authKeys: [world.n('my_authkey')], channels: [world.n('my_channel')] });
    }
  });

  step('grantPresenceChannelOnAuthKey', { ...secured, proves: 'Granting the -pnpres companion channel returns the permissions for that presence channel.' }, async () => {
    const pubnub = world.server;
    world.setPh('myChannelPnpres', `${world.n('my_channel')}-pnpres`);
    // snippet.grantPresenceChannelOnAuthKey
    const result = await pubnub.grant({
      authKeys: ['my_authkey'],
      channels: ['my_channel-pnpres'],
      ttl: 5,
      read: true, // false to disallow
      write: true, // false to disallow
    });
    // snippet.end
    try {
      const response = loose(result);
      assert.equal(response.channel, `${world.n('my_channel')}-pnpres`);
      const entry = response.auths?.[world.n('my_authkey')];
      assert.deepEqual([entry?.r, entry?.w], [1, 1]);
    } finally {
      await closeGrant({ authKeys: [world.n('my_authkey')], channels: [`${world.n('my_channel')}-pnpres`] });
    }
  });

  // User level grant (`get`, `update`, `delete` on user metadata). Response only, no effect check.
  step('grantUuidOnAuthKey', { ...secured, proves: 'A user level grant returns get, update and delete permissions for the uuid.' }, async () => {
    const pubnub = world.server;
    // snippet.grantUuidOnAuthKey
    const result = await pubnub.grant({
      authKeys: ['key1'],
      uuids: ['uuid1'],
      ttl: 1440, // 0 for infinite
      get: true, // false to disallow
      update: true, // false to disallow
      delete: true, // false to disallow
    });
    // snippet.end
    try {
      const response = loose(result);
      console.log(JSON.stringify(response));
      // The docs describe a uuid grant as `uuids: { <id>: { auths } }` next to `level`, `ttl` and `subscribe_key`.
      assert.deepEqual(Object.keys(response).sort(), ['level', 'subscribe_key', 'ttl', 'uuids']);
      assert.equal(response.level, 'uuid');
      const entry = response.uuids?.[world.n('uuid1')]?.auths?.[world.n('key1')];
      assert.deepEqual([entry?.g, entry?.u, entry?.d], [1, 1, 1]);
    } finally {
      await world.server.grant({ authKeys: [world.n('key1')], uuids: [world.n('uuid1')], get: false, update: false, delete: false, ttl: 1 });
    }
  });

  step('grantWithCategories', { ...secured, proves: 'A category grant returns the permissions for all channel metadata and all uuid metadata.' }, async () => {
    const pubnub = world.server;
    // snippet.grantWithCategories
    // Grants the auth key permission to list all channel metadata and all uuid metadata.
    // This legacy `grant` method requires the secret key to be set on the client.
    const response = await pubnub.grant({
      authKeys: ['my-auth-key'],
      categories: ['channels', 'uuids'],
      get: true,
      ttl: 15,
    });
    console.log('Grant response:', response);
    // snippet.end
    try {
      const result = loose(response);
      assert.equal(result.level, 'category');
      const auth = world.n('my-auth-key');
      assert.equal(result.categories?.channels?.auths?.[auth]?.g, 1);
      assert.equal(result.categories?.uuids?.auths?.[auth]?.g, 1);
    } finally {
      await world.server.grant({ authKeys: [world.n('my-auth-key')], categories: ['channels', 'uuids'], get: false, ttl: 2 });
    }
  });

  step('grantChannelAllAuthKeys', { ...secured, proves: 'A channel level grant without auth keys opens the channel to a client with no auth key, and the grant is closed again at the end.' }, async () => {
    const pubnub = world.server;
    // snippet.grantChannelAllAuthKeys
    const result = await pubnub.grant({
      channels: ['my_channel'],
      read: true, // false to disallow
      write: true, // false to disallow
    });
    // snippet.end
    // From here on the channel is open to everybody, so everything below runs inside try and the finally closes it again.
    try {
      const response = loose(result);
      assert.equal(response.level, 'channel');
      const entry = response.channels?.[world.n('my_channel')];
      assert.deepEqual([entry?.r, entry?.w], [1, 1]);
      // Effect: a client without any auth key can use the channel now.
      world.check.timetoken(await publishTo(world.client('secured', 'am-denied'), world.n('my_channel')));
    } finally {
      // Closes the channel for everybody again (read and write off). Runs also when an assertion above fails.
      await pubnub.grant({ channels: [world.n('my_channel')], read: false, write: false, ttl: 1 });
    }
  });

  // Categories: documented validation errors, raised locally before anything is sent.
  check('accessManagerV2CategoryErrors', { ...secured, proves: 'The documented category grant mistakes are refused locally with validation errors before anything is sent.' }, async () => {
    const server = world.server;
    await rejectsValidation(
      server.grant({ categories: ['channels'], get: true, ttl: 15 }),
      /authKeys are required for grant request on categories/,
    );
    await rejectsValidation(
      server.grant({ authKeys: ['k'], categories: ['groups' as never], get: true, ttl: 15 }),
      /Invalid category: only channels and uuids are supported/,
    );
    await rejectsValidation(
      server.grant({ authKeys: ['k'], categories: ['channels'], get: true, read: true, ttl: 15 }),
      /Category permissions must be exactly the get permission/,
    );
    await rejectsValidation(
      server.grant({ authKeys: ['k'], categories: ['channels'], get: true, ttl: 1 }),
      /One-minute category grants are not supported/,
    );
  });

  // The application level sample opens every channel for every client, so it is the last thing this module does
  // and the revoke runs even when an assertion fails. The probe is a stranger with no token and no auth key that
  // subscribes: it connects while the application level read is on, otherwise the SDK reports a connection error
  // or access denied.
  step('grantAllChannelsAllAuthKeys', { ...secured, phase: 'P9', timeout: 120_000, proves: 'The application level grant opens the keyset to a stranger, and the revoke closes it again and the keyset stops serving the stranger.' }, async () => {
    const pubnub = world.server;
    let probes = 0;
    const subscribeResult = async (): Promise<string> => {
      probes += 1;
      const stranger = world.client('secured', `am-denied-${probes}`);
      const result = expectStatus(stranger, ['PNConnectedCategory', 'PNAccessDeniedCategory', 'PNConnectionErrorCategory'], { timeout: 10_000 });
      const subscription = stranger.channel(world.n('am_other')).subscription();
      subscription.subscribe();
      try {
        return await result;
      } finally {
        subscription.unsubscribe();
        stranger.destroy();
      }
    };
    try {
      // snippet.grantAllChannelsAllAuthKeys
      const result = await pubnub.grant({
        read: true,
      });
      // snippet.end
      const response = loose(result);
      assert.equal(response.level, 'subkey');
      assert.equal(response.r, 1);
      assert.equal(response.ttl, 1440, 'the default ttl is 1440 minutes');
      await eventually(async () => assert.equal(await subscribeResult(), 'PNConnectedCategory'), {
        timeout: 30_000,
        interval: 500,
        label: 'a stranger can read now',
      });
    } finally {
      await revokeApplicationGrant(pubnub);
    }
    // The revoke took, so the keyset is not left open for other modules.
    await eventually(async () => assert.notEqual(await subscribeResult(), 'PNConnectedCategory'), {
      timeout: 45_000,
      interval: 500,
      label: 'application level grant is revoked',
    });
  });
});
