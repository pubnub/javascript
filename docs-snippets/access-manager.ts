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
    `Grant token error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
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

// snippet.grantTokenDataSyncResources
// Grants `user-alice`:
// - Get access to the entity `product-sneaker-42`, and to all entities matching the
//   `product-.*` RegEx pattern.
// - Get access to the DataSync user `user-bob` through the top-level `users` scope, because
//   DataSync users are not permissioned under `dataSync`.
try {
  const token = await pubnub.grantToken({
    ttl: 15,
    authorized_uuid: 'user-alice',
    resources: {
      users: {
        'user-bob': {
          get: true,
        },
      },
      dataSync: {
        entities: {
          'product-sneaker-42': {
            get: true,
          },
        },
      },
    },
    patterns: {
      dataSync: {
        entities: {
          'product-.*': {
            get: true,
          },
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

// snippet.grantTokenWithProjection
// Grants `user-alice` the same access as above and assigns the `public` projection to the entity
// `product-sneaker-42` and to the user `user-bob`. With those projections, Alice reads and writes
// only the fields that the `public` projection exposes on each object.
try {
  const token = await pubnub.grantToken({
    ttl: 15,
    authorized_uuid: 'user-alice',
    resources: {
      users: {
        'user-bob': {
          get: true,
        },
      },
      dataSync: {
        entities: {
          'product-sneaker-42': {
            get: true,
          },
        },
      },
    },
    patterns: {
      dataSync: {
        entities: {
          'product-.*': {
            get: true,
          },
        },
      },
    },
    dataSyncProjections: {
      resources: {
        entities: {
          'product-sneaker-42': 'public',
        },
        users: {
          'user-bob': 'public',
        },
      },
      patterns: {
        entities: {
          'product-.*': 'public',
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
    `Grant token error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.grantTokenWithCategories
// Grants `my-authorized-uuid` permission to list all channel metadata and all uuid metadata.
// Category permissions support only the `get` operation.
try {
  const token = await pubnub.grantToken({
    ttl: 15,
    authorizedUserId: 'my-authorized-uuid',
    categories: {
      channels: { get: true },
      uuids: { get: true },
    },
  });
  console.log('Granted token:', token);
} catch (error) {
  console.error(
    `Grant token error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.parseTokenWithCategories
// Decodes a token that was granted with category permissions.
const parsedToken = pubnub.parseToken('use-token-string-generated-by-grantToken()');

console.log('Can list all channel metadata:', parsedToken?.categories?.channels?.get);
console.log('Can list all uuid metadata:', parsedToken?.categories?.uuids?.get);
// snippet.end

// snippet.grantWithCategories
// Grants the auth key permission to list all channel metadata and all uuid metadata.
// This legacy `grant` method requires the secret key to be set on the client.
try {
  const response = await pubnub.grant({
    authKeys: ['my-auth-key'],
    categories: ['channels', 'uuids'],
    get: true,
    ttl: 15,
  });
  console.log('Grant response:', response);
} catch (error) {
  console.error(
    `Grant error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end
