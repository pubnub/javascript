import { When } from '@cucumber/cucumber';

When('I send a signal with {string} space id and {string} message type', async function (spaceId, messageType) {
  const pubnub = this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });

  try {
    const response = await pubnub.signal({
      channel: 'test',
      message: { hello: 'world' },
      spaceId: spaceId,
      messageType: messageType,
    });
    this.isSucceed = typeof response.timetoken === 'string';
  } catch (status) {
    if ((status as { error: boolean }).error) {
      this.isSucceed = false;
    }
  }
});
