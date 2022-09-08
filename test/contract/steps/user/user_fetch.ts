import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

Given('there is a user with ID {string}, name {string}', async function(userId, userName) {
  // remember the channel we subscribed to
  this.userId = userId;
  this.userName = userName;
});

When('I fetch the user {string}', async function(userId) {
  // ensure we fetch the existing specified user id
  expect(userId).to.equal(this.userId);

  let pubnub = this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey
  });

  let result = await pubnub.fetchUser({
    userId: userId
  });
  expect(result.status).to.equal(200);
  this.user = result.data;
});

When('I fetch all users', async function() {
  let pubnub = this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey
  });

  let result = await pubnub.fetchUsers();
  expect(result.status).to.equal(200);
  this.users = result.data;
});

Then('I get a list of user objects', async function() {
  expect(this.users).to.not.be.undefined;

  this.user = this.users[0];
});

Then('I get a user object with', async function() {
  expect(this.user).to.not.be.undefined;
});

Then('ID equal to {string}', async function(userId) {
  expect(userId).to.equal(this.user.id);
});

Then('Name equal to {string}', async function(userName) {
  expect(userName).to.equal(this.user.name);
});
