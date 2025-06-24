import PubNub, { PubNubError } from '../../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'myUniqueUserId',
});

// snippet.hereNowBasicUsage
// Function to get presence information for a channel
try {
  const result = await pubnub.hereNow({
    channels: ['ch1'],
    channelGroups: ['cg1'],
    includeUUIDs: true,
    includeState: true,
  });
  console.log('Here Now Result:', result);
} catch (error) {
  console.error(
    `Here Now failed with error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.whereNowBasicUsage
try {
  const response = await pubnub.whereNow({
    uuid: 'uuid',
  });
  console.log('State set successfully:', response);
} catch (error) {
  console.error(
    `State set failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.setStateBasicUsage
try {
  const response = await pubnub.setState({
    state: { status: 'online' },
    channels: ['ch1'],
    channelGroups: ['cg1'],
  });
  console.log('State set successfully:', response);
} catch (error) {
  console.error(
    `State set failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getStateBasicUsage
try {
  const response = await pubnub.getState({
    uuid: 'uuid',
    channels: ['ch1'],
    channelGroups: ['cg1'],
  });
  console.log('State retrieved successfully:', response);
} catch (error) {
  console.error(
    `State retrieval failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.basicUsageWithPromises
pubnub
  .hereNow({
    channels: ['ch1'],
    channelGroups: ['cg1'],
    includeUUIDs: true,
    includeState: true,
  })
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.log(error);
  });
// snippet.end
