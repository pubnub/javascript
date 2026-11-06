import assert from '../harness/assert.js';
import { page, step, check } from '../harness/step.js';
import { eventually, watch } from '../harness/wait.js';
import { explainError } from '../harness/guard.js';

/**
 * App Context examples.
 */
export default page('api-reference/objects', 'P3', (world) => {
  // Sorted ids, so list assertions do not depend on service ordering.
  const ids = (list: Array<{ id: string }>): string[] => list.map((o) => o.id).sort();

  check('preflightAppContext', { phase: 'P0', proves: 'Preflight: the open keyset has App Context enabled, otherwise the App Context steps are blocked.' }, async () => {
    try {
      await world.observer.objects.getAllUUIDMetadata({ limit: 1 });
    } catch (error) {
      explainError(error);
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`The open keyset does not have App Context. Enable "App Context" for it. ${detail}`);
    }
  });

  check('appContextFixture', { needs: ['preflightAppContext'], proves: 'Fixture: a seed channel exists and is readable from another client.' }, async () => {
    // The channel the docs read (`team.blue`), named so that the "*Team" filter finds it.
    await world.friend.objects.setChannelMetadata({
      channel: world.n('team.blue'),
      data: { name: 'Blue Team', description: 'The channel for Blue team.' },
    });
    await eventually(async () => {
      const blue = await world.observer.objects.getChannelMetadata({ channel: world.n('team.blue') });
      assert.equal(blue.data.name, 'Blue Team');
    }, { label: 'team.blue visible' });
  });

  // ---- users ----------------------------------------------------------------------------------------------------

  step('setUUIDMetadataBasicUsage', { needs: ['appContextFixture'], proves: 'setUUIDMetadata stores the user and another client reads it back.' }, async () => {
    const pubnub = world.shopper;
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
    assert.equal(response2.data.id, world.n('myUuid'));
    assert.equal(response2.data.email, 'john.doe@example.com');
    await eventually(async () => {
      const stored = await world.observer.objects.getUUIDMetadata({ uuid: world.n('myUuid') });
      assert.equal(stored.data.email, 'john.doe@example.com');
    }, { label: 'stored user visible to another client' });
  });

  step('getUUIDMetadataBasicUsage', { needs: ['setUUIDMetadataBasicUsage'], proves: 'getUUIDMetadata reads the user the previous step stored.' }, async () => {
    const pubnub = world.shopper;
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
    assert.equal(response2.data.id, world.n('myUuid'));
    assert.equal(response2.data.email, 'john.doe@example.com');
  });

  step('getAllUUIDMetadataBasicUsage', { needs: ['setUUIDMetadataBasicUsage'], proves: 'getAllUUIDMetadata runs the sample function and logs the user list.' }, async () => {
    const pubnub = world.shopper;
    const logs = world.captureConsole('log');
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
      assert.ok(logs.lines.some((line) => line.startsWith('getAllUUIDMetadata response:')), 'the function logged its response');
    } finally {
      logs.restore();
    }
    const listed = await pubnub.objects.getAllUUIDMetadata({ limit: 100, sort: { updated: 'desc' } });
    assert.ok(listed.data.some((u) => u.id === world.n('myUuid')), 'the stored user is part of the list');
  });

  step('removeUUIDMetadataBasicUsage', { phase: 'P9', needs: ['getUUIDMetadataBasicUsage', 'getAllUUIDMetadataBasicUsage'], proves: 'removeUUIDMetadata deletes the users and reads fail with not found afterwards.' }, async () => {
    const pubnub = world.shopper;
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
    await eventually(async () => {
      for (const uuid of [pubnub.getUserId(), world.n('myUuid')]) {
        await assert.rejects(world.observer.objects.getUUIDMetadata({ uuid }), `${uuid} is gone`);
      }
    }, { label: 'users removed' });
  });

  // ---- channels -------------------------------------------------------------------------------------------------

  // The `*Team` filter needs a channel named `... Team`, which the fixture created with the name `Blue Team`.
  step('getAllChannelMetadataBasicUsage', { needs: ['appContextFixture'], proves: 'getAllChannelMetadata with the Team filter returns the seeded channel.' }, async () => {
    const pubnub = world.shopper;
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
    assert.ok(response2.data.every((c) => c.name?.endsWith('Team')), 'every match ends with Team');
    assert.ok(ids(response2.data).includes(world.n('team.blue')), 'team.blue is in the filtered list');
  });

  step('getChannelMetadataBasicUsage', { needs: ['appContextFixture'], proves: 'getChannelMetadata reads the seeded channel by id.' }, async () => {
    const pubnub = world.shopper;
    // snippet.getChannelMetadataBasicUsage
    const response = await pubnub.objects.getChannelMetadata({
      // `channel` is the `id` in the _metadata_, not `name`
      channel: 'team.blue',
    });
    console.log('Get channel metadata response:', response);
    // snippet.end
    assert.equal(response.data.id, world.n('team.blue'));
    assert.equal(response.data.name, 'Blue Team');
  });

  step('setChannelMetadataBasicUsage', { needs: ['appContextFixture'], proves: 'setChannelMetadata stores the channel, an observer gets the set event and the hidden custom data was stored.' }, async () => {
    const pubnub = world.shopper;
    // Channel scoped objects events arrive on a subscription to the channel itself.
    const listening = await watch(world.fresh('objectsobserver'), [world.n('team.red')]);
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
    assert.equal(response.data.id, world.n('team.red'));
    assert.equal(response.data.name, 'Red Team');
    assert.equal(response.data.custom, undefined, 'customFields: false leaves custom out of the response');
    await eventually(async () => {
      const stored = await world.observer.objects.getChannelMetadata({ channel: world.n('team.red'), include: { customFields: true } });
      assert.deepEqual(stored.data.custom, { owner: 'Red Leader' });
    }, { label: 'stored channel custom data visible to another client' });
    const event = await listening.next('objects', (e) => e.channel === world.n('team.red'));
    assert.equal(event.message.event, 'set');
    assert.equal(event.message.type, 'channel');
    listening.stop();
  });

  step('iterativelyUpdateExistingMetadata', { needs: ['setChannelMetadataBasicUsage'], proves: 'The read-modify-write pattern merges custom data and the merged object survives on the service.' }, async () => {
    const pubnub = world.shopper;
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
    await eventually(async () => {
      const stored = await world.observer.objects.getChannelMetadata({ channel: world.n('team.red'), include: { customFields: true } });
      assert.deepEqual(stored.data.custom, { visible: 'team', edit: 'admin' });
      assert.equal(stored.data.description, 'The channel for Red team.');
    }, { label: 'updated channel metadata visible to another client' });
  });

  step('removeChannelMetadataBasicUsage', { phase: 'P9', needs: ['iterativelyUpdateExistingMetadata'], proves: 'removeChannelMetadata deletes the channel and reads fail afterwards.' }, async () => {
    const pubnub = world.shopper;
    // snippet.removeChannelMetadataBasicUsage
    const response = await pubnub.objects.removeChannelMetadata({
      channel: 'team.red',
    });
    // snippet.end
    assert.equal(response.status, 200);
    await eventually(async () => {
      await assert.rejects(world.observer.objects.getChannelMetadata({ channel: world.n('team.red') }));
    }, { label: 'team.red removed' });
  });

  // ---- memberships ----------------------------------------------------------------------------------------------

  step('setMembershipBasicUsage', { needs: ['appContextFixture'], proves: 'setMemberships stores a membership, and a second read with include flags shows the type and custom data.' }, async () => {
    const pubnub = world.shopper;
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
    const expected = [world.n('channel-with-status-type'), world.n('my-channel')].sort();
    assert.deepEqual(response.data.map((m) => m.channel.id).sort(), expected);
    assert.deepEqual(response2.data.map((m) => m.channel.id).sort(), expected);
    assert.equal(response.data.find((m) => m.channel.id === world.n('channel-with-status-type'))?.status, 'helloStatus');
    await eventually(async () => {
      const stored = await world.observer.objects.getMemberships({
        uuid: world.n('my-uuid'),
        include: { typeField: true, statusField: true, customFields: true },
      });
      assert.deepEqual(stored.data.map((m) => m.channel.id).sort(), expected);
      const special = stored.data.find((m) => m.channel.id === world.n('channel-with-status-type'));
      assert.equal(special?.status, 'helloStatus');
      assert.equal(special?.type, 'helloType');
      assert.deepEqual(special?.custom, { hello: 'World' });
    }, { label: 'stored memberships visible to another client' });
  });

  step('getMembershipBasicUsage', { needs: ['setMembershipBasicUsage'], proves: 'getMemberships with the starred filter returns exactly the one starred membership.' }, async () => {
    const pubnub = world.shopper;
    // Seed the user the docs read: `myUuid` has one starred membership.
    await world.friend.objects.setMemberships({
      uuid: world.n('myUuid'),
      channels: [{ id: world.n('my-channel'), custom: { starred: true } }, { id: world.n('channel-with-status-type'), custom: { starred: false } }],
    });
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
    assert.deepEqual(response.data.map((m) => m.channel.id).sort(), [world.n('channel-with-status-type'), world.n('my-channel')].sort());
    assert.equal(response2.data.length, 2);
    assert.ok(response2.data.every((m) => m.channel.id), 'channel ids are part of the response');
    assert.deepEqual(response3.data.map((m) => m.channel.id), [world.n('my-channel')]);
  });

  step('removeMembershipsBasicUsage', { phase: 'P9', needs: ['getMembershipBasicUsage'], proves: 'removeMemberships removes the named memberships and keeps the others.' }, async () => {
    const pubnub = world.shopper;
    for (const uuid of [pubnub.getUserId(), world.n('myUuid')]) {
      await world.friend.objects.setMemberships({ uuid, channels: [world.n('ch-1'), world.n('ch-2'), world.n('my-channel')] });
    }
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
      assert.ok(!result.data.some((m) => [world.n('ch-1'), world.n('ch-2')].includes(m.channel.id)), 'ch-1 and ch-2 are gone');
      assert.ok(result.data.some((m) => m.channel.id === world.n('my-channel')), 'my-channel stays');
    }
    await eventually(async () => {
      const left = await world.observer.objects.getMemberships({ uuid: world.n('myUuid') });
      assert.ok(!left.data.some((m) => m.channel.id === world.n('ch-1')));
    }, { label: 'memberships removed' });
  });

  // ---- channel members ------------------------------------------------------------------------------------------

  step('getChannelMembersBasicUsage', { needs: ['appContextFixture'], proves: 'getChannelMembers with the admin filter returns only the matching member.' }, async () => {
    const pubnub = world.shopper;
    await world.friend.objects.setUUIDMetadata({ uuid: world.n('uuid-1'), data: { name: 'Member One', custom: { role: 'Member' } } });
    await world.friend.objects.setUUIDMetadata({ uuid: world.n('uuid-2'), data: { name: 'Team admin' } });
    await world.friend.objects.setChannelMembers({
      channel: world.n('myChannel'),
      uuids: [world.n('uuid-1'), world.n('uuid-2')],
    });
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
    assert.deepEqual(response.data.map((m) => m.uuid.id).sort(), [world.n('uuid-1'), world.n('uuid-2')].sort());
    assert.equal((response.data.find((m) => m.uuid.id === world.n('uuid-1'))?.uuid as { name?: string } | undefined)?.name, 'Member One');
    assert.deepEqual(response2.data.map((m) => m.uuid.id), [world.n('uuid-2')], 'the name filter keeps the admin only');
  });

  // Adds `uuid-3` with a custom role, then reads it back through the observer.
  step('setChannelMembersBasicUsage', { needs: ['getChannelMembersBasicUsage'], proves: 'setChannelMembers adds a member with a custom role and another client reads it back.' }, async () => {
    const pubnub = world.shopper;
    // snippet.setChannelMembersBasicUsage
    const response = await pubnub.objects.setChannelMembers({
      channel: 'myChannel',
      uuids: ['uuid-1', 'uuid-2', { id: 'uuid-3', custom: { role: 'Super Admin' } }],
    });
    console.log('setChannelMembers response:', response);
    // snippet.end
    assert.deepEqual(response.data.map((m) => m.uuid.id).sort(), [world.n('uuid-1'), world.n('uuid-2'), world.n('uuid-3')].sort());
    await eventually(async () => {
      const stored = await world.observer.objects.getChannelMembers({ channel: world.n('myChannel'), include: { customFields: true } });
      assert.deepEqual(stored.data.find((m) => m.uuid.id === world.n('uuid-3'))?.custom, { role: 'Super Admin' });
    }, { label: 'stored channel members visible to another client' });
  });

  step('removeChannelMembersBasicUsage', { phase: 'P9', needs: ['setChannelMembersBasicUsage'], proves: 'removeChannelMembers removes one member by id and leaves the others.' }, async () => {
    const pubnub = world.shopper;
    // snippet.removeChannelMembersBasicUsage
    const response = await pubnub.objects.removeChannelMembers({
      channel: 'myChannel',
      uuids: ['uuid-1', 'uuid-2'],
    });
    // snippet.end
    assert.deepEqual(response.data.map((m) => m.uuid.id), [world.n('uuid-3')]);
    await eventually(async () => {
      const left = await world.observer.objects.getChannelMembers({ channel: world.n('myChannel') });
      assert.deepEqual(left.data.map((m) => m.uuid.id), [world.n('uuid-3')]);
    }, { label: 'members removed' });
  });
});
