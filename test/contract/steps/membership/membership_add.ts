import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

Given('the user ID {string} and space ID {string}', async function(userId, spaceId) {
  this.userId = userId;
  this.spaceId = spaceId;
});

When('I add the membership', async function() {
  let pubnub = this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey
  });

  let result = await pubnub.addMemberships({
    userId: this.userId,
    spaces: [ this.spaceId ]
  });
  expect(result.status).to.equal(200);
  this.memberships = result.data;
});

Then('I get a list of memberships', async function() {
  expect(this.memberships).to.not.be.undefined;
  expect(this.memberships.length).to.be.greaterThan(0);

  this.membership = this.memberships[0];
});

Then('containing a membership with', async function() {
  expect(this.membership).to.not.be.undefined;
});

Then('add membership space ID equal to {string}', async function(spaceId) {
  // this is an SDK bug 'channel' should be 'space'
  expect(this.membership.channel).to.not.be.undefined;
  expect(this.membership.channel.id).to.equal(spaceId);
});
