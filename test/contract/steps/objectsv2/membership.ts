import { When, Then, Given } from '@cucumber/cucumber';
import { expect } from 'chai';

Given('the data for {string} membership', function (membership) {
  const membershipData = this.getFixture(membership);
  this.parameter = { ...this.parameter, channels: [{ id: membershipData.channel.id }] };
});

When('I set the membership', async function () {
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });
  this.response = await pubnub.objects.setMemberships(this.parameter);
});

When('I get the memberships', async function () {
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });
  this.response = await pubnub.objects.getMemberships(this.parameter);
});

When('I get the memberships for current user', async function () {
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
    uuid: this.currentUuid,
  });
  this.response = await pubnub.objects.getMemberships();
});

When('I get the memberships including custom and channel custom information', async function (){
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });
  this.response = await pubnub.objects.getMemberships({
    ...this.parameter,
    include: { customFields: true, customChannelFields: true },
  });
});

When('I set the membership for current user', async function () {
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
    uuid: this.currentUuid,
  });
  this.response = await pubnub.objects.setMemberships(this.parameter);
});

Given('the data for {string} membership that we want to remove', function (membership) {
  const membershipData = this.getFixture(membership);
  this.parameter = { ...this.parameter, channels: [{ id: membershipData.channel.id }] };
});

When('I remove the membership', async function () {
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });
  this.response = await pubnub.objects.removeMemberships(this.parameter);
});

When('I remove the membership for current user', async function () {
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
    uuid: this.currentUuid,
  });
  this.response = await pubnub.objects.removeMemberships(this.parameter);
});

Then('the response contains list with {string} and {string} memberships', function (firstMembership, secondMembership) {
  const actual = this.response.data;
  const firstMembershipData = this.getFixture(firstMembership);
  const secondMembershipData = this.getFixture(secondMembership);
  expect(actual).to.deep.include(firstMembershipData);
  expect(actual).to.deep.include(secondMembershipData);
});

Then('the response contains list with {string} membership', function (membership) {
  const actual = this.response.data;
  const membershipData = this.getFixture(membership);
  expect(actual).to.deep.include(membershipData);
});
