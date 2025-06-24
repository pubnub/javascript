import PubNub, { PubNubError } from '../../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'myUniqueUserId',
});

// snippet.getAllUUIDMetadataBasicUsage
// Function to get all UUID metadata
// to get some data in response, add user metadata using setUUIDMetadata method
async function getAllUUIDMetadata() {
  try {
    const response = await pubnub.objects.getAllUUIDMetadata();
    console.log('getAllUUIDMetadata response:', response);
  } catch (error) {
    console.error(
      `Get all UUID metadata error: ${error}.${
        (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
      }`,
    );
  }
}

// Execute the function to get UUID metadata
getAllUUIDMetadata();
// snippet.end

// snippet.getUUIDMetadataBasicUsage
// Using UUID from the config  - default when uuid is not passed in the method
try {
  const response = await pubnub.objects.getUUIDMetadata();
  console.log('getUUIDMetadata response:', response);
} catch (error) {
  console.error(
    `Get UUID metadata error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}

// Using the passed in UUID
try {
  const response = await pubnub.objects.getUUIDMetadata({
    uuid: 'myUuid',
  });
  console.log('getUUIDMetadata response:', response);
} catch (error) {
  console.error(
    `Get UUID metadata error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.setUUIDMetadataBasicUsage
// Using UUID from the config  - default when uuid is not passed in the method
try {
  const response = await pubnub.objects.setUUIDMetadata({
    data: {
      name: 'John Doe',
    },
  });
  console.log('setUUIDMetadata response:', response);
} catch (error) {
  console.error(
    `Set UUID metadata error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}

// Using the passed in UUID
try {
  const response = await pubnub.objects.setUUIDMetadata({
    uuid: 'myUuid',
    data: {
      email: 'john.doe@example.com',
    },
  });
  console.log('setUUIDMetadata response:', response);
} catch (error) {
  console.error(
    `Set UUID metadata error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.removeUUIDMetadataBasicUsage
// Using UUID from the config  - default when uuid is not passed in the method
try {
  const response = await pubnub.objects.removeUUIDMetadata();
} catch (error) {
  console.error(
    `Remove UUID metadata error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}

// Using the passed in UUID
try {
  const response = await pubnub.objects.removeUUIDMetadata({
    uuid: 'myUuid',
  });
} catch (error) {
  console.error(
    `Remove UUID metadata error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getAllChannelMetadataBasicUsage
// Get the total number of channels included in the response.
try {
  const response = await pubnub.objects.getAllChannelMetadata({
    include: {
      totalCount: true,
    },
  });
} catch (error) {
  console.error(
    `Get all channel metadata error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}

// Get all channels with the filter option. To get all channel which has Id ending 'Team'.
try {
  const response = await pubnub.objects.getAllChannelMetadata({
    filter: 'name LIKE "*Team"',
  });
  console.log('Get all channel metadata response:', response);
} catch (error) {
  console.error(
    `Get all channel metadata error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getChannelMetadataBasicUsage
try {
  const response = await pubnub.objects.getChannelMetadata({
    // `channel` is the `id` in the _metadata_, not `name`
    channel: 'team.blue',
  });
  console.log('Get channel metadata response:', response);
} catch (error) {
  console.error(
    `Get channel metadata error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.setChannelMetadataBasicUsage
try {
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
} catch (error) {
  console.error(
    `Set channel metadata error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.removeChannelMetadataBasicUsage
try {
  const response = await pubnub.objects.removeChannelMetadata({
    channel: 'team.red',
  });
} catch (error) {
  console.error(
    `Remove channel metadata error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getMembershipBasicUsage
// Using UUID from the config
try {
  const response = await pubnub.objects.getMemberships();
} catch (error) {
  console.error(
    `Get memberships error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}

// Using the passed in UUID
try {
  const response = await pubnub.objects.getMemberships({
    uuid: 'myUuid',
    include: {
      channelFields: true,
    },
  });
} catch (error) {
  console.error(
    `Get memberships with channels fields included error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}

// Get all memberships that are starred by the user
try {
  const response = await pubnub.objects.getMemberships({
    uuid: 'myUuid',
    filter: 'custom.starred == true',
  });
} catch (error) {
  console.error(
    `Get filtered memberships error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.setMembershipBasicUsage
// Using UUID from the config
try {
  const response = await pubnub.objects.setMemberships({
    channels: [
      'my-channel',
      { id: 'channel-with-status-type', custom: { hello: 'World' }, status: 'helloStatus', type: 'helloType' },
    ],
  });
  console.log('Set memberships response:', response);
} catch (error) {
  console.error(
    `Set memberships error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}

// Using the passed in UUID
try {
  const response = await pubnub.objects.setMemberships({
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
  console.log('Set memberships response:', response);
} catch (error) {
  console.error(
    `Set memberships error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.removeMembershipsBasicUsage
// Using UUID from the config
try {
  const response = await pubnub.objects.removeMemberships({
    channels: ['ch-1', 'ch-2'],
  });
} catch (error) {
  console.error(
    `Remove memberships error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}

// Using the passed in UUID
try {
  const response = await pubnub.objects.removeMemberships({
    uuid: 'myUuid',
    channels: ['ch-1', 'ch-2'],
  });
} catch (error) {
  console.error(
    `Remove memberships for given uuids error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getChannelMembersBasicUsage
try {
  const response = await pubnub.objects.getChannelMembers({
    channel: 'myChannel',
    include: {
      UUIDFields: true,
    },
  });
  console.log('getChannelMembers response:', response);
} catch (error) {
  console.error(
    `Get channel members error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}

// Get all channel members with "admin" in the description
try {
  const response = await pubnub.objects.getChannelMembers({
    channel: 'myChannel',
    filter: 'description LIKE "*admin*"',
  });
  console.log('getChannelMembers response:', response);
} catch (error) {
  console.error(
    `Get channel members error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.setChannelMembersBasicUsage
try {
  const response = await pubnub.objects.setChannelMembers({
    channel: 'myChannel',
    uuids: ['uuid-1', 'uuid-2', { id: 'uuid-3', custom: { role: 'Super Admin' } }],
  });
  console.log('setChannelMembers response:', response);
} catch (error) {
  console.error(
    `Set channel members error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.removeChannelMembersBasicUsage
try {
  const response = await pubnub.objects.removeChannelMembers({
    channel: 'myChannel',
    uuids: ['uuid-1', 'uuid-2'],
  });
} catch (error) {
  console.error(
    `Remove channel members error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end
