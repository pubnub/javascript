import PubNub, { PubNubError } from '../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'myUniqueUserId',
});

// snippet.grantTokenVariousResources
try {
  const token = await pubnub.grantToken({
    ttl: 15,
    authorized_uuid: 'my-authorized-uuid',
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
} catch (error) {
  console.error(
    `Grant token error: ${error}.${(error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''}`,
  );
}
// snippet.end

// snippet.grantTokenUsingRegEx
try {
  const token = await pubnub.grantToken({
    ttl: 15,
    authorized_uuid: 'my-authorized-uuid',
    patterns: {
      channels: {
        '^channel-[A-Za-z0-9]$': {
          read: true,
        },
      },
    },
  });
} catch (error) {
  console.error(
    `Grant token error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.grantTokenRegExAndResources
try {
  const token = await pubnub.grantToken({
    ttl: 15,
    authorized_uuid: 'my-authorized-uuid',
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
} catch (error) {
  console.error(
    `Grant token error: ${error}.${(error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''}`,
  );
}
// snippet.end
