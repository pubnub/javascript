import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { expect } from 'chai';
import {
  ACCESS_PERMISSION,
  RESOURCE_TYPE
} from '../../enums.js';

// Before({ tags: '@contract=grantAllPermissions' }, function () {
//   this.grantPayload = {};
// });

Before(function () {
  this.grantPayload = {};
});

Given('I have a keyset with access manager enabled', function() {
  this.keyset = this.fixtures.accessManagerKeyset;
});

Given('the authorized UUID {string}', function(uuid: string) {
  this.grantPayload.authorized_uuid = uuid;
});

Given('the TTL {int}', function(ttl: number) {
  this.grantPayload.ttl = ttl;
});

Given('the {string} {resource_type} resource access permissions', function(resourceName: string, resourceType: RESOURCE_TYPE) {
  this.resourceName = resourceName;
  this.resourceType = resourceType;
  
  this.grantPayload.resources = this.grantPayload.resources || {};
  this.grantPayload.resources[this.resourceType] = this.grantPayload.resources[this.resourceType] || {};

  this.grantPayload.resources[this.resourceType][this.resourceName] = {};
});

Given('the {string} {resource_type} pattern access permissions', function(resourceName: string, resourceType: RESOURCE_TYPE) {
  this.resourceName = resourceName;
  this.resourceType = resourceType;

  this.grantPayload.patterns = this.grantPayload.patterns || {};
  this.grantPayload.patterns[this.resourceType] = this.grantPayload.patterns[this.resourceType] || {};

  this.grantPayload.patterns[this.resourceType][this.resourceName] = {};
});

Given('grant resource permission {access_permission}', function(accessPermission: ACCESS_PERMISSION) {
  this.grantPayload.resources[this.resourceType][this.resourceName][accessPermission] = true;
});

Given('deny resource permission {access_permission}', function(accessPermission: ACCESS_PERMISSION) {
  this.grantPayload.resources[this.resourceType][this.resourceName][accessPermission] = false;
});

Given('grant pattern permission {access_permission}', function(accessPermission: ACCESS_PERMISSION) {
  this.grantPayload.patterns[this.resourceType][this.resourceName][accessPermission] = true;
});

Given('deny pattern permission {access_permission}', function(accessPermission: ACCESS_PERMISSION) {
  this.grantPayload.patterns[this.resourceType][this.resourceName][accessPermission] = false;
});

When('I grant a token specifying those permissions', async function() {
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
    secretKey: this.keyset.secretKey
  });

  this.token = await pubnub.grantToken(this.grantPayload);
  expect(this.token).not.to.be.empty;
  // console.log('token', this.token);
  this.parsedToken = pubnub.parseToken(this.token);
  expect(this.parsedToken).to.exist;
  // console.log('parsed token', JSON.stringify(this.parsedToken, null, 2));
});

When('I attempt to grant a token specifying those permissions', async function() {
  const pubnub = await this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey,
    secretKey: this.keyset.secretKey
  });

  try {
    this.token = await pubnub.grantToken(this.grantPayload);
    // console.log('not expected token', this.token)
  } catch (e: any) {
    // console.log('expected error', e)
    this.expectedError = e?.status?.errorData;
  }
  expect(this.expectedError).not.to.be.undefined;
});

Then('the token contains the TTL {int}', function(ttl: number) {
  expect(this.parsedToken.ttl).to.equal(ttl);
});

Then('the token contains the authorized UUID {string}', function(uuid: string) {
  expect(this.parsedToken.authorized_uuid).to.equal(uuid);
});

Then('the token has {string} {resource_type} resource access permissions', function(resourceName: string, resourceType: RESOURCE_TYPE) {
  this.resourceName = resourceName;
  this.resourceType = resourceType;
  expect(this.parsedToken.resources[this.resourceType]).to.exist;
  expect(this.parsedToken.resources[this.resourceType][this.resourceName]).to.exist;
});

Then('the token has {string} {resource_type} pattern access permissions', function(resourceName: string, resourceType: RESOURCE_TYPE) {
  this.resourceName = resourceName;
  this.resourceType = resourceType;

  expect(this.parsedToken.patterns[this.resourceType]).to.exist;
  expect(this.parsedToken.patterns[this.resourceType][this.resourceName]).to.exist;
});

Then('token resource permission {access_permission}', function(accessPermission: ACCESS_PERMISSION) {
  expect(this.parsedToken.resources[this.resourceType][this.resourceName][accessPermission]).to.be.true;
});

Then('token pattern permission {access_permission}', function(accessPermission: ACCESS_PERMISSION) {
  expect(this.parsedToken.patterns[this.resourceType][this.resourceName][accessPermission]).to.be.true;
});

Then('the token does not contain an authorized uuid', function () {
  expect(this.parsedToken.uuid).to.be.undefined;
});

Then('an error is returned', function () {
  expect(this.expectedError.status).to.be.a('number');

  expect(this.expectedError.error).to.be.an('object');
  expect(this.expectedError.error).to.have.keys([ 'message', 'source', 'details' ]);
  
  expect(this.expectedError.error.message).to.be.a('string');
  
  expect(this.expectedError.error.source).to.be.a('string');

  expect(this.expectedError.error.details).to.be.an('array');
  expect(this.expectedError.error.details).to.have.lengthOf.at.least(1);

  let details = this.expectedError.error.details[0];

  expect(details).to.be.an('object');
  expect(details).to.have.keys([ 'message', 'location', 'locationType' ]);

  expect(details.message).to.be.a('string');
  expect(details.location).to.be.a('string');
  expect(details.locationType).to.be.a('string');
});

Then('the error status code is {int}', function (statusCode: number) {
  expect(this.expectedError.status).to.equal(statusCode);
});

Then('the error message is {string}', function (errorMessage) {
  expect(this.expectedError.error.message).to.equal(errorMessage);
});

Then('the error service is {string}', function (errorService) {
  expect(this.expectedError.service).to.equal(errorService);
});

Then('the error source is {string}', function (errorSource: string) {
  expect(this.expectedError.error.source).to.equal(errorSource);
});

Then('the error detail message is {string}', function (detailsMessage) {
  let details = this.expectedError.error.details[0];
  expect(details.message).to.equal(detailsMessage);
});

Then('the error detail message is not empty', function () {
  let details = this.expectedError.error.details[0];
  expect(details.message).to.not.to.be.empty;
});

Then('the error detail location is {string}', function (errorLocation: string) {
  let details = this.expectedError.error.details[0];
  expect(details.location).to.equal(errorLocation);
});

Then('the error detail location type is {string}', function (errorLocationType: string) {
  let details = this.expectedError.error.details[0];
  expect(details.locationType).to.equal(errorLocationType);
});

Given('I have a known token containing an authorized UUID', function() {
  this.token = this.fixtures.tokenWithKnownAuthorizedUUID;
});

Given('I have a known token containing UUID resource permissions', function() {
  this.token = this.fixtures.tokenWithUUIDResourcePermissions;
});

Given('I have a known token containing UUID pattern Permissions', function() {
  this.token = this.fixtures.tokenWithUUIDPatternPermissions;
});

When('I parse the token', function() {
  expect(this.token).not.to.be.empty;
  let pubnub = this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey
  });
  this.parsedToken = pubnub.parseToken(this.token);
});

Then('the parsed token output contains the authorized UUID {string}', function(uuid) {
  expect(this.parsedToken).to.exist;
  expect(this.parsedToken.authorized_uuid).to.equal(uuid);
});
