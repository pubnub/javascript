/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

import Keychain from '../../../../../src/core/components/keychain';
import Networking from '../../../../../src/core/components/networking';
import Config from '../../../../../src/core/components/config';

const utils = require('../../../../../src/core/utils');
const assert = require('assert');
const sinon = require('sinon');


describe('#components/networking', () => {
  it.skip('creates a class with default origin', () => {
    var networking = new Networking(() => {}, new Keychain());
    assert.equal(networking.getOrigin(), 'http://pubsub.pubnub.com');
  });

  it.skip('creates a class with enabled SSL FQDN', () => {
    var networking = new Networking(() => {}, new Keychain(), true);
    assert.equal(networking.getOrigin(), 'https://pubsub.pubnub.com');
  });

  it.skip('creates a class with disabled SSL FQDN', () => {
    var networking = new Networking(() => {}, new Keychain(), false);
    assert.equal(networking.getOrigin(), 'http://pubsub.pubnub.com');
  });

  it.skip('creates a class with enabled SSL and custom domain', () => {
    var networking = new Networking(() => {}, new Keychain(), true, 'custom.domain.com');
    assert.equal(networking.getOrigin(), 'https://custom.domain.com');
  });

  it.skip('creates a class with disabled SSL FQDN and custom domain', () => {
    var networking = new Networking(() => {}, new Keychain(), false, 'custom.domain.com');
    assert.equal(networking.getOrigin(), 'http://custom.domain.com');
  });

  describe.skip('#nextOrigin', () => {
    beforeEach(() => {
      sinon.stub(Math, 'random', function () {
        return 0.8;
      });

      sinon.stub(utils, 'generateUUID', function () {
        return '5f0651fc-5b92-4a3b-96ca-08eee41508bd';
      });
    });

    afterEach(() => {
      Math.random.restore();
      utils.generateUUID.restore();
    });

    it('it does not operate on non pubsub domains', () => {
      var networking = new Networking(() => {}, new Keychain(), null, 'custom.url.com');

      let newDomain = networking.nextOrigin(false);
      assert.equal(newDomain, 'http://custom.url.com');
    });

    it('applies the next subdomain if default url is used', () => {
      var networking = new Networking(() => {}, new Keychain(), null, 'pubsub.pubnub.com');

      let newDomain = networking.nextOrigin(false);
      assert.equal(newDomain, 'http://ps19.pubnub.com');
    });

    // assuming MAX=20 inside the configurations, this test is not isolated.
    it('applies the next subdomain if default url is used and resets over', () => {
      var networking = new Networking(() => {}, new Keychain(), null, 'pubsub.pubnub.com');

      let newDomain = networking.nextOrigin(false);
      assert.equal(newDomain, 'http://ps19.pubnub.com');
      newDomain = networking.nextOrigin(false);
      assert.equal(newDomain, 'http://ps1.pubnub.com');
      newDomain = networking.nextOrigin(false);
      assert.equal(newDomain, 'http://ps2.pubnub.com');
      newDomain = networking.nextOrigin(false);
      assert.equal(newDomain, 'http://ps3.pubnub.com');
      newDomain = networking.nextOrigin(false);
      assert.equal(newDomain, 'http://ps4.pubnub.com');
      newDomain = networking.nextOrigin(false);
      assert.equal(newDomain, 'http://ps5.pubnub.com');
    });

    it('supports failover', () => {
      var networking = new Networking(() => {}, new Keychain(), undefined, 'pubsub.pubnub.com');
      let newDomain = networking.nextOrigin(true);
      assert.equal(newDomain, 'http://ps5f0651fc.pubnub.com');

      utils.generateUUID.restore();

      sinon.stub(utils, 'generateUUID', function () {
        return '5f1z51fc-5b92-4a3b-96ca-08eee41508bd';
      });

      newDomain = networking.nextOrigin(true);
      assert.equal(newDomain, 'http://ps5f1z51fc.pubnub.com');
    });
  });

  describe('#shiftStandardOrigin', () => {
    it('calls the #nextOrigin, updates the local variable and returns it', () => {
      let networking = new Networking(() => {}, new Keychain(), undefined, undefined);

      sinon.stub(networking, 'nextOrigin', function () {
        return 'sample-url';
      });

      let newOrigin = networking.shiftStandardOrigin();
      assert.equal(newOrigin, 'sample-url');
      assert.equal(networking.getStandardOrigin(), 'sample-url');

      networking.nextOrigin.restore();
    });
  });

  describe.skip('#prepareParams', () => {
    it('works when the passed data is null', () => {
      let networking = new Networking(() => {}, new Keychain())
        .setCoreParams({ test: 10 });

      let preparedParams = networking.prepareParams();
      assert.deepEqual(preparedParams, { test: 10 });
    });

    it('works when the passed data is set', () => {
      let networking = new Networking(() => {}, new Keychain())
        .setCoreParams({ test: 10 });

      let preparedParams = networking.prepareParams({ test2: 15 });
      assert.deepEqual(preparedParams, { test: 10, test2: 15 });
    });

    it('works when the default core params are note passed', () => {
      let networking = new Networking(() => {}, new Keychain());
      let preparedParams = networking.prepareParams({ test2: 15 });
      assert.deepEqual(preparedParams, { test2: 15 });
    });

    it('works when the passed data is set and it over-rides default', () => {
      let networking = new Networking(() => {}, new Keychain())
        .setCoreParams({ test: 10 });

      let preparedParams = networking.prepareParams({ test: 15 });
      assert.deepEqual(preparedParams, { test: 15 });
    });
  });

  describe.skip('#shiftSubscribeOrigin', () => {
    it('calls the #nextOrigin, updates the local variable and returns it', () => {
      let networking = new Networking(() => {}, new Keychain());

      sinon.stub(networking, 'nextOrigin', function () {
        return 'sample-url';
      });

      let newOrigin = networking.shiftSubscribeOrigin();
      assert.equal(newOrigin, 'sample-url');
      assert.equal(networking.shiftSubscribeOrigin(), 'sample-url');

      networking.nextOrigin.restore();
    });
  });


  describe('#performChannelGroupOperation', () => {
    let config;
    let keychain;
    let networking;
    let validationErrorStub;
    let prepareParamsStub;
    let callbackStub;
    let xdrStub;

    beforeEach(() => {
      config = new Config();
      keychain = new Keychain().setSubscribeKey('subKey').setPublishKey('pubKey');
      networking = new Networking(config, keychain, undefined, 'origin1.pubnub.com');
      callbackStub = sinon.stub();

      xdrStub = sinon.stub(networking, '_xdr');
      validationErrorStub = sinon.stub();
      prepareParamsStub = sinon.stub(networking, 'prepareParams').returns({ base: 'params' });
      networking._r.validationError = validationErrorStub;
    });

    it('errors out if subkey is not defined', () => {
      keychain.setSubscribeKey('');
      networking.performChannelGroupOperation('cg1', 'add', {}, callbackStub);
      assert.equal(validationErrorStub.args[0][0], 'Missing Subscribe Key');
    });


    it('uses auth-key from keychain if provided', () => {
      let data = { my: 'object' };
      keychain.setAuthKey('myAuthKey');
      networking.performChannelGroupOperation('cg1', 'add', data, callbackStub);
      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params', auth: 'myAuthKey' });
    });

    it('executs #prepareParamsMock to prepare params', () => {
      networking.performChannelGroupOperation('cg1', 'add', {}, callbackStub);
      assert.equal(prepareParamsStub.called, true);
    });

    it('passes arguments to the xdr module', () => {
      let expectedData = { base: 'params' };

      networking.performChannelGroupOperation('cg1', 'add', {}, callbackStub);

      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, expectedData);
      assert.deepEqual(xdrStub.args[0][0].callback, callbackStub);
      assert.deepEqual(xdrStub.args[0][0].url, [
        'http://origin1.pubnub.com', 'v1', 'channel-registration', 'sub-key', 'subKey',
        'channel-group', 'cg1'
      ]);
    });

    it('passes arguments to the xdr module when channel-group is not passed', () => {
      let expectedData = { base: 'params' };
      networking.performChannelGroupOperation('', 'add', {}, callbackStub);

      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, expectedData);
      assert.deepEqual(xdrStub.args[0][0].callback, callbackStub);
      assert.deepEqual(xdrStub.args[0][0].url, [
        'http://origin1.pubnub.com', 'v1', 'channel-registration', 'sub-key', 'subKey',
        'channel-group'
      ]);
    });

    it('passes arguments to the xdr module when removing channels', () => {
      let expectedData = { base: 'params' };
      networking.performChannelGroupOperation('cg1', 'remove', {}, callbackStub);

      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, expectedData);
      assert.deepEqual(xdrStub.args[0][0].callback, callbackStub);
      assert.deepEqual(xdrStub.args[0][0].url, [
        'http://origin1.pubnub.com', 'v1', 'channel-registration', 'sub-key', 'subKey',
        'channel-group', 'cg1', 'remove'
      ]);
    });
  });

  describe('#fetchTime', () => {
    let config;
    let keychain;
    let networking;
    let callbackStub;
    let xdrStub;
    let expectedURL = ['http://origin1.pubnub.com', 'time', 0];

    beforeEach(() => {
      config = new Config();
      keychain = new Keychain();
      networking = new Networking(config, keychain, undefined, 'origin1.pubnub.com');
      callbackStub = sinon.stub();

      xdrStub = sinon.stub(networking, '_xdr');
      sinon.stub(networking, 'prepareParams').returns({ base: 'params' });
    });

    it('passes arguments to the xdr module', () => {
      keychain.setUUID('myUniqueId').setAuthKey('authKey');
      let expectedData = { base: 'params', uuid: 'myUniqueId', auth: 'authKey' };

      networking.fetchTime(callbackStub);

      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0], { data: expectedData, callback: callbackStub, url: expectedURL });
    });

    it('passes arguments to the xdr module without auth keys', () => {
      keychain.setUUID('myUniqueId');
      let expectedData = { base: 'params', uuid: 'myUniqueId' };

      networking.fetchTime(callbackStub);

      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0], { data: expectedData, callback: callbackStub, url: expectedURL });
    });

    it('passes arguments to the xdr module without UUID keys', () => {
      let expectedData = { base: 'params' };

      networking.fetchTime(callbackStub);

      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0], { data: expectedData, callback: callbackStub, url: expectedURL });
    });
  });

  describe('#fetchHistory', () => {
    let config;
    let keychain;
    let networking;
    let validationErrorStub;
    let prepareParamsStub;
    let callbackStub;
    let xdrStub;

    beforeEach(() => {
      config = new Config();
      keychain = new Keychain().setSubscribeKey('subKey');
      networking = new Networking(config, keychain, undefined, 'origin1.pubnub.com');
      callbackStub = sinon.stub();

      xdrStub = sinon.stub(networking, '_xdr');
      validationErrorStub = sinon.stub();
      prepareParamsStub = sinon.stub(networking, 'prepareParams').returns({ base: 'params' });
      networking._r.validationError = validationErrorStub;
    });

    it('passes arguments to the xdr module', () => {
      let data = { my: 'object' };
      networking.fetchHistory('mychannel', data, callbackStub);

      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params' });
      assert.deepEqual(xdrStub.args[0][0].callback, callbackStub);
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'v2', 'history',
        'sub-key', 'subKey', 'channel', 'mychannel']);
    });

    it('errors out if subkey is not defined', () => {
      keychain.setSubscribeKey('');
      networking.fetchHistory('mychannel', { channel: 'ch1' }, callbackStub);
      assert.equal(validationErrorStub.args[0][0], 'Missing Subscribe Key');
    });

    it('uses auth-key from keychain if provided', () => {
      let data = { my: 'object' };
      keychain.setAuthKey('myAuthKey');
      networking.fetchHistory('mychannel', data, callbackStub);
      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params', auth: 'myAuthKey' });
    });

    it('executs #prepareParamsMock to prepare params', () => {
      networking.fetchHistory('mychannel1', {}, callbackStub);
      assert.equal(prepareParamsStub.called, true);
    });
  });

  describe('#performPublish', () => {
    let config;
    let keychain;
    let networking;
    let validationErrorStub;
    let prepareParamsStub;
    let callbackStub;
    let xdrStub;
    let postXDRStub;

    beforeEach(() => {
      config = new Config();
      keychain = new Keychain().setSubscribeKey('subKey').setPublishKey('pubKey');
      networking = new Networking(config, keychain, undefined, 'origin1.pubnub.com');
      callbackStub = sinon.stub();

      xdrStub = sinon.stub(networking, '_xdr');
      postXDRStub = sinon.stub(networking, '_postXDR');
      validationErrorStub = sinon.stub();
      prepareParamsStub = sinon.stub(networking, 'prepareParams').returns({ base: 'params' });
      networking._r.validationError = validationErrorStub;
    });

    it('passes arguments to the xdr module', () => {
      let data = { my: 'object' };
      networking.performPublish('mychannel', 'ma-payload', data, 'GET', callbackStub);

      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params' });
      assert.deepEqual(xdrStub.args[0][0].callback, callbackStub);
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'publish',
        'pubKey', 'subKey', 0, 'mychannel', 0, 'ma-payload']);
    });

    it('errors out if subkey is not defined', () => {
      keychain.setSubscribeKey('');
      networking.performPublish('mychannel', 'my-payload', {}, 'GET', callbackStub);
      assert.equal(validationErrorStub.args[0][0], 'Missing Subscribe Key');
    });

    it('errors out if pubkey is not defined', () => {
      keychain.setPublishKey('');
      networking.performPublish('mychannel', 'my-payload', {}, 'GET', callbackStub);
      assert.equal(validationErrorStub.args[0][0], 'Missing Publish Key');
    });

    it('uses auth-key from keychain if provided', () => {
      let data = { my: 'object' };
      keychain.setAuthKey('myAuthKey');
      networking.performPublish('mychannel', 'my-payload', data, 'GET', callbackStub);
      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params', auth: 'myAuthKey' });
    });

    it('executes call against the POST interfaces', () => {
      let data = { my: 'object' };
      keychain.setAuthKey('myAuthKey');
      networking.performPublish('mychannel', 'my-payload', data, 'POST', callbackStub);
      assert.equal(postXDRStub.callCount, 1);
      assert.deepEqual(postXDRStub.args[0][0].data, { base: 'params', auth: 'myAuthKey' });
    });

    it('executs #prepareParamsMock to prepare params', () => {
      networking.performPublish('mychannel', 'my-payload', {}, 'GET', callbackStub);
      assert.equal(prepareParamsStub.called, true);
    });
  });

  describe('#fetchWhereNow', () => {
    let config;
    let keychain;
    let networking;
    let validationErrorStub;
    let prepareParamsStub;
    let callbackStub;
    let xdrStub;

    beforeEach(() => {
      config = new Config();
      keychain = new Keychain().setSubscribeKey('subKey').setPublishKey('pubKey').setUUID('keychainUUID');
      networking = new Networking(config, keychain, undefined, 'origin1.pubnub.com');
      callbackStub = sinon.stub();

      xdrStub = sinon.stub(networking, '_xdr');
      validationErrorStub = sinon.stub();
      prepareParamsStub = sinon.stub(networking, 'prepareParams').returns({ base: 'params' });
      networking._r.validationError = validationErrorStub;
    });

    it('errors out if subkey is not defined', () => {
      keychain.setSubscribeKey('');
      networking.fetchWhereNow('uuid', callbackStub);
      assert.equal(validationErrorStub.args[0][0], 'Missing Subscribe Key');
    });

    it('uses auth-key from keychain if provided', () => {
      keychain.setAuthKey('myAuthKey');
      networking.fetchWhereNow('uuid', callbackStub);
      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params', auth: 'myAuthKey' });
    });

    it('uses keychain uuid if uuid is not provided', () => {
      networking.fetchWhereNow(null, callbackStub);
      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params' });
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'v2', 'presence',
        'sub_key', 'subKey', 'uuid', 'keychainUUID']);
    });

    it('executs #prepareParamsMock to prepare params', () => {
      networking.fetchWhereNow('uuid', callbackStub);
      assert.equal(prepareParamsStub.called, true);
    });

    it('passes arguments to the xdr module', () => {
      networking.fetchWhereNow('my-uuid', callbackStub);

      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params' });
      assert.deepEqual(xdrStub.args[0][0].callback, callbackStub);
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'v2', 'presence',
        'sub_key', 'subKey', 'uuid', 'my-uuid']);
    });
  });

  describe('#fetchHereNow', () => {
    let config;
    let keychain;
    let networking;
    let validationErrorStub;
    let prepareParamsStub;
    let callbackStub;
    let xdrStub;

    beforeEach(() => {
      config = new Config();
      keychain = new Keychain().setSubscribeKey('subKey').setPublishKey('pubKey').setUUID('keychainUUID');
      networking = new Networking(config, keychain, undefined, 'origin1.pubnub.com');
      callbackStub = sinon.stub();

      xdrStub = sinon.stub(networking, '_xdr');
      validationErrorStub = sinon.stub();
      prepareParamsStub = sinon.stub(networking, 'prepareParams').returns({ base: 'params' });
      networking._r.validationError = validationErrorStub;
    });

    it('errors out if subkey is not defined', () => {
      keychain.setSubscribeKey('');
      networking.fetchHereNow('c1', 'cg1', {}, callbackStub);
      assert.equal(validationErrorStub.args[0][0], 'Missing Subscribe Key');
    });

    it('uses auth-key from keychain if provided', () => {
      keychain.setAuthKey('myAuthKey');
      networking.fetchHereNow('c1', 'cg1', {}, callbackStub);
      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params', uuid: 'keychainUUID', auth: 'myAuthKey' });
    });

    it('passes arguments to the xdr module w/ channels', () => {
      networking.fetchHereNow('mychannel', undefined, {}, callbackStub);

      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params', uuid: 'keychainUUID' });
      assert.deepEqual(xdrStub.args[0][0].callback, callbackStub);
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'v2', 'presence',
        'sub_key', 'subKey', 'channel', 'mychannel']);
    });

    it('executs #prepareParamsMock to prepare params', () => {
      networking.fetchHereNow('mychannel', undefined, {}, callbackStub);
      assert.equal(prepareParamsStub.called, true);
    });

    it('passes arguments to the xdr module w/ encoded channels', () => {
      networking.fetchHereNow('m$$ych$annel', undefined, {}, callbackStub);

      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params', uuid: 'keychainUUID' });
      assert.deepEqual(xdrStub.args[0][0].callback, callbackStub);
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'v2', 'presence',
        'sub_key', 'subKey', 'channel', 'm%24%24ych%24annel']);
    });

    it('passes arguments to the xdr module w/ channel groups', () => {
      networking.fetchHereNow(undefined, 'cg1,cg2,cg3', {}, callbackStub);

      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params', uuid: 'keychainUUID' });
      assert.deepEqual(xdrStub.args[0][0].callback, callbackStub);
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'v2', 'presence',
        'sub_key', 'subKey', 'channel', ',']);
    });

    it('passes arguments to the xdr module w/ undefined channel, channel groups', () => {
      networking.fetchHereNow(undefined, undefined, {}, callbackStub);

      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params', uuid: 'keychainUUID' });
      assert.deepEqual(xdrStub.args[0][0].callback, callbackStub);
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'v2', 'presence',
        'sub_key', 'subKey']);
    });
  });

  describe.skip('#performAudit', () => {
    it('passes arguments to the xdr module', () => {
      let xdrStub = sinon.stub();
      let successStub = sinon.stub();
      let failStub = sinon.stub();
      let callbackStub = sinon.stub();
      let data = { my: 'object' };

      let keychain = new Keychain()
        .setSubscribeKey('subKey')
        .setPublishKey('pubKey');

      let networkingComponent = new Networking(xdrStub, keychain, undefined, 'origin1.pubnub.com');

      networkingComponent.performAudit({
        fail: failStub,
        success: successStub,
        callback: callbackStub,
        data: data
      });

      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, data);
      assert.deepEqual(xdrStub.args[0][0].success, successStub);
      assert.deepEqual(xdrStub.args[0][0].fail, failStub);
      assert.deepEqual(xdrStub.args[0][0].callback, callbackStub);
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'v1', 'auth',
        'audit', 'sub-key', 'subKey']);
    });
  });

  describe.skip('#performGrant', () => {
    it('passes arguments to the xdr module', () => {
      let xdrStub = sinon.stub();
      let successStub = sinon.stub();
      let failStub = sinon.stub();
      let callbackStub = sinon.stub();
      let data = { my: 'object' };

      let keychain = new Keychain()
        .setSubscribeKey('subKey')
        .setPublishKey('pubKey');

      let networkingComponent = new Networking(xdrStub, keychain, undefined, 'origin1.pubnub.com');

      networkingComponent.performGrant({
        fail: failStub,
        success: successStub,
        callback: callbackStub,
        data: data
      });

      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, data);
      assert.deepEqual(xdrStub.args[0][0].success, successStub);
      assert.deepEqual(xdrStub.args[0][0].fail, failStub);
      assert.deepEqual(xdrStub.args[0][0].callback, callbackStub);
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'v1', 'auth',
        'grant', 'sub-key', 'subKey']);
    });
  });

  describe('#provisionDeviceForPush', () => {
    let config;
    let keychain;
    let networking;
    let validationErrorStub;
    let prepareParamsStub;
    let callbackStub;
    let xdrStub;

    beforeEach(() => {
      config = new Config();
      keychain = new Keychain().setSubscribeKey('subKey').setPublishKey('pubKey').setUUID('keychainUUID');
      networking = new Networking(config, keychain, undefined, 'origin1.pubnub.com');
      callbackStub = sinon.stub();

      xdrStub = sinon.stub(networking, '_xdr');
      validationErrorStub = sinon.stub();
      prepareParamsStub = sinon.stub(networking, 'prepareParams').returns({ base: 'params' });
      networking._r.validationError = validationErrorStub;
    });

    it('errors out if subkey is not defined', () => {
      keychain.setSubscribeKey('');
      networking.provisionDeviceForPush('mychannel', {}, callbackStub);
      assert.equal(validationErrorStub.args[0][0], 'Missing Subscribe Key');
    });

    it('errors out if pubkey is not defined', () => {
      keychain.setPublishKey('');
      networking.provisionDeviceForPush('mychannel', {}, callbackStub);
      assert.equal(validationErrorStub.args[0][0], 'Missing Publish Key');
    });


    it('uses auth-key, uuid from keychain', () => {
      let data = { my: 'object' };
      keychain.setAuthKey('myAuthKey');
      networking.provisionDeviceForPush('mychannel', data, callbackStub);
      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params', auth: 'myAuthKey', uuid: 'keychainUUID' });
    });

    it('executs #prepareParamsMock to prepare params', () => {
      networking.provisionDeviceForPush('mychannel', {}, callbackStub);
      assert.equal(prepareParamsStub.called, true);
    });

    it('passes arguments to the xdr module', () => {
      keychain.setAuthKey('myAuthKey');
      networking.provisionDeviceForPush('device1', {}, callbackStub);

      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params', auth: 'myAuthKey', uuid: 'keychainUUID' });
      assert.deepEqual(xdrStub.args[0][0].callback, callbackStub);
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'v1', 'push',
        'sub-key', 'subKey', 'devices', 'device1']);
    });
  });

  describe('#_xhr', () => {
    it('triggers error if payload contains an error and is an object', () => {
      let payload = { error: true, message: 'message', payload: 'payload' };
      instance._handleHistoryResponse(payload, err, callback, false, 'cipherKey');

      assert.equal(err.called, 1);
      assert.deepEqual(err.args[0][0], { message: 'message', payload: 'payload' });
    });
  })

});
