import PubNub from '../../lib/types';

const pubnub = new PubNub({
    publishKey: 'demo',
    subscribeKey: 'demo',
    userId: 'myUniqueUserId'
  });

  // snippet.getAllUUIDMetadataBasicUsage
// Function to get all UUID metadata
// to get some data in response, add user metadata using setUUIDMetadata method
async function getAllUUIDMetadata() {
  try {
    const response = await pubnub.objects.getAllUUIDMetadata();
    console.log(`getAllUUIDMetadata response: ${response}`);
  } catch (error) {
    console.log(`getAllUUIDMetadata failed with error: ${error}`);
  }
}

// Execute the function to get UUID metadata
getAllUUIDMetadata();
// snippet.end

// snippet.getUUIDMetadataBasicUsage
// Using UUID from the config  - default when uuid is not passed in the method
try {
    const response = await pubnub.objects.getUUIDMetadata();
    console.log(`getUUIDMetadata response: ${response}`);
} catch (status) {
    console.log(`getUUIDMetadata failed with error: ${status}`);
}

// Using the passed in UUID
try {
    const response = await pubnub.objects.getUUIDMetadata({
        uuid: "myUuid",
    });
    console.log(`getUUIDMetadata response: ${response}`);
} catch (status) {
    console.log(`getUUIDMetadata failed with error: ${status}`);
}
// snippet.end

// snippet.setUUIDMetadataBasicUsage
// Using UUID from the config  - default when uuid is not passed in the method
try {
    const response = await pubnub.objects.setUUIDMetadata({
        data: {
            name: "John Doe",
        },
    });
} catch (status) {
    console.log(`setUUIDMetadata failed with error: ${status}`);
}

// Using the passed in UUID
try {
    const response = await pubnub.objects.setUUIDMetadata({
        uuid: "myUuid",
        data: {},
    });
    console.log(`setUUIDMetadata response: ${response}`);
} catch (status) {
    console.log(`setUUIDMetadata failed with error: ${status}`);
}

// snippet.end

// snippet.removeUUIDMetadataBasicUsage
// Using UUID from the config  - default when uuid is not passed in the method
try {
    const response = await pubnub.objects.removeUUIDMetadata();
} catch (status) {
    console.log(`removeUUIDMetadata failed with error: ${status}`);
}

// Using the passed in UUID
try {
    const response = await pubnub.objects.removeUUIDMetadata({
        uuid: "myUuid",
    });
} catch (status) {
    console.log(`removeUUIDMetadata failed with error: ${status}`);
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
} catch (status) {
    console.log(`getAllChannelMetadata failed with error: ${status}`);
}

// Get all channels with the filter option. To get all channel which has Id ending 'Team'.
try {
    const response = await pubnub.objects.getAllChannelMetadata({
        filter: 'name LIKE "*Team"',
    });
    console.log(`getAllChannelMetadata response: ${response}`);
} catch (status) {
    console.log(`getAllChannelMetadata failed with error: ${status}`);
}
// snippet.end

// snippet.getChannelMetadataBasicUsage
try {
    const response = await pubnub.objects.getChannelMetadata({
        // `channel` is the `id` in the _metadata_, not `name`
        channel: "team.blue",
    });
} catch (status) {
    console.log(`getChannelMetadata failed with error: ${status}`);
}
// snippet.end

// snippet.setChannelMetadataBasicUsage
try {
    const response = await pubnub.objects.setChannelMetadata({
        channel: "team.red",
        data: {
            name: "Red Team",
            description: "The channel for Red team and no other teams.",
            custom: {
                owner: "Red Leader",
            },
        },
        include: {
            customFields: false,
        },
    });
} catch (status) {
    console.log(`setChannelMetadata failed with error: ${status}`);
}
// snippet.end

// snippet.removeChannelMetadataBasicUsage
try {
    const response = await pubnub.objects.removeChannelMetadata({
        channel: "team.red",
    });
} catch (status) {
    console.log(`removeChannelMetadata failed with error: ${status}`);
}
// snippet.end

// snippet.getMembershipBasicUsage
// Using UUID from the config
try {
    const response = await pubnub.objects.getMemberships();
} catch (status) {
    console.log(`getMemberships failed with error: ${status}`);
}

// Using the passed in UUID
try {
    const response = await pubnub.objects.getMemberships({
        uuid: "myUuid",
        include: {
            channelFields: true,
        },
    });
} catch (status) {
    console.log(`getMemberships failed with error: ${status}`);
}

// Get all memberships that are starred by the user
try {
    const response = await pubnub.objects.getMemberships({
        uuid: "myUuid",
        filter: "custom.starred == true",
    });
} catch (status) {
    console.log(`getMemberships failed with error: ${status}`);
}
// snippet.end

// snippet.setMembershipBasicUsage
// Using UUID from the config
try {
    const response = await pubnub.objects.setMemberships({
        channels: [
                    "my-channel",
                    { id: "channel-with-status-type", custom: { hello: "World" }, status: 'helloStatus', type:'helloType'}
                  ]
    });
} catch (status) {
    console.log(`setMemberships failed with error: ${status}`);
}

// Using the passed in UUID
try {
    const response = await pubnub.objects.setMemberships({
        uuid: "my-uuid",
        channels: [
                    "my-channel",
                    { id: "channel-with-status-type", custom: { hello: "World" }, status: 'helloStatus', type:'helloType'}
                  ],
        include: {
            // To include channel fields in response
            channelFields: true,
        },
    });
    console.log(`setMemberships response: ${response}`);
} catch (status) {
    console.log(`setMemberships failed with error: ${status}`);
}
// snippet.end

// snippet.removeMembershipsBasicUsage
// Using UUID from the config
try {
    const response = await pubnub.objects.removeMemberships({
        channels: ["ch-1", "ch-2"],
    });
} catch (status) {
    console.log(`removeMemberships failed with error: ${status}`);
}

// Using the passed in UUID
try {
    const response = await pubnub.objects.removeMemberships({
        uuid: "myUuid",
        channels: ["ch-1", "ch-2"],
    });
} catch (status) {
    console.log(`removeMemberships failed with error: ${status}`);
}
// snippet.end

// snippet.getChannelMembersBasicUsage
try {
    const response = await pubnub.objects.getChannelMembers({
        channel: "myChannel",
        include: {
            UUIDFields: true,
        },
    });
    console.log(`getChannelMembers response: ${response}`);
} catch (status) {
    console.log(`getChannelMembers failed with error: ${status}`);
}

// Get all channel members with "admin" in the description
try {
    const response = await pubnub.objects.getChannelMembers({
        channel: "myChannel",
        filter: 'description LIKE "*admin*"',
    });
    console.log(`getChannelMembers response: ${response}`);
} catch (status) {
    console.log(`getChannelMembers failed with error: ${status}`);
}
// snippet.end

// snippet.setChannelMembersBasicUsage
try {
    const response = await pubnub.objects.setChannelMembers({
        channel: "myChannel",
        uuids: [
            "uuid-1",
            "uuid-2",
            { id: "uuid-3", custom: { role: "Super Admin" } },
        ],
    });
    console.log(`setChannelMembers response: ${response}`);
} catch (status) {
    console.log(`setChannelMembers failed with error: ${status}`);
}
// snippet.end

// snippet.removeChannelMembersBasicUsage
try {
    const response = await pubnub.objects.removeChannelMembers({
        channel: "myChannel",
        uuids: ["uuid-1", "uuid-2"],
    });
} catch (status) {
    console.log(`removeChannelMembers failed with error: ${status}`);
}
// snippet.end
