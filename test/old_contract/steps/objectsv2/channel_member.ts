import { When, Then, Given } from '@cucumber/cucumber';
import { expect } from 'chai';

Given('the data for {string} member', function (member) {
  const memberData = this.getFixture(member);
  this.parameter = { ...this.parameter, uuids: [{ id: memberData.uuid.id, custom: memberData.custom }] };
});

When('I get the channel members', async function () {
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });
  this.response = await pubnub.objects.getChannelMembers(this.parameter);
});

When('I get the channel members including custom and UUID custom information', async function () {
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });
  this.response = await pubnub.objects.getChannelMembers({
    ...this.parameter,
    include: { customFields: true, customUUIDFields: true },
  });
});

When('I set a channel member', async function () {
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });
  this.response = await pubnub.objects.setChannelMembers(this.parameter);
});

When('I set a channel member including custom and UUID with custom', async function () {
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });
  this.response = await pubnub.objects.setChannelMembers({
    ...this.parameter,
    include: { customFields: true, customUUIDFields: true },
  });
});

Then('the response contains list with {string} and {string} members', function (firstMember, secondMember) {
  const actual = this.response.data;
  const firstMemberData = this.getFixture(firstMember);
  const secondMemberData = this.getFixture(secondMember);
  expect(actual).to.deep.include(firstMemberData);
  expect(actual).to.deep.include(secondMemberData);
});

Then('the response contains list with {string} member', function (member) {
  const actual = this.response.data;
  const memberData = this.getFixture(member);
  expect(actual).to.deep.include(memberData);
});

Given('the data for {string} member that we want to remove', function (member) {
  const memberData = this.getFixture(member);
  this.parameter = { ...this.parameter, uuids: [{ id: memberData.uuid.id }] };
});

When('I remove a channel member', async function () {
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });
  this.response = await pubnub.objects.removeChannelMembers(this.parameter);
});
