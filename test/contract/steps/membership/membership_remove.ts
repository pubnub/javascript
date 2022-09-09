import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

When('I remove the membership {string}', async function(spaceId) {
  let pubnub = this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey
  });

  let result = await pubnub.removeMemberships({
    userId: this.userId,
    spaceIds: [ spaceId ]
  });
  expect(result.status).to.equal(200);
  this.memberships = result.data;
});

Then('I get an empty list of memberships', async function() {
  expect(this.memberships.length).to.equal(0);
});