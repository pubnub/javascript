import { When, Then } from '@cucumber/cucumber';

When('I subscribe to {string} channel', async function (channel) {
  // remember the channel we subscribed to
  this.channel = channel;
  // this.messageCount = 0;
  this.events = [];
  const pubnub = this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });

  const connectedResponse = new Promise<void>((resolveConnected) => {
    this.subscribeResponse = new Promise<void>((resolveSubscribe) => {
      this.signalResponse = new Promise<void>((resolveSignal) => {
        pubnub.addListener({
          status: function (statusEvent) {
            console.log('status', statusEvent.category);
            // Once the SDK fires this event
            if (statusEvent.category === 'PNConnectedCategory') {
              resolveConnected();
            }
          },
          message: (m) => {
            // remember the message received to compare and then resolve the promise
            this.events.push(m);
            resolveSubscribe();
          },
          signal: (s) => {
            this.events.push(s);
            resolveSignal();
          },
        });
      });
    });
  });

  pubnub.subscribe({ channels: [this.channel] });

  // return the promise so the next cucumber step waits for the sdk to return connected status
  return connectedResponse;
});

When('I publish a message', async function () {
  // ensure the channel we subscribed to is the same we publish to
  // expect('test').to.equal(this.channel);

  // returning the promise so the next cucumber step will wait for the publish to complete
  this.onlyMessage = true;
  return this.getPubnub().publish({
    message: 'hello',
    channel: 'test',
  });
});

Then('I receive the message in my subscribe response', async function () {
  // wait for the message to be received by the subscription and then
  // check the expected message matches the message received

  await this.subscribeResponse;

  // allow the subscribe loop to continue and then clean up
  return this.delayCleanup();
});
