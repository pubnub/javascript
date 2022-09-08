import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

Given('the user ID {string}, name {string}', async function(userId, userName) {
  // remember the channel we subscribed to
  this.userId = userId;
  this.userName = userName;
});

When('I create the user', async function() {
  let pubnub = this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey
  });

  let result = await pubnub.createUser({
    userId: this.userId,
    data: {
      name: this.userName
    }
  });
  expect(result.status).to.equal(200);
  this.user = result.data;
});