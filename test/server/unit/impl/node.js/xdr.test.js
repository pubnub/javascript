/* global describe, beforeEach, afterEach, it */
/* eslint no-console: 0 */

var http = require('http');
var https = require('https');
var sinon = require('sinon');
var assert = require('assert');

var XDR = require('../../../../../node.js/lib/xdr');

describe('#xdr', function () {
  var httpMock;
  var httpsMock;

  beforeEach(function () {
    httpMock = sinon.stub(http, 'request', function () {});
    httpsMock = sinon.stub(https, 'request', function () {});
  });

  afterEach(function () {
    httpMock.restore();
    httpsMock.restore();
  });

  describe('keepAlive', function () {
    describe('on HTTP', function () {
      it('keepAlive agents are enabled when the keepAlive is passed as true', function () {
        var xdrInstance = XDR.createInstance(null, true);
        var xdrSetup = { data: {}, url: ['http://pubsub.pubnub.com', 'time', 0] };

        xdrInstance.request(xdrSetup);

        assert.equal(httpMock.args[0][0].keepAlive, true);
        assert.equal(httpMock.args[0][0].agent.keepAlive, true);
      });

      it('keepAlive agents are enabled when the keepAlive is undefined', function () {
        var xdrInstance = XDR.createInstance(null, undefined);
        var xdrSetup = { data: {}, url: ['http://pubsub.pubnub.com', 'time', 0] };

        xdrInstance.request(xdrSetup);

        assert.equal(httpMock.args[0][0].keepAlive, true);
        assert.equal(httpMock.args[0][0].agent.keepAlive, true);
      });

      it('keepAlive agents are enabled when the keepAlive is null', function () {
        var xdrInstance = XDR.createInstance(null, null);
        var xdrSetup = { data: {}, url: ['http://pubsub.pubnub.com', 'time', 0] };

        xdrInstance.request(xdrSetup);

        assert.equal(httpMock.args[0][0].keepAlive, true);
        assert.equal(httpMock.args[0][0].agent.keepAlive, true);
      });

      it('keepAlive agents are disabled when the keepAlive false', function () {
        var xdrInstance = XDR.createInstance(null, false);
        var xdrSetup = { data: {}, url: ['http://pubsub.pubnub.com', 'time', 0] };

        xdrInstance.request(xdrSetup);

        assert.equal(httpMock.args[0][0].keepAlive, false);
        assert.equal(httpMock.args[0][0].agent, undefined);
      });
    });

    describe('on HTTPS', function () {
      it('keepAlive agents are enabled when the keepAlive is passed as true', function () {
        var xdrInstance = XDR.createInstance(null, true);
        var xdrSetup = { data: {}, ssl: true, url: ['http://pubsub.pubnub.com', 'time', 0] };

        xdrInstance.request(xdrSetup);

        assert.equal(httpsMock.args[0][0].keepAlive, true);
        assert.equal(httpsMock.args[0][0].agent.keepAlive, true);
      });

      it('keepAlive agents are enabled when the keepAlive is undefined', function () {
        var xdrInstance = XDR.createInstance(null, undefined);
        var xdrSetup = { data: {}, ssl: true, url: ['http://pubsub.pubnub.com', 'time', 0] };

        xdrInstance.request(xdrSetup);

        assert.equal(httpsMock.args[0][0].keepAlive, true);
        assert.equal(httpsMock.args[0][0].agent.keepAlive, true);
      });

      it('keepAlive agents are enabled when the keepAlive is null', function () {
        var xdrInstance = XDR.createInstance(null, null);
        var xdrSetup = { data: {}, ssl: true, url: ['http://pubsub.pubnub.com', 'time', 0] };

        xdrInstance.request(xdrSetup);

        assert.equal(httpsMock.args[0][0].keepAlive, true);
        assert.equal(httpsMock.args[0][0].agent.keepAlive, true);
      });

      it('keepAlive agents are disabled when the keepAlive false', function () {
        var xdrInstance = XDR.createInstance(null, false);
        var xdrSetup = { data: {}, ssl: true, url: ['http://pubsub.pubnub.com', 'time', 0] };

        xdrInstance.request(xdrSetup);

        assert.equal(httpsMock.args[0][0].keepAlive, false);
        assert.equal(httpsMock.args[0][0].agent, undefined);
      });
    });
  });

  describe('proxy', function () {
    it('does not use proxy if proxy is passed as null', function () {
      var xdrInstance = XDR.createInstance(null, false);
      var xdrSetup = { data: {}, url: ['http://pubsub.pubnub.com', 'time', 0] };

      xdrInstance.request(xdrSetup);

      assert.deepEqual(httpMock.args[0][0], {
        hostname: 'pubsub.pubnub.com',
        port: 80,
        path: '/time/0?',
        headers: null,
        method: 'GET',
        keepAlive: false,
        body: ''
      });
    });

    it('support initialization with proxy components', function () {
      var proxy = { hostname: 'moose.com', port: 1337 };
      var xdrInstance = XDR.createInstance(proxy, false);
      var xdrSetup = { data: {}, url: ['http://pubsub.pubnub.com', 'time', 0] };

      xdrInstance.request(xdrSetup);

      assert.deepEqual(httpMock.args[0][0], {
        hostname: 'moose.com',
        port: 1337,
        path: 'http://pubsub.pubnub.com/time/0?',
        headers: { Host: 'pubsub.pubnub.com' },
        method: 'GET',
        keepAlive: false,
        body: ''
      });
    });

    it('support initialization with proxy components over https', function () {
      var proxy = { hostname: 'moose.com', port: 1337 };
      var xdrInstance = XDR.createInstance(proxy, false);
      var xdrSetup = { data: {}, ssl: true, url: ['https://pubsub.pubnub.com', 'time', 0] };

      xdrInstance.request(xdrSetup);

      assert.deepEqual(httpsMock.args[0][0], {
        hostname: 'moose.com',
        port: 1337,
        path: 'http://pubsub.pubnub.com/time/0?',
        headers: { Host: 'pubsub.pubnub.com' },
        method: 'GET',
        keepAlive: false,
        body: ''
      });
    });

    it('support additional headers', function () {
      var proxy = { hostname: 'moose.com', port: 1337, headers: { h1: 'header1', h2: 'header2' } };
      var xdrInstance = XDR.createInstance(proxy, false);
      var xdrSetup = { data: {}, ssl: true, url: ['https://pubsub.pubnub.com', 'time', 0] };

      xdrInstance.request(xdrSetup);

      assert.deepEqual(httpsMock.args[0][0], {
        hostname: 'moose.com',
        port: 1337,
        path: 'http://pubsub.pubnub.com/time/0?',
        headers: { Host: 'pubsub.pubnub.com', h1: 'header1', h2: 'header2' },
        method: 'GET',
        keepAlive: false,
        body: ''
      });
    });
  });
});
