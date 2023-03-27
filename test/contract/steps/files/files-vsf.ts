import { When } from '@cucumber/cucumber';

When('I send a file with {string} space id and {string} type', async function (testSpaceId, testType) {
  const pubnub = this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });

  const testContent = `dummytext`;
  try {
    const response = await pubnub.sendFile({
      channel: 'filestest',
      file: { data: Buffer.from(testContent), name: 'myFile.txt', mimeType: 'text/plain' },
      message: { text: 'fileMessage' },
      spaceId: testSpaceId,
      type: testType,
    });
    this.isSucceed = response.timetoken === '1';
  } catch (e) {
    this.isSucceed = false;
  }
});
