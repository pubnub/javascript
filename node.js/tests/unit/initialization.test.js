/* global describe, beforeEach, it */
/* eslint no-console: 0 */

var pubnub = require('../../pubnub.js');
var assert = require('assert');


describe('PubNub Initalization', function () {
  it('should contain the cryptography functions', function () {
    assert(pubnub.crypto_obj.encrypt);
    assert(pubnub.crypto_obj.decrypt);
  });

  it('should contain the initialization functions', function () {
    assert(pubnub.init);
    assert(pubnub.secure);
  });

  it('should contain the cryptography functions inside the instance', function () {
    var pubnubInstance = pubnub.init({
      publish_key: 'abc',
      subscribe_key: 'abc',
      ssl: true,
      origin: 'ps10.pubnub.com',
      uuid: 'abc'
    });

    assert(pubnubInstance.crypto_obj.encrypt);
    assert(pubnubInstance.crypto_obj.decrypt);
  });

  it('should return the version from the package.json', function () {
    var pubnubInstance = pubnub.init({
      publish_key: 'abc',
      subscribe_key: 'abc',
      ssl: true,
      origin: 'ps10.pubnub.com',
      uuid: 'abc'
    });

    assert(pubnubInstance.get_version(), require("../../../package.json").version);
  });
});
