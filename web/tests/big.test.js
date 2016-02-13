/* globals describe, beforeEach, PUBNUB, chai, it, before */

var assert = chai.assert;

describe('front-end test', function () {
  this.timeout(180000);

  var fileFixtures = {};
  var itFixtures = {};
  var message_string = 'Hi from Javascript';
  var message_jsono = {message: 'Hi Hi from Javascript'};
  var message_jsona = ['message', 'Hi Hi from javascript'];

  before(function () {
    fileFixtures.publishKey = 'ds';
    fileFixtures.subscribeKey = 'ds';
  });

  beforeEach(function () {
    itFixtures.channel = 'javascript-test-channel-' + Math.floor((Math.random() * 10) + 1);
  });
});
