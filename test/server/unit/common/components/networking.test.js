/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

import Networking from '../../../../../core/src/components/networking';

const utils = require('../../../../../core/src/utils');
const assert = require('assert');
const sinon = require('sinon');


describe('#components/networking', () => {
  it('creates a class with publish and subscribe keys', () => {
    var networking = new Networking(null);

    networking.setSubscribeKey('subKey');
    networking.setPublishKey('pubKey');

    assert.equal(networking.getPublishKey(), 'pubKey');
    assert.equal(networking.getSubscribeKey(), 'subKey');

    assert.equal(networking.getOrigin(), 'http://pubsub.pubnub.com');
  });

  it('creates a class with enabled SSL FQDN', () => {
    var networking = new Networking(null, true);
    assert.equal(networking.getOrigin(), 'https://pubsub.pubnub.com');
  });

  it('creates a class with disabled SSL FQDN', () => {
    var networking = new Networking(null, false);
    assert.equal(networking.getOrigin(), 'http://pubsub.pubnub.com');
  });

  it('creates a class with enabled SSL and custom domain', () => {
    var networking = new Networking(null, true, 'custom.domain.com');
    assert.equal(networking.getOrigin(), 'https://custom.domain.com');
  });

  it('creates a class with disabled SSL FQDN and custom domain', () => {
    var networking = new Networking(null, false, 'custom.domain.com');
    assert.equal(networking.getOrigin(), 'http://custom.domain.com');
  });

  describe('#nextOrigin', () => {
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
      var networking = new Networking(null, null, 'custom.url.com');

      let newDomain = networking.nextOrigin(false);
      assert.equal(newDomain, 'http://custom.url.com');
    });

    it('applies the next subdomain if default url is used', () => {
      var networking = new Networking(null, null, 'pubsub.pubnub.com');

      let newDomain = networking.nextOrigin(false);
      assert.equal(newDomain, 'http://ps19.pubnub.com');
    });

    // assuming MAX=20 inside the configurations, this test is not isolated.
    it('applies the next subdomain if default url is used and resets over', () => {
      var networking = new Networking(null, null, 'pubsub.pubnub.com');

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
      var networking = new Networking(null, null, 'pubsub.pubnub.com');
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
      let networking = new Networking(null, null, null);

      sinon.stub(networking, 'nextOrigin', function () {
        return 'sample-url';
      });

      let newOrigin = networking.shiftStandardOrigin();
      assert.equal(newOrigin, 'sample-url');
      assert.equal(networking.getStandardOrigin(), 'sample-url');

      networking.nextOrigin.restore();
    });
  });

  describe('#shiftSubscribeOrigin', () => {
    it('calls the #nextOrigin, updates the local variable and returns it', () => {
      let networking = new Networking(null);

      sinon.stub(networking, 'nextOrigin', function () {
        return 'sample-url';
      });

      let newOrigin = networking.shiftSubscribeOrigin();
      assert.equal(newOrigin, 'sample-url');
      assert.equal(networking.shiftSubscribeOrigin(), 'sample-url');

      networking.nextOrigin.restore();
    });
  });

  describe('#fetchTime', () => {
    it('passes arguments to the xdr module', () => {
      let xdrStub = sinon.stub();
      let successStub = sinon.stub();
      let failStub = sinon.stub();
      let callbackStub = sinon.stub();
      let data = { my: 'object' };
      let networkingComponent = new Networking(xdrStub, null, 'origin1.pubnub.com');

      networkingComponent.fetchTime('0', {
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
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'time', 0]);
    });
  });

  describe('#fetchHistory', () => {
    it('passes arguments to the xdr module', () => {
      let xdrStub = sinon.stub();
      let successStub = sinon.stub();
      let failStub = sinon.stub();
      let callbackStub = sinon.stub();
      let data = { my: 'object' };
      let networkingComponent = new Networking(xdrStub, null, 'origin1.pubnub.com');

      networkingComponent.setSubscribeKey('subKey');
      networkingComponent.setPublishKey('pubKey');

      networkingComponent.fetchHistory('mychannel', {
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
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'v2', 'history',
        'sub-key', 'subKey', 'channel', 'mychannel']);
    });
  });

  describe('#fetchReplay', () => {
    it('passes arguments to the xdr module', () => {
      let xdrStub = sinon.stub();
      let successStub = sinon.stub();
      let failStub = sinon.stub();
      let callbackStub = sinon.stub();
      let data = { my: 'object' };
      let networkingComponent = new Networking(xdrStub, null, 'origin1.pubnub.com');

      networkingComponent.setSubscribeKey('subKey');
      networkingComponent.setPublishKey('pubKey');

      networkingComponent.fetchReplay('src', 'dist', {
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
      assert.deepEqual(xdrStub.args[0][0].url, ['http://origin1.pubnub.com', 'v1', 'replay',
        'pubKey', 'subKey', 'src', 'dist']);
    });
  });
});
