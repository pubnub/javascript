/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

let Networking = require('../../../../../core/lib/components/networking');

const utils = require('../../../../../core/lib/utils');
const assert = require('assert');
const sinon = require('sinon');


describe('#components/networking', () => {
  it('creates a class with publish and subscribe keys', () => {
    var networking = new Networking(null);

    networking.setSubscribeKey('subKey');
    networking.setPublishKey('pubKey');

    assert.equal(networking.getPublishKey(), 'pubKey');
    assert.equal(networking.getSubscribeKey(), 'subKey');
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
      var networking = new Networking(null);

      let newDomain = networking.nextOrigin('http://custom.url.com');
      assert.equal(newDomain, 'http://custom.url.com');
    });

    it('applies the next subdomain if default url is used', () => {
      var networking = new Networking(null);

      let newDomain = networking.nextOrigin('http://pubsub.pubnub.com');
      assert.equal(newDomain, 'http://ps17.pubnub.com');
    });

    // assuming MAX=20 inside the configurations, this test is not isolated.
    it('applies the next subdomain if default url is used and resets over', () => {
      var networking = new Networking(null);

      let newDomain = networking.nextOrigin('http://pubsub.pubnub.com');
      assert.equal(newDomain, 'http://ps17.pubnub.com');
      newDomain = networking.nextOrigin('http://pubsub.pubnub.com');
      assert.equal(newDomain, 'http://ps18.pubnub.com');
      newDomain = networking.nextOrigin('http://pubsub.pubnub.com');
      assert.equal(newDomain, 'http://ps19.pubnub.com');
      newDomain = networking.nextOrigin('http://pubsub.pubnub.com');
      assert.equal(newDomain, 'http://ps1.pubnub.com');
      newDomain = networking.nextOrigin('http://pubsub.pubnub.com');
      assert.equal(newDomain, 'http://ps2.pubnub.com');
      newDomain = networking.nextOrigin('http://pubsub.pubnub.com');
      assert.equal(newDomain, 'http://ps3.pubnub.com');
    });

    it('supports failover', () => {
      var networking = new Networking(null);
      let newDomain = networking.nextOrigin('http://pubsub.pubnub.com', true);
      assert.equal(newDomain, 'http://ps5f0651fc.pubnub.com');

      utils.generateUUID.restore();

      sinon.stub(utils, 'generateUUID', function () {
        return '5f1z51fc-5b92-4a3b-96ca-08eee41508bd';
      });

      newDomain = networking.nextOrigin('http://pubsub.pubnub.com', true);
      assert.equal(newDomain, 'http://ps5f1z51fc.pubnub.com');
    });
  });

  describe('#fetchTime', () => {
    it('passes arguments to the xdr module', () => {
      let xdrStub = sinon.stub();
      let successStub = sinon.stub();
      let failStub = sinon.stub();
      let callbackStub = sinon.stub();
      let data = { my: 'object' };
      var networkingComponent = new Networking(xdrStub);

      networkingComponent.fetchTime('origin1.pubnub.com', '0', {
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
      assert.deepEqual(xdrStub.args[0][0].url, ['origin1.pubnub.com', 'time', 0]);
    });
  });

  describe('#fetchHistory', () => {
    it('passes arguments to the xdr module', () => {
      let xdrStub = sinon.stub();
      let successStub = sinon.stub();
      let failStub = sinon.stub();
      let callbackStub = sinon.stub();
      let data = { my: 'object' };
      var networkingComponent = new Networking(xdrStub);

      networkingComponent.setSubscribeKey('subKey');
      networkingComponent.setPublishKey('pubKey');

      networkingComponent.fetchHistory('origin1.pubnub.com', 'mychannel', {
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
      assert.deepEqual(xdrStub.args[0][0].url, ['origin1.pubnub.com', 'v2', 'history',
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
      var networkingComponent = new Networking(xdrStub);

      networkingComponent.setSubscribeKey('subKey');
      networkingComponent.setPublishKey('pubKey');

      networkingComponent.fetchReplay('origin1.pubnub.com', 'src', 'dist', {
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
      assert.deepEqual(xdrStub.args[0][0].url, ['origin1.pubnub.com', 'v1', 'replay',
        'pubKey', 'subKey', 'src', 'dist']);
    });
  });
});
