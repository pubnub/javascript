import { When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { MessageEvent, StatusEvent } from 'pubnub';

When('I subscribe to channel {string}', async function (channel) {
  // remember the channel we subscribed to
  this.channel = channel;
  let pubnub = this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });

  let connectedResponse = new Promise<void>((resolveConnected) => {
    this.subscribeResponse = new Promise<void>((resolveSubscribe) => {
      pubnub.addListener({
        status: function (statusEvent: StatusEvent) {
          console.log('status', statusEvent.category);
          // Once the SDK fires this event
          if (statusEvent.category === 'PNConnectedCategory') {
            resolveConnected();
          }
        },
        message: (m: MessageEvent) => {
          // remember the message received to compare and then resolve the promise
          this.message = m.message;
          resolveSubscribe();
        },
      });
    });
  });

  pubnub.subscribe({ channels: [this.channel] });

  // return the promise so the next cucumber step waits for the sdk to return connected status
  return connectedResponse;
});

When('I publish the message {string} to channel {string}', async function (message, channel) {
  // ensure the channel we subscribed to is the same we publish to
  expect(channel).to.equal(this.channel);

  // returning the promise so the next cucumber step will wait for the publish to complete
  return this.getPubnub().publish({
    message: message,
    channel: channel,
  });
});

Then('I receive the message in my subscribe response', async function () {
  // wait for the message to be received by the subscription and then
  // check the expected message matches the message received
  await this.subscribeResponse;
  expect('hello').to.equal(this.message);

  // allow the subscribe loop to continue and then clean up
  return this.delayCleanup();
});
