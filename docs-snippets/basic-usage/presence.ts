import PubNub from '../../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'myUniqueUserId',
});

// snippet.hereNowBasicUsage
// Function to get presence information for a channel
async function getHereNow() {
  try {
    const result = await pubnub.hereNow({
      channels: ['ch1'],
      channelGroups: ['cg1'],
      includeUUIDs: true,
      includeState: true,
    });
    console.log(`Here Now Result: ${result}`);
  } catch (error) {
    console.log(`Here Now failed with error: ${error}`);
  }
}

// Execute the function to get presence information
getHereNow();

// snippet.end

// snippet.whereNowBasicUsage
try {
  const response = await pubnub.whereNow({
    uuid: 'uuid',
  });
} catch (status) {
  console.log(status);
}
// snippet.end

// snippet.setStateBasicUsage
try {
  const response = await pubnub.setState({
    state: { status: 'online' },
    channels: ['ch1'],
    channelGroups: ['cg1'],
  });
} catch (status) {
  console.log(status);
}
// snippet.end

// snippet.getStateBasicUsage
try {
  const response = await pubnub.getState({
    uuid: 'uuid',
    channels: ['ch1'],
    channelGroups: ['cg1'],
  });
} catch (status) {
  console.log(status);
}
// snippet.end


// snippet.basicUsageWithPromises
pubnub.hereNow({
  channels: ["ch1"],
  channelGroups : ["cg1"],
  includeUUIDs: true,
  includeState: true
}).then((response) => {
  console.log(response)
}).catch((error) => {
  console.log(error)
});
// snippet.end