import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

Given('the user ID {string}', async function(userId) {
  this.userId = userId;
});

When('I fetch the membership', async function() {
  let pubnub = this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey
  });

  let result = await pubnub.fetchMemberships({
    userId: this.userId,
    include: {}
  });
  expect(result.status).to.equal(200);
  this.memberships = result.data;
});

Then('fetch membership space ID equal to {string}', async function(spaceId) {
  expect(this.membership.space).to.not.be.undefined;
  expect(this.membership.space.id).to.equal(spaceId);
});