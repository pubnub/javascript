import PubNub, { PubNubError } from '../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'myUniqueUserId',
});

// snippet.getUsersFilterExample
// `filter` runs over properties declared with filtering mode `full` and is evaluated against
// eventually consistent storage.
try {
  const response = await pubnub.dataSync.getUsers({
    filter: 'name LIKE "*Alice*"',
  });
  console.log('getUsers (filter) response:', response.data);
} catch (error) {
  console.error(
    `Get users error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getUsersFilterFastExample
// `filterFast` is evaluated against strongly consistent storage, so it matches an object you just
// wrote.
try {
  const response = await pubnub.dataSync.getUsers({
    filterFast: 'type == "shopper"',
  });
  console.log('getUsers (filterFast) response:', response.data);
} catch (error) {
  console.error(
    `Get users error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getUsersCursorPagingExample
// Pass no `cursor` on the first call. Take `meta.next_cursor` from the response and pass it back
// as `cursor` on the next call. Stop when `meta.has_next` is `false`.
try {
  let cursor: string | undefined;
  let hasNext = true;
  let page = 0;

  while (hasNext) {
    const response = await pubnub.dataSync.getUsers({
      filterFast: 'type == "shopper"',
      limit: 20,
      cursor,
    });
    console.log(`Page ${++page}:`, response.data);
    cursor = response.meta?.next_cursor ?? undefined;
    hasNext = response.meta?.has_next ?? false;
  }
} catch (error) {
  console.error(
    `Get users error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getChannelsFilterExample
try {
  const response = await pubnub.dataSync.getChannels({
    filter: 'name LIKE "*Sale*"',
  });
  console.log('getChannels (filter) response:', response.data);
} catch (error) {
  console.error(
    `Get channels error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getChannelsFilterFastExample
try {
  const response = await pubnub.dataSync.getChannels({
    filterFast: 'type == "promotion"',
  });
  console.log('getChannels (filterFast) response:', response.data);
} catch (error) {
  console.error(
    `Get channels error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getChannelsCursorPagingExample
try {
  let cursor: string | undefined;
  let hasNext = true;
  let page = 0;

  while (hasNext) {
    const response = await pubnub.dataSync.getChannels({
      filterFast: 'type == "promotion"',
      limit: 20,
      cursor,
    });
    console.log(`Page ${++page}:`, response.data);
    cursor = response.meta?.next_cursor ?? undefined;
    hasNext = response.meta?.has_next ?? false;
  }
} catch (error) {
  console.error(
    `Get channels error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getMembershipsByChannelIdExample
// Pass `channelId` instead of `userId` to list the members of a channel rather than a user's
// memberships.
try {
  const response = await pubnub.dataSync.getMemberships({
    channelId: 'channel-summer-sale',
    limit: 20,
  });
  console.log('getMemberships (channelId) response:', response.data);
} catch (error) {
  console.error(
    `Get memberships error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getMembershipsFilterExample
try {
  const response = await pubnub.dataSync.getMemberships({
    userId: 'user-alice',
    filter: 'role LIKE "*mod*"',
  });
  console.log('getMemberships (filter) response:', response.data);
} catch (error) {
  console.error(
    `Get memberships error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getMembershipsFilterFastExample
try {
  const response = await pubnub.dataSync.getMemberships({
    channelId: 'channel-summer-sale',
    filterFast: 'role == "viewer"',
  });
  console.log('getMemberships (filterFast) response:', response.data);
} catch (error) {
  console.error(
    `Get memberships error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getMembershipsCursorPagingExample
try {
  let cursor: string | undefined;
  let hasNext = true;
  let page = 0;

  while (hasNext) {
    const response = await pubnub.dataSync.getMemberships({
      userId: 'user-alice',
      limit: 20,
      cursor,
    });
    console.log(`Page ${++page}:`, response.data);
    cursor = response.meta?.next_cursor ?? undefined;
    hasNext = response.meta?.has_next ?? false;
  }
} catch (error) {
  console.error(
    `Get memberships error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getEntitiesFilterExample
// Reference a declared property by its `name` (not its `path`), and combine conditions with `&&`
// and `||`.
try {
  const response = await pubnub.dataSync.getEntities({
    class: 'product',
    filter: 'name LIKE "*sneaker*" && !(status == "discontinued")',
  });
  console.log('getEntities (filter) response:', response.data);
} catch (error) {
  console.error(
    `Get entities error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getEntitiesFilterFastExample
try {
  const response = await pubnub.dataSync.getEntities({
    class: 'product',
    filterFast: 'price < 100 && stock > 0',
  });
  console.log('getEntities (filterFast) response:', response.data);
} catch (error) {
  console.error(
    `Get entities error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getEntitiesCursorPagingExample
try {
  let cursor: string | undefined;
  let hasNext = true;
  let page = 0;

  while (hasNext) {
    const response = await pubnub.dataSync.getEntities({
      class: 'product',
      filterFast: 'price < 100',
      limit: 20,
      cursor,
    });
    console.log(`Page ${++page}:`, response.data);
    cursor = response.meta?.next_cursor ?? undefined;
    hasNext = response.meta?.has_next ?? false;
  }
} catch (error) {
  console.error(
    `Get entities error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.updateEntityCombinedPatchExample
// A single `updateEntity` call can mix `add`, `replace`, `remove`, `move`, `copy`, and `test`. Add
// `ifMatchesEtag` (the `eTag` from a prior read) to reject the patch with a 412 if the entity
// changed since you read it, instead of silently overwriting a concurrent change.
try {
  const response = await pubnub.dataSync.updateEntity({
    id: 'product-sneaker-42',
    test: { '/payload/stock': 8 },
    replace: { '/payload/price': 74.99 },
    add: { '/payload/tags/0': 'clearance' },
    remove: ['/payload/legacy/field'],
    move: [{ from: '/payload/legacyName', path: '/payload/displayName' }],
    copy: [{ from: '/payload/displayName', path: '/payload/previousName' }],
    ifMatchesEtag: 'StUvWxYzAbCdEf',
  });
  console.log('updateEntity (combined patch) response:', response.data);
} catch (error) {
  console.error(
    `Update entity error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getRelationshipsByEntityBIdExample
// Pass `entityBId` instead of `entityAId` to list relationships where the entity is on the second
// side of the link.
try {
  const response = await pubnub.dataSync.getRelationships({
    class: 'ProductOwner',
    entityBId: 'product-sneaker-42',
    limit: 20,
  });
  console.log('getRelationships (entityBId) response:', response.data);
} catch (error) {
  console.error(
    `Get relationships error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getRelationshipsFilterExample
try {
  const response = await pubnub.dataSync.getRelationships({
    class: 'ProductOwner',
    filter: '!(tier == "platinum")',
  });
  console.log('getRelationships (filter) response:', response.data);
} catch (error) {
  console.error(
    `Get relationships error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getRelationshipsFilterFastExample
try {
  const response = await pubnub.dataSync.getRelationships({
    class: 'ProductOwner',
    filterFast: 'tier == "gold"',
  });
  console.log('getRelationships (filterFast) response:', response.data);
} catch (error) {
  console.error(
    `Get relationships error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getRelationshipsCursorPagingExample
try {
  let cursor: string | undefined;
  let hasNext = true;
  let page = 0;

  while (hasNext) {
    const response = await pubnub.dataSync.getRelationships({
      class: 'ProductOwner',
      entityAId: 'seller-bob',
      limit: 20,
      cursor,
    });
    console.log(`Page ${++page}:`, response.data);
    cursor = response.meta?.next_cursor ?? undefined;
    hasNext = response.meta?.has_next ?? false;
  }
} catch (error) {
  console.error(
    `Get relationships error: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.dataSyncEntitySubscribeExample
// DataSync objects publish create/update/delete events over a `dataSync` listener. Create a
// DataSync SDK entity for the object, subscribe to it, and attach the listener.
const productSubscription = pubnub.dataSyncEntity('product-sneaker-42').subscription();
productSubscription.onDataSync = (event) => console.log(event.message.event, event.message.data);
productSubscription.subscribe();
// snippet.end

// snippet.subscribeToDataSyncEntity
// Observe one entity.
const entitySubscription = pubnub.dataSyncEntity('product-sneaker-42').subscription();

entitySubscription.onDataSync = (event) => {
  console.log(event.message.event, event.message.data);
};

entitySubscription.subscribe();
// snippet.end

// snippet.observeDataSyncEntitiesByPattern
// Because the identifier is used verbatim, a wildcard identifier subscribes to the matching
// channel pattern and one subscription serves the whole set. `event.channel` reports the concrete
// delivery channel, while `event.subscription` reports the pattern that matched it.
const patternSubscription = pubnub.dataSyncEntity('product.*').subscription({ projection: 'admin' });

patternSubscription.onDataSync = (event) => {
  // event.channel      -> '__admin__product.676'
  // event.subscription -> '__admin__product.*'
  console.log('changed:', event.message.data.id);
};

patternSubscription.subscribe();
// snippet.end

// snippet.combineDataSyncSubscriptions
// A DataSync subscription is an ordinary `subscription`, so it composes into a set with any other
// subscription.
const productsSubscription = pubnub.dataSyncEntity('product.*').subscription();
const aliceSubscription = pubnub.dataSyncUser('user-alice').subscription();

const dataSyncSubscriptionSet = productsSubscription.addSubscription(aliceSubscription);
dataSyncSubscriptionSet.onDataSync = (event) => console.log(event.message.objectType, event.message.event);
dataSyncSubscriptionSet.subscribe();
// snippet.end

// snippet.addDataSyncListener
// Create a DataSync SDK entity for the object and attach the listener.
const dataSyncObjectId = 'product-sneaker-42';
const dataSyncListenerSubscription = pubnub.dataSyncEntity(dataSyncObjectId).subscription();

dataSyncListenerSubscription.onDataSync = (event) => {
  const change = event.message;

  // This channel can also receive relationship events and events about connected entities. Only
  // handle events for the observed product. `Product` is a class of your own, so its events
  // report `type: 'entity'`.
  if (change.type !== 'entity' || change.data.id !== dataSyncObjectId) return;

  switch (change.event) {
    case 'create':
      console.log('Product created:', change.data.id);
      break;
    case 'update': {
      // `payload` is typed as the generic SDK `Payload` union (it can be a string, number, array,
      // and so on for other message types), but a DataSync entity payload is always the JSON
      // object declared by its class, so it is safe to read it as a record here.
      const payload =
        'payload' in change.data ? (change.data.payload as Record<string, unknown> | undefined) : undefined;
      console.log('New price:', payload?.price);
      break;
    }
    case 'delete':
      console.log('Product deleted:', change.data.id);
      break;
  }
};

dataSyncListenerSubscription.subscribe();
// snippet.end
