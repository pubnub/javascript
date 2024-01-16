import { When, Then, Given } from '@cucumber/cucumber';
import { expect } from 'chai';

Given('I have a keyset with Objects V2 enabled', function () {
  this.keyset = this.fixtures.demoKeyset;
});

Given('the id for {string} persona', async function (persona) {
  const user = this.getFixture(persona);
  this.parameter = { ...this.parameter, uuid: user.id };
});

Given('the data for {string} persona', async function (persona) {
  const user = this.getFixture(persona);
  this.parameter = {
    ...this.parameter,
    uuid: user.id,
    data: {
      name: user.name,
      email: user.email,
      custom: user.custom,
      externalId: user.externalId,
      profileUrl: user.profileUrl,
    },
  };
});

Given('current user is {string} persona', async function (persona) {
  this.currentUuid = this.getFixture(persona).id;
});

When('I get the UUID metadata', async function () {
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });
  this.response = await pubnub.objects.getUUIDMetadata(this.parameter);
});

When('I set the UUID metadata', async function () {
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });

  this.response = await pubnub.objects.setUUIDMetadata(this.parameter);
});

When('I get the UUID metadata with custom for current user', async function () {
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
    uuid: this.currentUuid,
  });
  this.response = await pubnub.objects.getUUIDMetadata({ incldue: { customFields: true } });
});

When('I remove the UUID metadata', async function () {
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });

  this.response = await pubnub.objects.removeUUIDMetadata(this.parameter);
});

When('I remove the UUID metadata for current user', async function () {
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
    uuid: this.currentUuid,
  });

  this.response = await pubnub.objects.removeUUIDMetadata();
});

When('I get all UUID metadata', async function () {
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });

  this.response = await pubnub.objects.getAllUUIDMetadata();
});

When('I get all UUID metadata with custom', async function () {
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
  });

  this.response = await pubnub.objects.getAllUUIDMetadata({ include: { customFields: true } });
});

Then('the UUID metadata for {string} persona', async function (persona) {
  const actual = this.response.data;
  const expected = this.getFixture(persona);
  expect(actual).to.deep.equal(expected);
});

Then('the UUID metadata for {string} persona contains updated', async function (persona) {
  const actual = this.response.data;
  const expected = this.getFixture(persona);
  expect(actual).to.deep.equal(expected);
});

Then('I receive a successful response', function () {
  expect(this.response.status).to.equal(200);
});

Then('the response contains list with {string} and {string} UUID metadata', function (firstPersona, secondPersona) {
  const firstPersonaData = this.getFixture(firstPersona);
  const secondPersonaData = this.getFixture(secondPersona);
  const actual = this.response.data;
  expect(actual).to.have.lengthOf(2);
  expect(actual).to.deep.include(firstPersonaData);
  expect(actual).to.deep.include(secondPersonaData);
});
