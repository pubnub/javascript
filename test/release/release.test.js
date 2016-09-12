/* global describe, it, __dirname */

var assert = require('assert');
var fs = require('fs');
var path = require('path');

var packageJSON = require('../../package.json');
var bowerJSON = require('../../bower.json');
var versionFile = fs.readFileSync(path.resolve(__dirname, '../../VERSION'), 'UTF-8').trim();
var readMe = fs.readFileSync(path.resolve(__dirname, '../..//README.md'), 'UTF-8');

describe('release should be consistent', function () {
  it('with a matching bower and npm module', function () {
    assert.equal(packageJSON.version, bowerJSON.version);
  });

  it('with have a matching VERSION', function () {
    assert.equal(versionFile, bowerJSON.version);
  });

  it('with bower valid entry point', function () {
    assert.equal(bowerJSON.main, 'web/dist/pubnub.min.js');
  });

  it('with npm valid entry point', function () {
    assert.equal(packageJSON.main, './node.js/pubnub.js');
  });

  it('with updated readme', function () {
    assert(readMe.indexOf('https://cdn.pubnub.com/pubnub-' + versionFile + '.js') > 1);
    assert(readMe.indexOf('https://cdn.pubnub.com/pubnub-' + versionFile + '.min.js') > 1);
  });
});
