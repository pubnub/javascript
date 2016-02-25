/* global describe, beforeEach, it */
/* eslint no-console: 0 */

var Networking = require('../../../../../core/lib/components/networking');
var assert = require('assert');

describe('#components/networking', function () {
  it('creates a class with publish and subscribe keys', () => {
    var networking = new Networking('subKey', 'pubKey');

    assert.equal(networking.getPublishKey(), 'pubKey');
    assert.equal(networking.getSubscribeKey(), 'subKey');
  });
});
