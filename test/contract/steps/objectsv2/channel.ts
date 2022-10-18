import { When, Then, Given } from '@cucumber/cucumber';
import { expect } from 'chai';

Given('the id for {string} channel', function (channel) {
  const channelMetadata = this.getFixture(channel);
  this.parameter = { ...this.parameter, channel: channelMetadata.id };
});

Given('the data for {string} channel', async function (channel) {
  const channelMetadata = this.getFixture(channel);
  this.parameter = {
    ...this.parameter,
    channel: channelMetadata.id,
    data: {
      name: channelMetadata.name,
      description: channelMetadata.description,
      type: channelMetadata.type,
      status: channelMetadata.status,
    },
  };
});

When('I get the channel metadata', async function () {
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });
  this.response = await pubnub.objects.getChannelMetadata({ ...this.parameter, include: { customFields: false } });
});

When('I set the channel metadata', async function () {
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });

  this.response = await pubnub.objects.setChannelMetadata(this.parameter);
});

When('I remove the channel metadata', async function () {
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });

  this.response = await pubnub.objects.removeChannelMetadata(this.parameter);
});

Then('the channel metadata for {string} channel', function (channel) {
  const actual = this.response.data;
  const expected = this.getFixture(channel);
  expect(actual).to.deep.equal(expected);
});

Then('the channel metadata for {string} channel contains updated', function (channel) {
  const actual = this.response.data;
  const expected = this.getFixture(channel);
  expect(actual).to.deep.equal(expected);
});

When('I get the channel metadata with custom', async function () {
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });
  this.response = await pubnub.objects.getChannelMetadata({ ...this.parameter, include: { customFields: true } });
});

When('I get all channel metadata', async function () {
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });

  this.response = await pubnub.objects.getAllChannelMetadata();
});

Then('the response contains list with {string} and {string} channel metadata', function (firstChannel, secondChannel) {
  const firstChannelData = this.getFixture(firstChannel);
  const secondChannelData = this.getFixture(secondChannel);
  const actual = this.response.data;
  expect(actual).to.have.lengthOf(2);
  expect(actual).to.deep.include(firstChannelData);
  expect(actual).to.deep.include(secondChannelData);
});

When('I get all channel metadata with custom', async function () {
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });

  this.response = await pubnub.objects.getAllChannelMetadata({ include: { customFields: true } });
});
