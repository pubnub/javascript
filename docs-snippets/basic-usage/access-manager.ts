import PubNub, { PubNubError } from '../../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'myUniqueUserId',
});

// snippet.accessManagerBasicUsage
// Function to use grantToken method
try {
  const token = await pubnub.grantToken({
    ttl: 15,
    authorized_uuid: 'my-authorized-uuid',
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
} catch (error) {
  console.error(
    `Grant token error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.revokeTokenBasicUsage
try {
  const response = await pubnub.revokeToken('p0AkFl043rhDdHRsple3KgQ3NwY6BDcENnctokenVzcqBDczaWdYIGOAeTyWGJI');
} catch (error) {
  console.error(
    `Revoke token error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.parseTokenBasicUsage
pubnub.parseToken('p0thisAkFl043rhDdHRsCkNyZXisRGNoYW6hanNlY3JldAFDZ3Jwsample3KgQ3NwY6BDcGF0pERjaGFuoENnctokenVzcqBDc3BjoERtZXRhoENzaWdYIGOAeTyWGJI');
// snippet.end

// snippet.setTokenBasicUsage
pubnub.setToken('p0thisAkFl043rhDdHRsCkNyZXisRGNoYW6hanNlY3JldAFDZ3Jwsample3KgQ3NwY6BDcGF0pERjaGFuoENnctokenVzcqBDc3BjoERtZXRhoENzaWdYIGOAeTyWGJI');
// snippet.end
