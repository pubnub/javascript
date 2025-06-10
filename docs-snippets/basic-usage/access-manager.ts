import PubNub from '../../lib/types';
// snippet.accessManagerBasicUsage
// import PubNub

// Initialize PubNub with demo keys
const pubnub = new PubNub({
    publishKey: 'demo',
    subscribeKey: 'demo',
    userId: 'myUniqueUserId'
  });

// Function to use grantToken method
async function grantAccessToken() {
  try {
    const token = await pubnub.grantToken({
      ttl: 15,
      authorized_uuid: "my-authorized-uuid",
      resources: {
        channels: {
          "my-channel": {
            read: true,
            write: true
          }
        }
      }
    });
    console.log("Granted Token:", token);
  } catch (status) {
    console.log("Grant Token Error:", status);
  }
}

// Execute the function to grant a token
grantAccessToken();
// snippet.end

// snippet.grantTokenSpacesUserBasicUsage
try {
    const token = await pubnub.grantToken({
        ttl: 15,
        authorizedUserId: "my-authorized-userId",
        resources: {
            spaces: {
                "my-space": {
                    read: true,
                },
            },
        },
    });
} catch (status) {
    console.log(status);
}
// snippet.end

// snippet.revokeTokenBasicUsage
try {
    const response = await pubnub.revokeToken("p0AkFl043rhDdHRsple3KgQ3NwY6BDcENnctokenVzcqBDczaWdYIGOAeTyWGJI");
} catch (status) {
    console.log(status);
}
// snippet.end

// snippet.parseTokenBasicUsage
pubnub.parseToken("p0thisAkFl043rhDdHRsCkNyZXisRGNoYW6hanNlY3JldAFDZ3Jwsample3KgQ3NwY6BDcGF0pERjaGFuoENnctokenVzcqBDc3BjoERtZXRhoENzaWdYIGOAeTyWGJI")
// snippet.end

// snippet.setTokenBasicUsage
pubnub.setToken("p0thisAkFl043rhDdHRsCkNyZXisRGNoYW6hanNlY3JldAFDZ3Jwsample3KgQ3NwY6BDcGF0pERjaGFuoENnctokenVzcqBDc3BjoERtZXRhoENzaWdYIGOAeTyWGJI")
// snippet.end