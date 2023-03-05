import { When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

When('I publish message with {string} space id and {string} message type', async function (spaceId, messageType) {
  const pubnub = this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });

  try {
    const response = await pubnub.publish({
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

Then('I receive an error response', function () {
  expect(this.isSucceed).to.be.false;
});
