import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

Given('the desired user name {string}', async function(userName) {
  this.userNameUpdated = userName;
});

When('I update the user', async function() {
  let pubnub = this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey
  });

  let result = await pubnub.updateUser({
    userId: this.userId,
    data: {
      name: this.userNameUpdated
    }
  });
  expect(result.status).to.equal(200);
  this.updatedUser = result.data;
});

Then('I get an updated user object with', async function() {
  expect(this.updatedUser).to.not.be.undefined;

  this.user = this.updatedUser
});

Then('Updated user name equal to {string}', async function(userName) {
  expect(userName).to.equal(this.updatedUser.name);
});
  