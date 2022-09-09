import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

Given('the desired space name {string}', async function(spaceName) {
  this.spaceNameUpdated = spaceName;
});

When('I update the space', async function() {
  let pubnub = this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey
  });

  let result = await pubnub.updateSpace({
    spaceId: this.spaceId,
    data: {
      name: this.spaceNameUpdated
    }
  });
  expect(result.status).to.equal(200);
  this.updatedSpace = result.data;
});

Then('I get an updated space object with', async function() {
  expect(this.updatedSpace).to.not.be.undefined;

  this.space = this.updatedSpace
});

Then('Updated space name equal to {string}', async function(spaceName) {
  expect(spaceName).to.equal(this.updatedSpace.name);
});
  