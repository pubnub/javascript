import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

When('I update the membership to {string}', async function(spaceId) {
  let pubnub = this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey
  });

  let result = await pubnub.updateMemberships({
    userId: this.userId,
    spaces: [ spaceId ]
  });
  expect(result.status).to.equal(200);
  this.updatedMemberships = result.data;
});

Then('I get a list of updated memberships', async function() {
  expect(this.memberships).to.not.be.undefined;
  expect(this.memberships.length).to.be.greaterThan(0);

  this.updatedMembership = this.updatedMemberships[0];
});

Then('containing an updated membership with', async function() {
  expect(this.updatedMembership).to.not.be.undefined;
});

Then('updated membership space ID equal to {string}', async function(spaceId) {
  expect(this.updatedMembership.channel).to.not.be.undefined;
  expect(this.updatedMembership.channel.id).to.equal(spaceId);
});
