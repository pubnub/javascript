import PubNub, { PubNubError } from '../../lib/types';

// Restricting what a fan may do is a server-side operation, so this client is
// configured with the keyset's secret key and runs on your own infrastructure.
const server = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  secretKey: 'demo',
  userId: 'moderation-service',
});

// The fan's own client never holds the secret key. It only applies tokens.
const fanClient = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'fan-42',
});

// snippet.fanBehaviorGrantChatAccess
try {
  const token = await server.grantToken({
    ttl: 60,
    authorizedUserId: 'fan-42',
    resources: {
      channels: {
        'game.chat': { read: true, write: true },
      },
    },
  });
  console.log('token that allows reading and writing chat:', token);
} catch (error) {
  console.error(
    `Granting chat access failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.fanBehaviorMuteFan
try {
  const token = await server.grantToken({
    ttl: 15,
    authorizedUserId: 'fan-42',
    resources: {
      channels: {
        'game.chat': { read: true },
      },
    },
  });
  console.log('token that allows reading chat but not writing to it:', token);
} catch (error) {
  console.error(
    `Muting the fan failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.fanBehaviorRevokeToken
try {
  const response = await server.revokeToken('replace-with-the-token-to-revoke');
  console.log('token revoked:', response);
} catch (error) {
  console.error(
    `Revoking the token failed: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.fanBehaviorApplyToken
fanClient.setToken('replace-with-the-token-your-server-returned');
// snippet.end

// snippet.fanBehaviorHandleAccessDenied
fanClient.addListener({
  status: (event) => {
    if (event.category === 'PNAccessDeniedCategory') {
      console.log('this fan may no longer write to', event.affectedChannels);
    }
  },
});
// snippet.end

// snippet.fanBehaviorInspectToken
const parsed = fanClient.parseToken('replace-with-the-token-to-inspect');

if (parsed) {
  console.log('token expires in', parsed.ttl, 'minutes');
  console.log('channel permissions:', parsed.resources?.channels);
}
// snippet.end
