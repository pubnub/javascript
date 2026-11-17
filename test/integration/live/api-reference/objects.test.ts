import assert from 'node:assert/strict';
import type PubNub from 'pubnub';
import { friend, observer, shopper } from '../support/clients';
import { retryTransient } from '../support/retry';
import { captureConsole } from '../support/console';
import { eventually, settled, watch } from '../support/wait';
import { sorted } from '../support/util';

/**
 * App Context examples. Port of docs-snippets/api-reference/objects.ts.
 * Needs App Context on the open keyset. Users, channels, memberships and members are shared literal names, so every test
 * resets the specific resources its sample works on first (reset approach) and then asserts exact lists. The `after` hook
 * removes what the samples leave behind.
 */
describe('api-reference/objects', () => {
  // Sorted ids, so list assertions do not depend on service ordering.
  const ids = (list: Array<{ id: string }>): string[] => list.map((o) => o.id).sort();

  const SHOPPER = 'shopper';

  /** Removes every membership of the user and waits until another client sees none on consecutive reads. */
  async function clearMemberships(uuid: string): Promise<void> {
    const admin = friend();
    const current = await admin.objects.getMemberships({ uuid, limit: 100 });
    if (current.data.length > 0) {
      await admin.objects.removeMemberships({ uuid, channels: current.data.map((m) => m.channel.id) });
    }
    const reader = observer();
    await settled(async () => assert.deepEqual((await reader.objects.getMemberships({ uuid })).data, []), {
      label: `memberships of ${uuid} cleared`,
    });
  }

  /** Removes every member of the channel and waits until another client sees none on consecutive reads. */
  async function clearMembers(channel: string): Promise<void> {
    const admin = friend();
    const current = await admin.objects.getChannelMembers({ channel, limit: 100 });
    if (current.data.length > 0) {
      await admin.objects.removeChannelMembers({ channel, uuids: current.data.map((m) => m.uuid.id) });
    }
    const reader = observer();
    await settled(async () => assert.deepEqual((await reader.objects.getChannelMembers({ channel })).data, []), {
      label: `members of ${channel} cleared`,
    });
  }

  /** Creates or overwrites the channel `team.blue` that the docs read (its name matches the `*Team` filter). */
  async function seedTeamBlue(pubnub: PubNub): Promise<void> {
    await retryTransient(
      () =>
        pubnub.objects.setChannelMetadata({
          channel: 'team.blue',
          data: { name: 'Blue Team', description: 'The channel for Blue team.' },
        }),
      { label: 'seed app context' },
    );
    // The samples read team.blue by id and through the `*Team` name filter (an index), so both reads must hold on consecutive polls.
    const reader = observer();
    await settled(
      async () => {
        assert.equal((await reader.objects.getChannelMetadata({ channel: 'team.blue' })).data.name, 'Blue Team');
        const filtered = await reader.objects.getAllChannelMetadata({ filter: 'name LIKE "*Team"' });
        assert.ok(ids(filtered.data).includes('team.blue'), 'team.blue is in the filtered list');
      },
      { label: 'team.blue visible by id and in the name filter' },
    );
  }

  const ignoreMissing = (promise: Promise<unknown>): Promise<unknown> => promise.catch(() => undefined);

  before(async () => {
    // Preflight: the open keyset must have App Context enabled.
    try {
      await observer().objects.getAllUUIDMetadata({ limit: 1 });
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`The open keyset does not have App Context. Enable "App Context" for it. ${detail}`);
    }
  });

  after(async () => {
    const admin = friend();
    for (const uuid of [SHOPPER, 'myUuid', 'my-uuid']) {
      await ignoreMissing(clearMemberships(uuid));
      await ignoreMissing(admin.objects.removeUUIDMetadata({ uuid }));
    }
    for (const channel of ['myChannel']) await ignoreMissing(clearMembers(channel));
    for (const uuid of ['uuid-1', 'uuid-2', 'uuid-3']) await ignoreMissing(admin.objects.removeUUIDMetadata({ uuid }));
    for (const channel of [
      'team.blue',
      'team.red',
      'myChannel',
      'my-channel',
      'channel-with-status-type',
      'ch-1',
      'ch-2',
    ]) {
      await ignoreMissing(admin.objects.removeChannelMetadata({ channel }));
    }
  });

  // ---- users ----------------------------------------------------------------------------------------------------

  it('setUUIDMetadataBasicUsage: setUUIDMetadata stores the user and another client reads it back', async () => {
    const pubnub = shopper();

    // snippet.setUUIDMetadataBasicUsage
    // Using UUID from the config  - default when uuid is not passed in the method
    const response = await pubnub.objects.setUUIDMetadata({
      data: {
        name: 'John Doe',
      },
    });
    console.log('setUUIDMetadata response:', response);

    // Using the passed in UUID
    const response2 = await pubnub.objects.setUUIDMetadata({
      uuid: 'myUuid',
      data: {
        email: 'john.doe@example.com',
      },
    });
    console.log('setUUIDMetadata response:', response2);
    // snippet.end

    assert.equal(response.data.id, pubnub.getUserId());
    assert.equal(response.data.name, 'John Doe');
    assert.equal(response2.data.id, 'myUuid');
    assert.equal(response2.data.email, 'john.doe@example.com');
    const reader = observer();
    await eventually(
      async () => {
        const stored = await reader.objects.getUUIDMetadata({ uuid: 'myUuid' });
        assert.equal(stored.data.email, 'john.doe@example.com');
      },
      { label: 'stored user visible to another client' },
    );
  });

  it('getUUIDMetadataBasicUsage: getUUIDMetadata reads the users stored beforehand', async () => {
    const pubnub = shopper();
    const admin = friend();
    // Store the two users the sample reads (own data, so the exact values are legitimate).
    await retryTransient(() => admin.objects.setUUIDMetadata({ uuid: SHOPPER, data: { name: 'John Doe' } }), {
      label: 'seed app context',
    });
    await retryTransient(
      () => admin.objects.setUUIDMetadata({ uuid: 'myUuid', data: { email: 'john.doe@example.com' } }),
      { label: 'seed app context' },
    );
    const reader = observer();
    await settled(
      async () => {
        assert.equal((await reader.objects.getUUIDMetadata({ uuid: SHOPPER })).data.name, 'John Doe');
        assert.equal((await reader.objects.getUUIDMetadata({ uuid: 'myUuid' })).data.email, 'john.doe@example.com');
      },
      { label: 'users visible' },
    );

    // snippet.getUUIDMetadataBasicUsage
    // Using UUID from the config  - default when uuid is not passed in the method
    const response = await pubnub.objects.getUUIDMetadata();
    console.log('getUUIDMetadata response:', response);

    // Using the passed in UUID
    const response2 = await pubnub.objects.getUUIDMetadata({
      uuid: 'myUuid',
    });
    console.log('getUUIDMetadata response:', response2);
    // snippet.end

    assert.equal(response.data.id, pubnub.getUserId());
    assert.equal(response.data.name, 'John Doe');
    assert.equal(response2.data.id, 'myUuid');
    assert.equal(response2.data.email, 'john.doe@example.com');
  });

  it('getAllUUIDMetadataBasicUsage: getAllUUIDMetadata runs the sample function and logs the user list', async () => {
    const pubnub = shopper();
    // The sample says to add user metadata first.
    await retryTransient(
      () => friend().objects.setUUIDMetadata({ uuid: 'myUuid', data: { email: 'john.doe@example.com' } }),
      { label: 'seed app context' },
    );
    const logs = captureConsole('log');
    try {
      // snippet.getAllUUIDMetadataBasicUsage
      // Function to get all UUID metadata
      // to get some data in response, add user metadata using setUUIDMetadata method
      async function getAllUUIDMetadata() {
        const response = await pubnub.objects.getAllUUIDMetadata();
        console.log('getAllUUIDMetadata response:', response);
      }

      // Execute the function to get UUID metadata
      await getAllUUIDMetadata();
      // snippet.end
    } finally {
      logs.restore();
    }
    assert.ok(
      logs.lines.some((line) => line.startsWith('getAllUUIDMetadata response:')),
      'the function logged its response',
    );
    // The list is shared and can be long: look at the 100 most recently updated users, where the one just written is.
    await eventually(
      async () => {
        const listed = await pubnub.objects.getAllUUIDMetadata({ limit: 100, sort: { updated: 'desc' } });
        assert.ok(
          listed.data.some((u) => u.id === 'myUuid'),
          'the stored user is part of the list',
        );
      },
      { label: 'stored user listed' },
    );
  });

  it('removeUUIDMetadataBasicUsage: removeUUIDMetadata deletes the users and reads fail with not found afterwards', async () => {
    const pubnub = shopper();
    const admin = friend();
    await retryTransient(() => admin.objects.setUUIDMetadata({ uuid: SHOPPER, data: { name: 'John Doe' } }), {
      label: 'seed app context',
    });
    await retryTransient(
      () => admin.objects.setUUIDMetadata({ uuid: 'myUuid', data: { email: 'john.doe@example.com' } }),
      { label: 'seed app context' },
    );

    // snippet.removeUUIDMetadataBasicUsage
    // Using UUID from the config  - default when uuid is not passed in the method
    const response = await pubnub.objects.removeUUIDMetadata();

    // Using the passed in UUID
    const response2 = await pubnub.objects.removeUUIDMetadata({
      uuid: 'myUuid',
    });
    // snippet.end

    assert.equal(response.status, 200);
    assert.equal(response2.status, 200);
    const reader = observer();
    await eventually(
      async () => {
        for (const uuid of [pubnub.getUserId(), 'myUuid']) {
          await assert.rejects(reader.objects.getUUIDMetadata({ uuid }), `${uuid} is gone`);
        }
      },
      { label: 'users removed' },
    );
  });

  // ---- channels -------------------------------------------------------------------------------------------------

  // The `*Team` filter needs a channel named `... Team`, which team.blue provides with the name `Blue Team`.
  it('getAllChannelMetadataBasicUsage: getAllChannelMetadata with the Team filter returns the seeded channel', async () => {
    const pubnub = shopper();
    await seedTeamBlue(friend());

    // snippet.getAllChannelMetadataBasicUsage
    // Get the total number of channels included in the response.
    const response = await pubnub.objects.getAllChannelMetadata({
      include: {
        totalCount: true,
      },
    });

    // Get all channels with the filter option. To get all channel which has Id ending 'Team'.
    const response2 = await pubnub.objects.getAllChannelMetadata({
      filter: 'name LIKE "*Team"',
    });
    console.log('Get all channel metadata response:', response2);
    // snippet.end

    assert.ok((response.totalCount ?? 0) >= 1, 'totalCount is part of the response');
    assert.ok(response2.data.length >= 1, 'the filter finds the team channels');
    assert.ok(
      response2.data.every((c) => c.name?.endsWith('Team')),
      'every match ends with Team',
    );
    assert.ok(ids(response2.data).includes('team.blue'), 'team.blue is in the filtered list');
  });

  it('getChannelMetadataBasicUsage: getChannelMetadata reads the seeded channel by id', async () => {
    const pubnub = shopper();
    await seedTeamBlue(friend());

    // snippet.getChannelMetadataBasicUsage
    const response = await pubnub.objects.getChannelMetadata({
      // `channel` is the `id` in the _metadata_, not `name`
      channel: 'team.blue',
    });
    console.log('Get channel metadata response:', response);
    // snippet.end

    assert.equal(response.data.id, 'team.blue');
    assert.equal(response.data.name, 'Blue Team');
  });

  it('setChannelMetadataBasicUsage: setChannelMetadata stores the channel, an observer gets the set event and the hidden custom data was stored', async () => {
    const pubnub = shopper();
    // Channel scoped objects events arrive on a subscription to the channel itself.
    const listening = await watch(observer(), ['team.red']);

    // snippet.setChannelMetadataBasicUsage
    const response = await pubnub.objects.setChannelMetadata({
      channel: 'team.red',
      data: {
        name: 'Red Team',
        description: 'The channel for Red team and no other teams.',
        custom: {
          owner: 'Red Leader',
        },
      },
      include: {
        customFields: false,
      },
    });
    console.log('Set channel metadata response:', response);
    // snippet.end

    assert.equal(response.data.id, 'team.red');
    assert.equal(response.data.name, 'Red Team');
    assert.equal(response.data.custom, undefined, 'customFields: false leaves custom out of the response');
    const reader = observer();
    await eventually(
      async () => {
        const stored = await reader.objects.getChannelMetadata({
          channel: 'team.red',
          include: { customFields: true },
        });
        assert.deepEqual(stored.data.custom, { owner: 'Red Leader' });
      },
      { label: 'stored channel custom data visible to another client' },
    );
    // The sample's own write is the newest set event for the channel, and its description is unique to this sample.
    const event = await listening.next(
      'objects',
      (e) => e.channel === 'team.red' && e.message.event === 'set' && e.message.type === 'channel',
    );
    assert.equal(event.message.event, 'set');
    assert.equal(event.message.type, 'channel');
    listening.stop();
  });

  it('iterativelyUpdateExistingMetadata: the read-modify-write pattern merges custom data and the merged object survives on the service', async () => {
    const pubnub = shopper();

    // The sample reads the channel back once, right after its own first write, and merges into what it reads. An earlier test
    // left other custom data on team.red, so a replica that is behind would hand the sample that old data and the merge would
    // drop `visible`. Store exactly what the sample's first write stores, and wait until it is stable, so that old and new
    // state read the same.
    await retryTransient(
      () =>
        pubnub.objects.setChannelMetadata({
          channel: 'team.red',
          data: {
            name: 'Red Team',
            description: 'The channel for Red team.',
            custom: { visible: 'team' },
          },
        }),
      { label: 'seed team.red' },
    );
    await settled(
      async () => {
        const stored = await observer().objects.getChannelMetadata({
          channel: 'team.red',
          include: { customFields: true },
        });
        assert.deepEqual(stored.data.custom, { visible: 'team' });
        assert.equal(stored.data.name, 'Red Team');
        assert.equal(stored.data.description, 'The channel for Red team.');
      },
      { timeout: 45_000, label: 'team.red holds the state the sample writes first' },
    );

    // snippet.iterativelyUpdateExistingMetadata
    const channel = 'team.red';
    const name = 'Red Team';
    const description = 'The channel for Red team.';
    const customField = { visible: 'team' };

    // Function to set and then update channel metadata
    const response = await pubnub.objects.setChannelMetadata({
      channel: channel,
      data: {
        name: name,
        description: description,
        custom: customField,
      },
    });
    console.log('The channel has been created with name and description.\n');

    // Fetch current object with custom fields
    const currentObjectResponse = await pubnub.objects.getChannelMetadata({
      channel: channel,
      include: {
        customFields: true,
      },
    });
    const currentObject = currentObjectResponse.data;

    // Initialize the custom field object
    const custom = currentObject.custom || {};

    // Add or update the field
    custom['edit'] = 'admin';

    // Writing the updated object back to the server
    const setResponse = await pubnub.objects.setChannelMetadata({
      channel: channel,
      data: {
        name: currentObject.name || '',
        description: currentObject.description || '',
        custom: custom,
      },
    });
    console.log('Object has been updated', setResponse);
    // snippet.end

    assert.equal(response.status, 200);
    // The sample's first write replaces the whole custom object, so the final state is exact whatever was there before.
    const reader = observer();
    await eventually(
      async () => {
        const stored = await reader.objects.getChannelMetadata({
          channel: 'team.red',
          include: { customFields: true },
        });
        assert.deepEqual(stored.data.custom, { visible: 'team', edit: 'admin' });
        assert.equal(stored.data.description, 'The channel for Red team.');
      },
      { label: 'updated channel metadata visible to another client' },
    );
  });

  it('removeChannelMetadataBasicUsage: removeChannelMetadata deletes the channel and reads fail afterwards', async () => {
    const pubnub = shopper();
    await retryTransient(
      () => friend().objects.setChannelMetadata({ channel: 'team.red', data: { name: 'Red Team' } }),
      { label: 'seed app context' },
    );

    // snippet.removeChannelMetadataBasicUsage
    const response = await pubnub.objects.removeChannelMetadata({
      channel: 'team.red',
    });
    // snippet.end

    assert.equal(response.status, 200);
    const reader = observer();
    await eventually(
      async () => {
        await assert.rejects(reader.objects.getChannelMetadata({ channel: 'team.red' }));
      },
      { label: 'team.red removed' },
    );
  });

  // ---- memberships ----------------------------------------------------------------------------------------------

  it('setMembershipBasicUsage: setMemberships stores a membership, and a second read with include flags shows the type and custom data', async () => {
    const pubnub = shopper();
    // Reset approach: both users start without memberships, so the response lists are exactly the two channels.
    await clearMemberships(SHOPPER);
    await clearMemberships('my-uuid');

    // snippet.setMembershipBasicUsage
    // Using UUID from the config
    const response = await pubnub.objects.setMemberships({
      channels: [
        'my-channel',
        { id: 'channel-with-status-type', custom: { hello: 'World' }, status: 'helloStatus', type: 'helloType' },
      ],
    });
    console.log('Set memberships response:', response);

    // Using the passed in UUID
    const response2 = await pubnub.objects.setMemberships({
      uuid: 'my-uuid',
      channels: [
        'my-channel',
        { id: 'channel-with-status-type', custom: { hello: 'World' }, status: 'helloStatus', type: 'helloType' },
      ],
      include: {
        // To include channel fields in response
        channelFields: true,
      },
    });
    console.log('Set memberships response:', response2);
    // snippet.end

    const expected = ['channel-with-status-type', 'my-channel'];
    assert.deepEqual(response.data.map((m) => m.channel.id).sort(), expected);
    assert.deepEqual(response2.data.map((m) => m.channel.id).sort(), expected);
    assert.equal(response.data.find((m) => m.channel.id === 'channel-with-status-type')?.status, 'helloStatus');
    const reader = observer();
    await eventually(
      async () => {
        const stored = await reader.objects.getMemberships({
          uuid: 'my-uuid',
          include: { typeField: true, statusField: true, customFields: true },
        });
        assert.deepEqual(stored.data.map((m) => m.channel.id).sort(), expected);
        const special = stored.data.find((m) => m.channel.id === 'channel-with-status-type');
        assert.equal(special?.status, 'helloStatus');
        assert.equal(special?.type, 'helloType');
        assert.deepEqual(special?.custom, { hello: 'World' });
      },
      { label: 'stored memberships visible to another client' },
    );
  });

  it('getMembershipBasicUsage: getMemberships with the starred filter returns exactly the one starred membership', async () => {
    const pubnub = shopper();
    const admin = friend();
    // Reset approach, then seed: `myUuid` has one starred membership, the shopper has the same two channels.
    await clearMemberships(SHOPPER);
    await clearMemberships('myUuid');
    await retryTransient(
      () =>
        admin.objects.setMemberships({
          uuid: 'myUuid',
          channels: [
            { id: 'my-channel', custom: { starred: true } },
            { id: 'channel-with-status-type', custom: { starred: false } },
          ],
        }),
      { label: 'seed app context' },
    );
    await retryTransient(
      () => admin.objects.setMemberships({ uuid: SHOPPER, channels: ['my-channel', 'channel-with-status-type'] }),
      { label: 'seed app context' },
    );
    // The sample lists both users and the starred filter (an index) once each, so wait until the same reads hold on consecutive polls.
    const reader = observer();
    await settled(
      async () => {
        assert.equal((await reader.objects.getMemberships({ uuid: 'myUuid' })).data.length, 2);
        assert.equal((await reader.objects.getMemberships({ uuid: SHOPPER })).data.length, 2);
        const starred = await reader.objects.getMemberships({ uuid: 'myUuid', filter: 'custom.starred == true' });
        assert.deepEqual(
          starred.data.map((m) => m.channel.id),
          ['my-channel'],
        );
      },
      { label: 'memberships seeded' },
    );

    // snippet.getMembershipBasicUsage
    // Using UUID from the config
    const response = await pubnub.objects.getMemberships();

    // Using the passed in UUID
    const response2 = await pubnub.objects.getMemberships({
      uuid: 'myUuid',
      include: {
        channelFields: true,
      },
    });

    // Get all memberships that are starred by the user
    const response3 = await pubnub.objects.getMemberships({
      uuid: 'myUuid',
      filter: 'custom.starred == true',
    });
    // snippet.end

    assert.deepEqual(response.data.map((m) => m.channel.id).sort(), ['channel-with-status-type', 'my-channel']);
    assert.equal(response2.data.length, 2);
    assert.ok(
      response2.data.every((m) => m.channel.id),
      'channel ids are part of the response',
    );
    assert.deepEqual(
      response3.data.map((m) => m.channel.id),
      ['my-channel'],
    );
  });

  it('removeMembershipsBasicUsage: removeMemberships removes the named memberships and keeps the others', async () => {
    const pubnub = shopper();
    const admin = friend();
    // Reset approach, then seed three memberships per user.
    for (const uuid of [SHOPPER, 'myUuid']) {
      await clearMemberships(uuid);
      await retryTransient(() => admin.objects.setMemberships({ uuid, channels: ['ch-1', 'ch-2', 'my-channel'] }), {
        label: 'seed app context',
      });
    }
    const reader = observer();
    await settled(
      async () => {
        for (const uuid of [SHOPPER, 'myUuid']) {
          assert.equal((await reader.objects.getMemberships({ uuid })).data.length, 3);
        }
      },
      { label: 'memberships seeded' },
    );

    // snippet.removeMembershipsBasicUsage
    // Using UUID from the config
    const response = await pubnub.objects.removeMemberships({
      channels: ['ch-1', 'ch-2'],
    });

    // Using the passed in UUID
    const response2 = await pubnub.objects.removeMemberships({
      uuid: 'myUuid',
      channels: ['ch-1', 'ch-2'],
    });
    // snippet.end

    for (const result of [response, response2]) {
      assert.deepEqual(
        result.data.map((m) => m.channel.id),
        ['my-channel'],
        'only my-channel stays',
      );
    }
    await eventually(
      async () => {
        const left = await reader.objects.getMemberships({ uuid: 'myUuid' });
        assert.deepEqual(
          left.data.map((m) => m.channel.id),
          ['my-channel'],
        );
      },
      { label: 'memberships removed' },
    );
  });

  // ---- channel members ------------------------------------------------------------------------------------------

  /** Stores the two users of the member samples, so the `name` filter and the user fields have something to match. */
  async function seedUsers(): Promise<void> {
    const admin = friend();
    await retryTransient(
      () => admin.objects.setUUIDMetadata({ uuid: 'uuid-1', data: { name: 'Member One', custom: { role: 'Member' } } }),
      { label: 'seed app context' },
    );
    await retryTransient(() => admin.objects.setUUIDMetadata({ uuid: 'uuid-2', data: { name: 'Team admin' } }), {
      label: 'seed app context',
    });
  }

  it('getChannelMembersBasicUsage: getChannelMembers with the admin filter returns only the matching member', async () => {
    const pubnub = shopper();
    // Reset approach: myChannel starts without members, then gets exactly uuid-1 and uuid-2.
    await clearMembers('myChannel');
    await seedUsers();
    await retryTransient(
      () => friend().objects.setChannelMembers({ channel: 'myChannel', uuids: ['uuid-1', 'uuid-2'] }),
      { label: 'seed app context' },
    );
    // The sample lists the members with their user fields and filters them by user name (an index), so wait until the same reads hold.
    const reader = observer();
    await settled(
      async () => {
        const members = await reader.objects.getChannelMembers({ channel: 'myChannel', include: { UUIDFields: true } });
        assert.deepEqual(members.data.map((m) => m.uuid.id).sort(), ['uuid-1', 'uuid-2']);
        assert.equal(
          (members.data.find((m) => m.uuid.id === 'uuid-1')?.uuid as { name?: string } | undefined)?.name,
          'Member One',
        );
        const admins = await reader.objects.getChannelMembers({
          channel: 'myChannel',
          filter: 'uuid.name LIKE "*admin*"',
        });
        assert.deepEqual(
          admins.data.map((m) => m.uuid.id),
          ['uuid-2'],
        );
      },
      { label: 'members seeded and name filter indexed' },
    );

    // snippet.getChannelMembersBasicUsage
    const response = await pubnub.objects.getChannelMembers({
      channel: 'myChannel',
      include: {
        UUIDFields: true,
      },
    });
    console.log('getChannelMembers response:', response);

    // Get all channel members with "admin" in the user name
    const response2 = await pubnub.objects.getChannelMembers({
      channel: 'myChannel',
      filter: 'uuid.name LIKE "*admin*"',
    });
    console.log('getChannelMembers response:', response2);
    // snippet.end

    assert.deepEqual(response.data.map((m) => m.uuid.id).sort(), ['uuid-1', 'uuid-2']);
    assert.equal(
      (response.data.find((m) => m.uuid.id === 'uuid-1')?.uuid as { name?: string } | undefined)?.name,
      'Member One',
    );
    assert.deepEqual(
      response2.data.map((m) => m.uuid.id),
      ['uuid-2'],
      'the name filter keeps the admin only',
    );
  });

  it('setChannelMembersBasicUsage: setChannelMembers adds a member with a custom role and another client reads it back', async () => {
    const pubnub = shopper();
    await clearMembers('myChannel');
    await seedUsers();

    // snippet.setChannelMembersBasicUsage
    const response = await pubnub.objects.setChannelMembers({
      channel: 'myChannel',
      uuids: ['uuid-1', 'uuid-2', { id: 'uuid-3', custom: { role: 'Super Admin' } }],
    });
    console.log('setChannelMembers response:', response);
    // snippet.end

    assert.deepEqual(response.data.map((m) => m.uuid.id).sort(), ['uuid-1', 'uuid-2', 'uuid-3']);
    const reader = observer();
    await eventually(
      async () => {
        const stored = await reader.objects.getChannelMembers({
          channel: 'myChannel',
          include: { customFields: true },
        });
        assert.deepEqual(stored.data.find((m) => m.uuid.id === 'uuid-3')?.custom, { role: 'Super Admin' });
        assert.deepEqual(sorted(stored.data.map((m) => m.uuid.id)), ['uuid-1', 'uuid-2', 'uuid-3']);
      },
      { label: 'stored channel members visible to another client' },
    );
  });

  it('removeChannelMembersBasicUsage: removeChannelMembers removes members by id and leaves the others', async () => {
    const pubnub = shopper();
    await clearMembers('myChannel');
    await seedUsers();
    await retryTransient(
      () =>
        friend().objects.setChannelMembers({
          channel: 'myChannel',
          uuids: ['uuid-1', 'uuid-2', { id: 'uuid-3', custom: { role: 'Super Admin' } }],
        }),
      { label: 'seed app context' },
    );
    const reader = observer();
    await settled(
      async () => {
        assert.equal((await reader.objects.getChannelMembers({ channel: 'myChannel' })).data.length, 3);
      },
      { label: 'members seeded' },
    );

    // snippet.removeChannelMembersBasicUsage
    const response = await pubnub.objects.removeChannelMembers({
      channel: 'myChannel',
      uuids: ['uuid-1', 'uuid-2'],
    });
    // snippet.end

    assert.deepEqual(
      response.data.map((m) => m.uuid.id),
      ['uuid-3'],
    );
    await eventually(
      async () => {
        const left = await reader.objects.getChannelMembers({ channel: 'myChannel' });
        assert.deepEqual(
          left.data.map((m) => m.uuid.id),
          ['uuid-3'],
        );
      },
      { label: 'members removed' },
    );
  });
});
