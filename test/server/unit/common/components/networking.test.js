/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

import Keychain from '../../../../../src/core/components/keychain';
import Networking from '../../../../../src/core/components/networking';
import Config from '../../../../../src/core/components/config';
import Crypto from '../../../../../src/core/components/cryptography/index';

const utils = require('../../../../../src/core/utils');
const assert = require('assert');
const sinon = require('sinon');

import superagent from 'superagent';

describe('#components/networking', () => {
  let config;
  let keychain;

  beforeEach(() => {
    config = new Config();
    keychain = new Keychain().setSubscribeKey('subKey').setPublishKey('pubKey');
  });

  it('creates a class with default origin', () => {
    let networking = new Networking({ config, keychain }, undefined, undefined);
    assert.equal(networking._providedFQDN, 'http://pubsub.pubnub.com');
  });

  it('creates a class with enabled SSL FQDN', () => {
    let networking = new Networking({ config, keychain }, true);
    assert.equal(networking._providedFQDN, 'https://pubsub.pubnub.com');
  });

  it('creates a class with disabled SSL FQDN', () => {
    let networking = new Networking({ config, keychain }, false);
    assert.equal(networking._providedFQDN, 'http://pubsub.pubnub.com');
  });

  it('creates a class with enabled SSL and custom domain', () => {
    let networking = new Networking({ config, keychain }, true, 'custom.domain.com');
    assert.equal(networking._providedFQDN, 'https://custom.domain.com');
  });

  it('creates a class with disabled SSL FQDN and custom domain', () => {
    let networking = new Networking({ config, keychain }, false, 'custom.domain.com');
    assert.equal(networking._providedFQDN, 'http://custom.domain.com');
  });

  describe('#nextOrigin', () => {
    beforeEach(() => {
      config = new Config();
      keychain = new Keychain().setSubscribeKey('subKey').setPublishKey('pubKey');

      sinon.stub(Math, 'random', () => 0.8);
      sinon.stub(utils, 'generateUUID', () => '5f0651fc-5b92-4a3b-96ca-08eee41508bd');
    });

    afterEach(() => {
      Math.random.restore();
      utils.generateUUID.restore();
    });

    it('it does not operate on non pubsub domains', () => {
      let networking = new Networking({ config, keychain }, null, 'custom.url.com');
      let newDomain = networking.nextOrigin(false);
      assert.equal(newDomain, 'http://custom.url.com');
    });

    it('applies the next subdomain if default url is used', () => {
      let networking = new Networking({ config, keychain }, null, 'pubsub.pubnub.com');
      let newDomain = networking.nextOrigin(false);
      assert.equal(newDomain, 'http://ps19.pubnub.com');
    });

    // assuming MAX=20 inside the configurations, this test is not isolated.
    it('applies the next subdomain if default url is used and resets over', () => {
      let networking = new Networking({ config, keychain }, null, 'pubsub.pubnub.com');
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
      let networking = new Networking({ config, keychain }, undefined, 'pubsub.pubnub.com');
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
    let config;
    let keychain;

    beforeEach(() => {
      config = new Config();
      keychain = new Keychain().setSubscribeKey('subKey').setPublishKey('pubKey');
    });

    it('calls the #nextOrigin, updates the local variable and returns it', () => {
      let networking = new Networking({ config, keychain }, undefined, undefined);

      sinon.stub(networking, 'nextOrigin', function () {
        return 'sample-url';
      });

      let newOrigin = networking.shiftStandardOrigin();
      assert.equal(newOrigin, 'sample-url');
      assert.equal(networking.getStandardOrigin(), 'sample-url');

      networking.nextOrigin.restore();
    });
  });

  describe('#prepareParams', () => {
    let networking;
    let config;

    beforeEach(() => {
      config = new Config();
      let keychain = new Keychain().setSubscribeKey('subKey').setPublishKey('pubKey').setInstanceId('myId');
      networking = new Networking({ config, keychain }, undefined, 'origin1.pubnub.com');
    });

    it('works when the default core params are note passed', () => {
      let preparedParams = networking.prepareParams({ test2: 15 });
      assert.deepEqual(preparedParams, { test2: 15 });
    });

    it('passes instance id', () => {
      config.setInstanceIdConfig(true);
      let preparedParams = networking.prepareParams({ test2: 15 });
      assert.deepEqual(preparedParams, { test2: 15, instanceid: 'myId' });
    });

    it('works when the passed data is set and it over-rides default', () => {
      networking.addCoreParam('test', 10);

      let preparedParams = networking.prepareParams({ test: 15 });
      assert.deepEqual(preparedParams, { test: 15 });
    });
  });

  describe('#shiftSubscribeOrigin', () => {
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
      networking = new Networking({ config, keychain }, undefined, 'origin1.pubnub.com');
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
      networking = new Networking({ config, keychain }, undefined, 'origin1.pubnub.com');
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
      networking = new Networking({ config, keychain }, undefined, 'origin1.pubnub.com');
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
    let cryptoStub;

    beforeEach(() => {
      config = new Config();
      keychain = new Keychain().setSubscribeKey('subKey').setPublishKey('pubKey');
      cryptoStub = new Crypto({ keychain });
      networking = new Networking({ config, keychain, crypto: cryptoStub }, undefined, 'origin1.pubnub.com');
      callbackStub = sinon.stub();

      xdrStub = sinon.stub(networking, '_xdr');
      postXDRStub = sinon.stub(networking, '_postXDR');
      validationErrorStub = sinon.stub();
      prepareParamsStub = sinon.stub(networking, 'prepareParams').returns({ base: 'params' });
      networking._r.validationError = validationErrorStub;
    });

    it('uses encrypt method with cipher key passed', () => {
      let encryptStub = sinon.stub(cryptoStub, 'encrypt').returns('{\"hi\":\"there\"}');
      keychain.setCipherKey('maCipherKey');
      networking.performPublish('mychannel', { hi: 'there' }, {}, 'GET', callbackStub);
      assert.deepEqual(encryptStub.args[0], ['{\"hi\":\"there\"}']);

      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params' });
      assert.deepEqual(xdrStub.args[0][0].callback, callbackStub);
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'publish',
        'pubKey', 'subKey', 0, 'mychannel', 0, '%7B%22hi%22%3A%22there%22%7D']);
    });

    it('passes arguments to the xdr module', () => {
      let data = { my: 'object' };
      networking.performPublish('mychannel', 'ma-payload', data, 'GET', callbackStub);

      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params' });
      assert.deepEqual(xdrStub.args[0][0].callback, callbackStub);
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'publish',
        'pubKey', 'subKey', 0, 'mychannel', 0, '%22ma-payload%22']);
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
      assert.deepEqual(postXDRStub.args[0][0].data, { base: 'params', auth: 'myAuthKey', message: '%22my-payload%22' });
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
      networking = new Networking({ config, keychain }, undefined, 'origin1.pubnub.com');
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
        'sub-key', 'subKey', 'uuid', 'keychainUUID']);
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
        'sub-key', 'subKey', 'uuid', 'my-uuid']);
    });
  });

  describe('#performLeave', () => {
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
      networking = new Networking({ config, keychain }, undefined, 'origin1.pubnub.com');
      callbackStub = sinon.stub();

      xdrStub = sinon.stub(networking, '_xdr');
      validationErrorStub = sinon.stub();
      prepareParamsStub = sinon.stub(networking, 'prepareParams').returns({ base: 'params' });
      networking._r.validationError = validationErrorStub;
    });

    it('errors out if subkey is not defined', () => {
      keychain.setSubscribeKey('');
      networking.performLeave('uuid', {}, callbackStub);
      assert.equal(validationErrorStub.args[0][0], 'Missing Subscribe Key');
    });

    it('uses auth-key from keychain if provided', () => {
      keychain.setAuthKey('myAuthKey');
      networking.performLeave('uuid', {}, callbackStub);
      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params', auth: 'myAuthKey', uuid: 'keychainUUID' });
    });

    it('executs #prepareParamsMock to prepare params', () => {
      networking.performLeave('uuid', { arg: '10' }, callbackStub);
      assert.equal(prepareParamsStub.called, true);
      assert.deepEqual(prepareParamsStub.args[0][0], { arg: '10' });
    });

    it('passes arguments if the beacon interface is in-place', () => {
      config.useSendBeacon = true;
      let sendBeacon = sinon.stub();
      networking = new Networking({ config, keychain, sendBeacon }, undefined, 'origin1.pubnub.com');
      networking.performLeave('uuid', { arg: '10' }, callbackStub);

      assert.equal(sendBeacon.called, 1);
      assert.equal(sendBeacon.args[0]['http://origin1.pubnub.com/v2/presence/sub_key/subKey/channel/uuid/leave?arg=10&uuid=keychainUUID']);
    });

    it('passes arguments to the xdr module', () => {
      networking.performLeave('ch1', {}, callbackStub);

      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params', uuid: 'keychainUUID' });
      assert.deepEqual(xdrStub.args[0][0].callback, callbackStub);
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'v2', 'presence',
        'sub_key', 'subKey', 'channel', 'ch1', 'leave']);
    });
  });

  describe('#performSubscribe', () => {
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
      networking = new Networking({ config, keychain }, undefined, 'origin1.pubnub.com');
      callbackStub = sinon.stub();

      xdrStub = sinon.stub(networking, '_xdr').returns('xdrModule');
      validationErrorStub = sinon.stub();
      prepareParamsStub = sinon.stub(networking, 'prepareParams').returns({ base: 'params' });
      networking._r.validationError = validationErrorStub;
    });

    it('errors out if subkey is not defined', () => {
      keychain.setSubscribeKey('');
      networking.performSubscribe('uuid', {}, callbackStub);
      assert.equal(validationErrorStub.args[0][0], 'Missing Subscribe Key');
    });

    it('uses auth-key from keychain if provided', () => {
      keychain.setAuthKey('myAuthKey');
      networking.performSubscribe('uuid', {}, callbackStub);
      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params', auth: 'myAuthKey', uuid: 'keychainUUID' });
    });

    it('uses keychain uuid if uuid is not provided', () => {
      networking.performSubscribe('ch1', {}, callbackStub);
      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params', uuid: 'keychainUUID' });
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'v2', 'subscribe',
        'subKey', 'ch1', '0']);
    });

    it('passes the config timeout', () => {
      config.subscribeRequestTimeout = 1337;
      networking.performSubscribe('ch1', {}, callbackStub);
      assert.equal(xdrStub.callCount, 1);
      assert.equal(xdrStub.args[0][0].timeout, 1337);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params', uuid: 'keychainUUID' });
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'v2', 'subscribe',
        'subKey', 'ch1', '0']);
    });

    it('executs #prepareParamsMock to prepare params', () => {
      networking.performSubscribe('uuid', { arg: '10' }, callbackStub);
      assert.equal(prepareParamsStub.called, true);
      assert.deepEqual(prepareParamsStub.args[0][0], { arg: '10' });
    });

    it('passes arguments to the xdr module', () => {
      let xdrInstance = networking.performSubscribe('ch1', { arg: '10' }, callbackStub);

      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params', uuid: 'keychainUUID' });
      assert.deepEqual(xdrStub.args[0][0].callback, callbackStub);
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'v2', 'subscribe',
        'subKey', 'ch1', '0']);

      assert.equal(xdrInstance, 'xdrModule');
    });
  });

  describe('#fetchState', () => {
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
      networking = new Networking({ config, keychain }, undefined, 'origin1.pubnub.com');
      callbackStub = sinon.stub();

      xdrStub = sinon.stub(networking, '_xdr');
      validationErrorStub = sinon.stub();
      prepareParamsStub = sinon.stub(networking, 'prepareParams').returns({ base: 'params' });
      networking._r.validationError = validationErrorStub;
    });

    it('errors out if subkey is not defined', () => {
      keychain.setSubscribeKey('');
      networking.fetchState('uuid', 'ch1', {}, callbackStub);
      assert.equal(validationErrorStub.args[0][0], 'Missing Subscribe Key');
    });

    it('uses auth-key from keychain if provided', () => {
      keychain.setAuthKey('myAuthKey');
      networking.fetchState('uuid', 'ch1', {}, callbackStub);
      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params', auth: 'myAuthKey' });
    });

    it('uses keychain uuid if uuid is not provided', () => {
      networking.fetchState(null, 'ch1', {}, callbackStub);
      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params' });
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'v2', 'presence',
        'sub-key', 'subKey', 'channel', 'ch1', 'uuid', 'keychainUUID']);
    });

    it('executs #prepareParamsMock to prepare params', () => {
      networking.fetchState('uuid', 'ch1', { arg: '10' }, callbackStub);
      assert.equal(prepareParamsStub.called, true);
      assert.deepEqual(prepareParamsStub.args[0][0], { arg: '10' });
    });

    it('passes arguments to the xdr module', () => {
      networking.fetchState(null, 'ch1', {}, callbackStub);

      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params' });
      assert.deepEqual(xdrStub.args[0][0].callback, callbackStub);
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'v2', 'presence',
        'sub-key', 'subKey', 'channel', 'ch1', 'uuid', 'keychainUUID']);
    });
  });

  describe('#setState', () => {
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
      networking = new Networking({ config, keychain }, undefined, 'origin1.pubnub.com');
      callbackStub = sinon.stub();

      xdrStub = sinon.stub(networking, '_xdr');
      validationErrorStub = sinon.stub();
      networking._r.validationError = validationErrorStub;
    });

    it('errors out if subkey is not defined', () => {
      keychain.setSubscribeKey('');
      networking.setState('ch1', {}, callbackStub);
      assert.equal(validationErrorStub.args[0][0], 'Missing Subscribe Key');
    });

    it('uses auth-key from keychain if provided', () => {
      keychain.setAuthKey('myAuthKey');
      networking.setState('ch1', { state: { my: 'state' } }, callbackStub);
      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { state: '{\"my\":\"state\"}', auth: 'myAuthKey' });
    });

    it('uses keychain uuid', () => {
      networking.setState('ch1', { state: { my: 'state' } }, callbackStub);
      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { state: '{\"my\":\"state\"}' });
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'v2', 'presence',
        'sub-key', 'subKey', 'channel', 'ch1', 'uuid', 'keychainUUID', 'data']);
    });

    it('executs #prepareParamsMock to prepare params', () => {
      prepareParamsStub = sinon.stub(networking, 'prepareParams').returns({ base: 'params' });
      networking.setState('ch1', { arg: '10' }, callbackStub);
      assert.equal(prepareParamsStub.called, true);
      assert.deepEqual(prepareParamsStub.args[0][0], { arg: '10' });
    });

    it('passes arguments to the xdr module', () => {
      networking.setState('ch1', { state: { my: 'state' } }, callbackStub);

      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { state: '{\"my\":\"state\"}' });
      assert.deepEqual(xdrStub.args[0][0].callback, callbackStub);
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'v2', 'presence',
        'sub-key', 'subKey', 'channel', 'ch1', 'uuid', 'keychainUUID', 'data']);
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
      networking = new Networking({ config, keychain }, undefined, 'origin1.pubnub.com');
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
        'sub-key', 'subKey', 'channel', 'mychannel']);
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
        'sub-key', 'subKey', 'channel', 'm%24%24ych%24annel']);
    });

    it('passes arguments to the xdr module w/ channel groups', () => {
      networking.fetchHereNow(undefined, 'cg1,cg2,cg3', {}, callbackStub);

      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params', uuid: 'keychainUUID' });
      assert.deepEqual(xdrStub.args[0][0].callback, callbackStub);
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'v2', 'presence',
        'sub-key', 'subKey', 'channel', ',']);
    });

    it('passes arguments to the xdr module w/ undefined channel, channel groups', () => {
      networking.fetchHereNow(undefined, undefined, {}, callbackStub);

      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params', uuid: 'keychainUUID' });
      assert.deepEqual(xdrStub.args[0][0].callback, callbackStub);
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'v2', 'presence',
        'sub-key', 'subKey']);
    });
  });

  describe('#performAudit', () => {
    let networking;
    let validationErrorStub;
    let prepareParamsStub;
    let callbackStub;
    let crypto;
    let xdrStub;

    beforeEach(() => {
      config = new Config();
      keychain = new Keychain().setSubscribeKey('subKey').setPublishKey('pubKey').setSecretKey('secKey').setUUID('keychainUUID');
      crypto = new Crypto({ keychain });
      networking = new Networking({ config, keychain, crypto }, undefined, 'origin1.pubnub.com');
      callbackStub = sinon.stub();

      xdrStub = sinon.stub(networking, '_xdr');
      validationErrorStub = sinon.stub();
      prepareParamsStub = sinon.stub(networking, 'prepareParams').returns({ base: 'params' });
      networking._r.validationError = validationErrorStub;
    });

    it('errors out if subkey is not defined', () => {
      keychain.setSubscribeKey('');
      networking.performAudit('c1', {}, callbackStub);
      assert.equal(validationErrorStub.args[0][0], 'Missing Subscribe Key');
    });

    it('errors out if pubkey is not defined', () => {
      keychain.setPublishKey('');
      networking.performAudit('c1', {}, callbackStub);
      assert.equal(validationErrorStub.args[0][0], 'Missing Publish Key');
    });

    it('errors out if secret key is not defined', () => {
      keychain.setSecretKey('');
      networking.performAudit('c1', {}, callbackStub);
      assert.equal(validationErrorStub.args[0][0], 'Missing Secret Key');
    });

    it('executs #prepareParamsMock to prepare params', () => {
      networking.performAudit('c1', { a: 10 }, callbackStub);
      assert.equal(prepareParamsStub.called, true);
    });

    it('passes arguments to the xdr module', () => {
      networking.performAudit('c1', { a: 10 }, callbackStub);

      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params', signature: 'Pwob4DDSaP66Bsz8ruINBNRermV_dm-RLzqpqxhQ5Zo=' });
      assert.deepEqual(xdrStub.args[0][0].callback, callbackStub);
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'v1', 'auth',
        'audit', 'sub-key', 'subKey']);
    });
  });

  describe('#performGrant', () => {
    let networking;
    let validationErrorStub;
    let prepareParamsStub;
    let callbackStub;
    let crypto;
    let xdrStub;

    beforeEach(() => {
      config = new Config();
      keychain = new Keychain().setSubscribeKey('subKey').setPublishKey('pubKey').setSecretKey('secKey').setUUID('keychainUUID');
      crypto = new Crypto({ keychain });
      networking = new Networking({ config, keychain, crypto }, undefined, 'origin1.pubnub.com');
      callbackStub = sinon.stub();

      xdrStub = sinon.stub(networking, '_xdr');
      validationErrorStub = sinon.stub();
      prepareParamsStub = sinon.stub(networking, 'prepareParams').returns({ base: 'params' });
      networking._r.validationError = validationErrorStub;
    });

    it('errors out if subkey is not defined', () => {
      keychain.setSubscribeKey('');
      networking.performGrant('c1', {}, callbackStub);
      assert.equal(validationErrorStub.args[0][0], 'Missing Subscribe Key');
    });

    it('errors out if pubkey is not defined', () => {
      keychain.setPublishKey('');
      networking.performGrant('c1', {}, callbackStub);
      assert.equal(validationErrorStub.args[0][0], 'Missing Publish Key');
    });

    it('errors out if secret key is not defined', () => {
      keychain.setSecretKey('');
      networking.performGrant('c1', {}, callbackStub);
      assert.equal(validationErrorStub.args[0][0], 'Missing Secret Key');
    });

    it('executs #prepareParamsMock to prepare params', () => {
      networking.performGrant('c1', { a: 10 }, callbackStub);
      assert.equal(prepareParamsStub.called, true);
    });

    it('passes arguments to the xdr module', () => {
      networking.performGrant('c1', { a: 10 }, callbackStub);

      assert.equal(xdrStub.callCount, 1);
      assert.deepEqual(xdrStub.args[0][0].data, { base: 'params', signature: 'PG-rP_0cUUE6KYu8iAbshYqdOXxkgtcrBd1ogex-tMk=' });
      assert.deepEqual(xdrStub.args[0][0].callback, callbackStub);
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'v1', 'auth',
        'grant', 'sub-key', 'subKey']);
    });
  });

  describe('#provisionDeviceForPush', () => {
    let networking;
    let validationErrorStub;
    let prepareParamsStub;
    let callbackStub;
    let xdrStub;

    beforeEach(() => {
      config = new Config();
      keychain = new Keychain().setSubscribeKey('subKey').setPublishKey('pubKey').setUUID('keychainUUID');
      networking = new Networking({ config, keychain }, undefined, 'origin1.pubnub.com');
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

  describe('#_xdr', () => {
    let networking;
    let callbackStub;
    let xdrStub;

    beforeEach(() => {
      config = new Config();
      keychain = new Keychain().setSubscribeKey('subKey').setPublishKey('pubKey').setUUID('keychainUUID');
      networking = new Networking({ config, keychain }, undefined, 'origin1.pubnub.com');
      xdrStub = sinon.stub(networking, '_abstractedXDR');
      callbackStub = sinon.stub();
    });

    it('passes the correct params to the abstracted XDR', () => {
      networking._xdr({ data: { a: 10, b: 20 }, url: ['this', 'is', 'cool'], timeout: 1337, callback: callbackStub });
      assert.equal(xdrStub.args[0][0].url, 'this/is/cool');
      assert.deepEqual(xdrStub.args[0][0].qs, { a: 10, b: 20 });
      assert.deepEqual(xdrStub.args[0][0].method, 'GET');
      assert.equal(xdrStub.args[0][1], 1337);

      assert.deepEqual(xdrStub.args[0][2], callbackStub);
    });
  });

  describe('#_postXDR', () => {
    let networking;
    let callbackStub;
    let xdrStub;

    beforeEach(() => {
      config = new Config();
      keychain = new Keychain().setSubscribeKey('subKey').setPublishKey('pubKey').setUUID('keychainUUID');
      networking = new Networking({ config, keychain }, undefined, 'origin1.pubnub.com');
      xdrStub = sinon.stub(networking, '_abstractedXDR');
      callbackStub = sinon.stub();
    });

    it('passes the correct params to the abstracted XDR', () => {
      networking._postXDR({ data: { a: 10, b: 20 }, url: ['this', 'is', 'cool'], timeout: 1337, callback: callbackStub });
      assert.equal(xdrStub.args[0][0].url, 'this/is/cool');
      assert.deepEqual(xdrStub.args[0][0]._data, { a: 10, b: 20 });
      assert.deepEqual(xdrStub.args[0][0].method, 'POST');
      assert.equal(xdrStub.args[0][1], 1337);
      assert.deepEqual(xdrStub.args[0][2], callbackStub);
    });
  });

  describe('#_abstractedXDR', () => {
    let networking;
    let callbackStub;
    let stubbedAgent;

    let stubbedTimeout;
    let stubbedType;
    let stubbedEnd;

    beforeEach(() => {
      config = new Config();
      keychain = new Keychain().setSubscribeKey('subKey').setPublishKey('pubKey').setUUID('keychainUUID');
      networking = new Networking({ config, keychain }, undefined, 'origin1.pubnub.com');
      callbackStub = sinon.stub();

      stubbedAgent = {
        timeout: () => stubbedAgent,
        type: () => stubbedAgent,
        end: () => stubbedAgent
      };

      stubbedTimeout = sinon.spy(stubbedAgent, 'timeout');
      stubbedType = sinon.spy(stubbedAgent, 'type');
      stubbedEnd = sinon.stub(stubbedAgent, 'end');
    });

    it('sets type to json', () => {
      networking._abstractedXDR(stubbedAgent, 1337, callbackStub);
      assert.equal(stubbedType.args[0][0], 'json');
    });

    it('appends the correct timeout', () => {
      networking._abstractedXDR(stubbedAgent, 1337, callbackStub);
      assert.equal(stubbedTimeout.args[0][0], 1337);
    });

    it('appends the correct timeout from defaults', () => {
      config.transactionalRequestTimeout = 10;
      networking._abstractedXDR(stubbedAgent, null, callbackStub);
      assert.equal(stubbedTimeout.args[0][0], 10);
    });

    it('returns error to callback if error from superagent was pushed', () => {
      networking._abstractedXDR(stubbedAgent, null, callbackStub);
      stubbedEnd.args[0][0]('thisiserror', null);
      assert.deepEqual(callbackStub.args[0], ['thisiserror', null]);
    });

    it('returns success to callback if success from superagent was pushed', () => {
      networking._abstractedXDR(stubbedAgent, null, callbackStub);
      stubbedEnd.args[0][0](null, { text: '{"hi":"there"}' });
      assert.deepEqual(callbackStub.args[0], [null, { hi: 'there' }]);
    });

    it('returns error to callback if error from pubnub was pushed', () => {
      networking._abstractedXDR(stubbedAgent, null, callbackStub);
      stubbedEnd.args[0][0](null, { text: '{"error":"niceError"}' });
      assert.deepEqual(callbackStub.args[0], ['niceError', null]);
    });

    it('returns payload to callback if payload from pubnub was pushed', () => {
      networking._abstractedXDR(stubbedAgent, null, callbackStub);
      stubbedEnd.args[0][0](null, { text: '{"payload":"nicePayload"}' });
      assert.deepEqual(callbackStub.args[0], [null, 'nicePayload']);
    });
  });
});
