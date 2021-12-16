import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { expect } from 'chai';

Given('I have a keyset with access manager enabled - without secret key', function() {
  this.keyset = this.fixtures.accessManagerWithoutSecretKeyKeyset;
});

Given('a valid token with permissions to publish with channel {string}', function(channel) {
  this.token = `this_represents_valid_token_with_write_permissions_to_channel_${channel}`;
});

Given('an expired token with permissions to publish with channel {string}', function(channel) {
  this.token = `this_represents_expired_token_with_write_permissions_to_channel_${channel}`;
});

When('I publish a message using that auth token with channel {string}', async function(channel) {
  expect(this.token).not.to.be.empty;
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey
  });
  pubnub.setToken(this.token);

  this.publishResult = await pubnub.publish({
      message: "hello!",
      channel: channel,
  });
});

When('I attempt to publish a message using that auth token with channel {string}', async function(channel) {
  expect(this.token).not.to.be.empty;
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey
  });
  pubnub.setToken(this.token);
  try {
    const result = await pubnub.publish({
        message: "hello!",
        channel: channel,
    });
  } catch (e: any) {
      this.expectedError = e?.status?.errorData;
  }
});

Then('the result is successful', function () {
  console.log(this.publishResult)
  expect(this.publishResult).to.not.to.equal(undefined);
  expect(this.publishResult.timetoken).to.not.to.equal(undefined);
});

Then('the auth error flag is true', function() {
  expect(this.expectedError.error).to.equal(true);
});

Then('an auth error is returned', function () {console.log(this.expectedError)
  expect(this.expectedError.status).to.be.a('number');

  expect(this.expectedError.error).to.be.true;
});

Then('the auth error message is {string}', function (errorMessage) {
  expect(this.expectedError.message).to.equal(errorMessage);
});
