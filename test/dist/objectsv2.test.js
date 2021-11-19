/** @flow */

import util from 'util'
import PubNub from '../../src/node'

describe('Objects V2 system tests', () => {
  const SUBSCRIBE_KEY = 'sub-c-d86a1698-889e-11ea-b883-d2d532c9a1bf';
  const PUBLISH_KEY = 'pub-c-5397272a-7664-4b57-bc91-944977fb3f25';

  const TEST_PREFIX = 'objectsV2tests';
  const UUID = `${TEST_PREFIX}-main`;
  const UUID_1 = `${TEST_PREFIX}-uuid-1`;

  const CHANNEL_1 = `${TEST_PREFIX}-channel-1`;

  let pubnub: PubNub;

  const events = [];
  const listener = {
    objects: (event) => {
      events.push(event);
    }
  };

  before(() => {
    pubnub = new PubNub({
      subscribeKey: SUBSCRIBE_KEY,
      publishKey: PUBLISH_KEY,
      uuid: UUID,
      // logVerbosity: true
    });

    pubnub.subscribe({ channels: [UUID_1] })
    pubnub.addListener(listener);
  });

  after(() => {
    pubnub.unsubscribeAll();
    pubnub.removeListener(listener);
    pubnub.destroy();
  });

  const USER_NAME = `Test Name ${Math.random().toString(16).substr(2, 5)}`;
  const CHANNEL_NAME = `Test Channel Name ${Math.random().toString(16).substr(2, 5)}`;

  it('should set uuid', async () => {
    const result = await pubnub.objects.setUUIDMetadata({ uuid: UUID_1, data: { name: USER_NAME } });

    expect(result.status).to.equal(200);
    expect(result.data.id).to.equal(UUID_1);
  });

  it('should get uuid', async () => {
    const result = await pubnub.objects.getUUIDMetadata({ uuid: UUID_1 });

    expect(result.status).to.equal(200);
    expect(result.data.name).to.equal(USER_NAME);
  });

  it('should get all uuids', async () => {
    const result = await pubnub.objects.getAllUUIDMetadata({ include: { totalCount: true }});


    expect(result.status).to.equal(200);
    expect(result.data[0].name).to.equal(USER_NAME);
  });

  it('should set channel', async () => {
    const result = await pubnub.objects.setChannelMetadata({
      channel: CHANNEL_1,
      data: {
        name: CHANNEL_NAME,
        custom: { foo: true }
      }
    });

    expect(result.status).to.equal(200);
    expect(result.data.name).to.equal(CHANNEL_NAME);
  });

  it('should get channel', async () => {
    const result = await pubnub.objects.getChannelMetadata({ channel: CHANNEL_1 });

    expect(result.status).to.equal(200);
    expect(result.data.name).to.equal(CHANNEL_NAME);
  });

  it('should get all channels', async () => {
    const result = await pubnub.objects.getAllChannelMetadata();

    expect(result.status).to.equal(200);
    expect(result.data[0].name).to.equal(CHANNEL_NAME);
  });

  it('should set memberships', async () => {
    const result = await pubnub.objects.setMemberships({
      uuid: UUID_1,
      channels: [{ id: CHANNEL_1, custom: { myData: 42 } }],
    });

    expect(result.status).to.equal(200);
  });

  it('should get channel members', async () => {
    const result = await pubnub.objects.getChannelMembers({
      channel: CHANNEL_1,
      include: { customFields: true }
    });

    expect(result.status).to.equal(200);
    expect(result.data[0]?.custom?.myData).to.equal(42);
  });

  it('should get memberships', async () => {
    const result = await pubnub.objects.getMemberships({
      uuid: UUID_1,
      include: {
        customFields: true,
        customChannelFields: true,
        channelFields: true,
      }
    });

    expect(result.status).to.equal(200);
    expect(result.data[0]?.custom?.myData).to.equal(42);
    expect(result.data[0]?.channel?.name).to.equal(CHANNEL_NAME);
    expect(result.data[0]?.channel?.custom?.foo).to.be.true;
  });

  it('should remove memberships', async () => {
    const result = pubnub.objects.removeMemberships({ uuid: UUID_1, channels: [CHANNEL_1] }, (status, result) => {
      expect(result.status).to.equal(200);
    });
  })

  it('should remove uuid', async () => {
    const result = await pubnub.objects.removeUUIDMetadata({ uuid: UUID_1 });

    expect(result.status).to.equal(200);
    expect(result.data).to.be.null;
  });
});
