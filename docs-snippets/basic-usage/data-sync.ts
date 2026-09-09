import PubNub, { PubNubError } from '../../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'myUniqueUserId',
});

// snippet.createUserBasicUsage
try {
  const response = await pubnub.dataSync.createUser({
    id: 'user-alice',
    data: {
      classVersion: 1,
      payload: { name: 'Alice', type: 'shopper' },
    },
  });
  console.log('createUser response:', response.data);
} catch (error) {
  console.error(
    `Create user error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getUserBasicUsage
try {
  const response = await pubnub.dataSync.getUser({ id: 'user-alice' });
  console.log('getUser response:', response.data);
} catch (error) {
  console.error(
    `Get user error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getUsersBasicUsage
try {
  const response = await pubnub.dataSync.getUsers({
    limit: 20,
    sort: { createdAt: 'asc' },
  });
  console.log('getUsers response:', response.data);
  console.log('getUsers meta:', response.meta);
} catch (error) {
  console.error(
    `Get users error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.updateUserBasicUsage
try {
  const response = await pubnub.dataSync.setUser({
    id: 'user-alice',
    data: {
      classVersion: 1,
      payload: { name: 'Alice B.', type: 'shopper' },
    },
    ifMatchesEtag: 'AbQdEfGhIjKlMn',
  });
  console.log('setUser response:', response.data);
} catch (error) {
  console.error(
    `Set user error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.patchUserBasicUsage
try {
  const response = await pubnub.dataSync.updateUser({
    id: 'user-alice',
    replace: { '/payload/name': 'Alice B.', '/status': 'active' },
  });
  console.log('updateUser response:', response.data);
} catch (error) {
  console.error(
    `Update user error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.removeUserBasicUsage
try {
  const response = await pubnub.dataSync.removeUser({ id: 'user-alice' });
  console.log('removeUser response status:', response.status);
} catch (error) {
  console.error(
    `Remove user error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.createChannelBasicUsage
try {
  const response = await pubnub.dataSync.createChannel({
    id: 'channel-summer-sale',
    data: {
      classVersion: 1,
      payload: { name: 'Summer Sale', type: 'promotion' },
    },
  });
  console.log('createChannel response:', response.data);
} catch (error) {
  console.error(
    `Create channel error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getChannelBasicUsage
try {
  const response = await pubnub.dataSync.getChannel({ id: 'channel-summer-sale' });
  console.log('getChannel response:', response.data);
} catch (error) {
  console.error(
    `Get channel error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getChannelsBasicUsage
try {
  const response = await pubnub.dataSync.getChannels({ limit: 20 });
  console.log('getChannels response:', response.data);
  console.log('getChannels meta:', response.meta);
} catch (error) {
  console.error(
    `Get channels error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.updateChannelBasicUsage
try {
  const response = await pubnub.dataSync.setChannel({
    id: 'channel-summer-sale',
    data: {
      classVersion: 1,
      payload: { name: 'Summer Sale 2026', type: 'promotion' },
    },
  });
  console.log('setChannel response:', response.data);
} catch (error) {
  console.error(
    `Set channel error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.patchChannelBasicUsage
try {
  const response = await pubnub.dataSync.updateChannel({
    id: 'channel-summer-sale',
    replace: { '/payload/name': 'Summer Sale 2026' },
  });
  console.log('updateChannel response:', response.data);
} catch (error) {
  console.error(
    `Update channel error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.removeChannelBasicUsage
try {
  const response = await pubnub.dataSync.removeChannel({ id: 'channel-summer-sale' });
  console.log('removeChannel response status:', response.status);
} catch (error) {
  console.error(
    `Remove channel error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.createMembershipBasicUsage
try {
  const response = await pubnub.dataSync.createMembership({
    userId: 'user-alice',
    channelId: 'channel-summer-sale',
    data: {
      classVersion: 1,
      payload: { role: 'viewer' },
    },
  });
  console.log('createMembership response:', response.data);
} catch (error) {
  console.error(
    `Create membership error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getMembershipBasicUsage
try {
  const response = await pubnub.dataSync.getMembership({
    id: 'membership-alice-summer-sale',
  });
  console.log('getMembership response:', response.data);
} catch (error) {
  console.error(
    `Get membership error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getMembershipsBasicUsage
try {
  const response = await pubnub.dataSync.getMemberships({
    userId: 'user-alice',
    limit: 20,
  });
  console.log('getMemberships response:', response.data);
  console.log('getMemberships meta:', response.meta);
} catch (error) {
  console.error(
    `Get memberships error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.updateMembershipBasicUsage
try {
  const response = await pubnub.dataSync.setMembership({
    id: 'membership-alice-summer-sale',
    userId: 'user-alice',
    channelId: 'channel-summer-sale',
    data: {
      classVersion: 1,
      payload: { role: 'moderator' },
    },
  });
  console.log('setMembership response:', response.data);
} catch (error) {
  console.error(
    `Set membership error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.patchMembershipBasicUsage
try {
  const response = await pubnub.dataSync.updateMembership({
    id: 'membership-alice-summer-sale',
    replace: { '/payload/role': 'moderator' },
  });
  console.log('updateMembership response:', response.data);
} catch (error) {
  console.error(
    `Update membership error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.removeMembershipBasicUsage
try {
  const response = await pubnub.dataSync.removeMembership({
    id: 'membership-alice-summer-sale',
  });
  console.log('removeMembership response status:', response.status);
} catch (error) {
  console.error(
    `Remove membership error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.createEntityBasicUsage
try {
  const response = await pubnub.dataSync.createEntity({
    id: 'product-sneaker-42',
    class: 'product',
    data: {
      classVersion: 1,
      payload: { name: 'Retro Sneaker', price: 89.99, stock: 12 },
    },
  });
  console.log('createEntity response:', response.data);
} catch (error) {
  console.error(
    `Create entity error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getEntityBasicUsage
try {
  const response = await pubnub.dataSync.getEntity({ id: 'product-sneaker-42' });
  console.log('getEntity response:', response.data);
} catch (error) {
  console.error(
    `Get entity error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getEntitiesBasicUsage
try {
  const response = await pubnub.dataSync.getEntities({
    class: 'product',
    sort: { price: 'desc' },
    limit: 20,
  });
  console.log('getEntities response:', response.data);
  console.log('getEntities meta:', response.meta);
} catch (error) {
  console.error(
    `Get entities error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.updateEntityBasicUsage
try {
  const response = await pubnub.dataSync.setEntity({
    id: 'product-sneaker-42',
    data: {
      classVersion: 1,
      payload: { name: 'Retro Sneaker', price: 79.99, stock: 8 },
    },
  });
  console.log('setEntity response:', response.data);
} catch (error) {
  console.error(
    `Set entity error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.patchEntityBasicUsage
try {
  const response = await pubnub.dataSync.updateEntity({
    id: 'product-sneaker-42',
    replace: { '/payload/price': 79.99 },
  });
  console.log('updateEntity response:', response.data);
} catch (error) {
  console.error(
    `Update entity error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.removeEntityBasicUsage
try {
  const response = await pubnub.dataSync.removeEntity({ id: 'product-sneaker-42' });
  console.log('removeEntity response status:', response.status);
} catch (error) {
  console.error(
    `Remove entity error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.createRelationshipBasicUsage
try {
  const response = await pubnub.dataSync.createRelationship({
    class: 'ProductOwner',
    entityAId: 'seller-bob',
    entityBId: 'product-sneaker-42',
    data: {
      classVersion: 1,
      payload: { since: '2026-07-13' },
    },
  });
  console.log('createRelationship response:', response.data);
} catch (error) {
  console.error(
    `Create relationship error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getRelationshipBasicUsage
try {
  const response = await pubnub.dataSync.getRelationship({
    id: 'rel-bob-owns-sneaker-42',
  });
  console.log('getRelationship response:', response.data);
} catch (error) {
  console.error(
    `Get relationship error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getRelationshipsBasicUsage
try {
  const response = await pubnub.dataSync.getRelationships({
    class: 'ProductOwner',
    entityAId: 'seller-bob',
    limit: 20,
  });
  console.log('getRelationships response:', response.data);
  console.log('getRelationships meta:', response.meta);
} catch (error) {
  console.error(
    `Get relationships error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.updateRelationshipBasicUsage
try {
  const response = await pubnub.dataSync.setRelationship({
    id: 'rel-bob-owns-sneaker-42',
    entityAId: 'seller-bob',
    entityBId: 'product-sneaker-42',
    data: {
      classVersion: 1,
      payload: { since: '2026-07-13', tier: 'gold' },
    },
  });
  console.log('setRelationship response:', response.data);
} catch (error) {
  console.error(
    `Set relationship error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.patchRelationshipBasicUsage
try {
  const response = await pubnub.dataSync.updateRelationship({
    id: 'rel-bob-owns-sneaker-42',
    replace: { '/payload/tier': 'platinum' },
  });
  console.log('updateRelationship response:', response.data);
} catch (error) {
  console.error(
    `Update relationship error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.removeRelationshipBasicUsage
try {
  const response = await pubnub.dataSync.removeRelationship({
    id: 'rel-bob-owns-sneaker-42',
  });
  console.log('removeRelationship response status:', response.status);
} catch (error) {
  console.error(
    `Remove relationship error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end
