import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

Given('the space ID {string}, name {string}, description {string}', async function(spaceId, spaceName, spaceDescription) {
  this.spaceId = spaceId;
  this.spaceName = spaceName;
  this.spaceDescription = spaceDescription;
});

When('I create the space', async function() {
  let pubnub = this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey
  });

  let result = await pubnub.createSpace({
    spaceId: this.spaceId,
    data: {
      name: this.spaceName,
      description: this.spaceDescription,
    }
  });
  expect(result.status).to.equal(200);
  this.space = result.data;
});