import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

Given('the demo keyset with enabled storage', function () {
  this.keyset = this.fixtures.demoKeyset;
});

When('I fetch message history for {string} channel', async function (testChannel) {
  const pubnub = this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });

  const response = await pubnub.fetchMessages({
    channels: [testChannel],
  });

  this.isSucceed = true;
  this.historyMessages = response.channels[testChannel];
});

When(
  'I fetch message history with {string} set to {string} for {string} channel',
  async function (param, paramValue, channel) {
    const pubnub = this.getPubnub({
      publishKey: this.keyset.publishKey,
      subscribeKey: this.keyset.subscribeKey,
    });

    const request = {
      channels: [channel],
    };
    request[param] = paramValue === 'true' ? true : false;

    const response = await pubnub.fetchMessages(request);

    this.isSucceed = true;
    this.historyMessages = response.channels[channel];
  },
);

Then(
  'history response contains messages with {string} and {string} message types',
  function (firstMessageType, secondMessageType) {
    expect(this.historyMessages.filter((m) => m.messageType === firstMessageType)).to.have.lengthOf(1);
    expect(this.historyMessages.filter((m) => m.messageType === secondMessageType)).to.have.lengthOf(1);
  },
);

Then('history response contains messages without space ids', function () {
  this.historyMessages.forEach((m) => expect(m).to.not.have.property('spaceId'));
});

Then('history response contains messages with space ids', function () {
  this.historyMessages.forEach((m) => expect(m).to.have.property('spaceId'));
});

Then('history response contains messages with message types', function () {
  this.historyMessages.forEach((m) => expect(m).to.have.property('messageType'));
});

Then('history response contains messages without message types', function () {
  this.historyMessages.forEach((m) => expect(m).to.not.have.property('messageType'));
});
