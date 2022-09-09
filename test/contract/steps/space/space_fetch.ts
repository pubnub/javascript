import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

Given('there is a space with ID {string}, name {string}, description {string}', async function(spaceId, spaceName, spaceDescription) {
  this.spaceId = spaceId;
  this.spaceName = spaceName;
  this.spaceDescription = spaceDescription;
});

When('I fetch the space {string}', async function(spaceId) {
  // ensure we fetch the existing specified space id
  expect(spaceId).to.equal(this.spaceId);

  let pubnub = this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey
  });

  let result = await pubnub.fetchSpace({
    spaceId: spaceId
  });
  expect(result.status).to.equal(200);
  this.space = result.data;
});

When('I fetch all spaces', async function() {
  let pubnub = this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey
  });

  let result = await pubnub.fetchSpaces();
  expect(result.status).to.equal(200);
  this.spaces = result.data;
});

Then('I get a list of space objects', async function() {
  expect(this.spaces).to.not.be.undefined;

  this.space = this.spaces[0];
});

Then('I get a space object with', async function() {
  expect(this.space).to.not.be.undefined;
});

Then('Space ID equal to {string}', async function(spaceId) {
  expect(spaceId).to.equal(this.space.id);
});

Then('Space name equal to {string}', async function(spaceName) {
  expect(spaceName).to.equal(this.space.name);
});
