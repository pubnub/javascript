import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

When('I remove the user', async function() {
  let pubnub = this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey
  });

  let result = await pubnub.removeUser({
    userId: this.userId
  });
  expect(result.status).to.equal(200);
  this.user = result.data;
});

Then('I get a null user', async function() {
  expect(this.user).to.be.null;
});

When('I attempt to fetch the user {string}', async function(userId) {
  // ensure we fetch the existing specified user id
  expect(userId).to.equal(this.userId);

  let pubnub = this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey
  });

  try {
    let result = await pubnub.fetchUser({
      userId: userId
    });
    
    this.removeStatus = result.status;
  } catch (e: any) {
    this.errorMessage = e.message;
  }
});

Then('I get get a user not found error', async function() {
  expect(this.errorMessage).to.equal('PubNub call failed, check status for details');
});
