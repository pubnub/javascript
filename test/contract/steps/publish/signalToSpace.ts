import { When } from '@cucumber/cucumber';

When('I send a signal with {string} space id and {string} type', async function (spaceId, type) {
  const pubnub = this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });

  try {
    const response = await pubnub.signal({
      channel: 'test',
      message: { hello: 'world' },
      spaceId: spaceId,
      type: type,
    });
    this.isSucceed = typeof response.timetoken === 'string';
  } catch (status) {
    if ((status as { name: string; status: { error: boolean } }).status.error) {
      this.isSucceed = false;
    }
  }
});
