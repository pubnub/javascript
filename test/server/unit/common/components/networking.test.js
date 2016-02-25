/* global describe, beforeEach, it */
/* eslint no-console: 0 */

var Networking = require('../../../../../core/lib/components/networking');
const assert = require('assert');
const sinon = require('sinon');


describe('#components/networking', () => {
  it('creates a class with publish and subscribe keys', () => {
    var networking = new Networking(null, 'subKey', 'pubKey');

    assert.equal(networking.getPublishKey(), 'pubKey');
    assert.equal(networking.getSubscribeKey(), 'subKey');
  });

  describe('#fetchTime', () => {
    it('passes arguments to the xdr module', () => {
      let xdrStub = sinon.stub();
      let successStub = sinon.stub();
      let failStub = sinon.stub();
      let callbackStub = sinon.stub();
      let data = { my: 'object' };
      var networkingComponent = new Networking(xdrStub, 'subKey', 'pubKey');

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
      var networkingComponent = new Networking(xdrStub, 'subKey', 'pubKey');

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
      var networkingComponent = new Networking(xdrStub, 'subKey', 'pubKey');

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
