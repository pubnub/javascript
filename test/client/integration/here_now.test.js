/* globals describe, beforeEach, PUBNUB, chai, it, before, _pubnub, variationRunner, _pubnub_subscribe, in_list */
/* eslint no-unused-vars: 0 */
/* eslint camelcase: 0 */

var assert = chai.assert;

describe('#here_now', function () {
  this.timeout(180000);

  var fileFixtures = {};
  var itFixtures = {};
  var message_string = 'Hi from Javascript';
  var message_jsono = { message: 'Hi Hi from Javascript' };
  var message_jsona = ['message', 'Hi Hi from javascript'];

  before(function () {
    fileFixtures.publishKey = 'ds';
    fileFixtures.subscribeKey = 'ds';
  });

  beforeEach(function () {
    itFixtures.channel = 'javascript-test-channel-' + Math.floor((Math.random() * 10) + 1);
  });

  describe('should show occupancy 1 when 1 user subscribed to channel', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var ch = itFixtures.channel + '-' + 'here-now' + Math.random();
      _pubnub_subscribe(pubnub, {
        channel: ch,
        connect: function () {
          setTimeout(function () {
            pubnub.here_now({
              channel: ch, callback: function (data) {
                assert.equal(data.occupancy, 1);
                pubnub.unsubscribe({ channel: ch });
                done();
              }
            });
          }, 10000);
          pubnub.publish({
            channel: ch, message: message_jsona,
            callback: function (response) {
              assert.equal(response[0], 1);
            }
          });
        },
        callback: function (response) {
          assert.deepEqual(response, message_jsona);
        }
      }, config);
    };

    variationRunner(testFun);
  });

  describe.skip('should show occupancy 1 when 1 user subscribed to channel (DEBUG TEST)', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var ch = itFixtures.channel + '-' + 'here-now' + Math.random();
      _pubnub_subscribe(pubnub, {
        channel: ch,
        connect: function () {
          setTimeout(function () {
            pubnub.here_now({
              channel: ch, callback: function (data) {
                assert.equal(data.occupancy, 1);
              }
            });
          }, 15000);

          setTimeout(function () {
            pubnub.here_now({
              channel: ch, callback: function (data) {
                assert.equal(data.occupancy, 1);
              }
            });
          }, 30000);

          setTimeout(function () {
            pubnub.here_now({
              channel: ch, callback: function (data) {
                assert.equal(data.occupancy, 1);
                pubnub.unsubscribe({ channel: ch });
                done();
              }
            });
          }, 45000);

          pubnub.publish({
            channel: ch, message: message_jsona,
            callback: function (response) {
              assert.equal(response[0], 1);
            }
          });
        },
        callback: function (response) {
          assert.deepEqual(response, message_jsona);
        }
      }, config);
    };

    variationRunner(testFun);
  });

  it('should return channel channel list with occupancy details and uuids for a subscribe key', function (done) {
    var uuid = Date.now().toString();
    var uuid1 = uuid + '-1';
    var uuid2 = uuid + '-2';
    var uuid3 = uuid + '-3';
    var ch = itFixtures.channel + '-' + 'here-now-' + Date.now();
    var ch1 = ch + '-1';
    var ch2 = ch + '-2';
    var ch3 = ch + '-3';

    var pubnub_pres = PUBNUB({
      origin: 'pubsub.pubnub.com',
      publish_key: fileFixtures.publishKey,
      subscribe_key: fileFixtures.subscribeKey,
      uuid: uuid
    });
    var pubnub_pres_1 = PUBNUB({
      origin: 'pubsub.pubnub.com',
      publish_key: fileFixtures.publishKey,
      subscribe_key: fileFixtures.subscribeKey,
      uuid: uuid1
    });
    var pubnub_pres_2 = PUBNUB({
      origin: 'pubsub.pubnub.com',
      publish_key: fileFixtures.publishKey,
      subscribe_key: fileFixtures.subscribeKey,
      uuid: uuid2
    });
    var pubnub_pres_3 = PUBNUB({
      origin: 'pubsub.pubnub.com',
      publish_key: fileFixtures.publishKey,
      subscribe_key: fileFixtures.subscribeKey,
      uuid: uuid3
    });

    pubnub_pres.subscribe({
      channel: ch,
      connect: function () {
        pubnub_pres_1.subscribe({
          channel: ch1,
          connect: function () {
            pubnub_pres_2.subscribe({
              channel: ch2,
              connect: function () {
                pubnub_pres_3.subscribe({
                  channel: ch3,
                  connect: function () {
                    setTimeout(function () {
                      pubnub_pres.here_now({
                        callback: function (response) {
                          assert.ok(response.channels[ch], 'subscribed channel should be present in payload');
                          assert.ok(response.channels[ch1], 'subscribed 1 channel should be present in payload');
                          assert.ok(response.channels[ch2], 'subscribed 2 channel should be present in payload');
                          assert.ok(response.channels[ch3], 'subscribed 3 channel should be present in payload');
                          assert.ok(in_list(response.channels[ch].uuids, uuid), 'uuid should be there in the uuids list');
                          assert.ok(in_list(response.channels[ch1].uuids, uuid1), 'uuid 1 should be there in the uuids list');
                          assert.ok(in_list(response.channels[ch2].uuids, uuid2), 'uuid 2 should be there in the uuids list');
                          assert.ok(in_list(response.channels[ch3].uuids, uuid3), 'uuid 3 should be there in the uuids list');
                          assert.deepEqual(response.channels[ch].occupancy, 1);
                          assert.deepEqual(response.channels[ch1].occupancy, 1);
                          assert.deepEqual(response.channels[ch2].occupancy, 1);
                          assert.deepEqual(response.channels[ch3].occupancy, 1);
                          pubnub_pres.unsubscribe({ channel: ch });
                          pubnub_pres_1.unsubscribe({ channel: ch1 });
                          pubnub_pres_2.unsubscribe({ channel: ch2 });
                          pubnub_pres_3.unsubscribe({ channel: ch3 });
                          done();
                        },
                        error: function () {
                          assert.ok(false, 'Error occurred in subscribe 3');
                          done();
                        }
                      });
                    }, 3000);
                  },
                  callback: function (response) {},
                  error: function () {
                    assert.ok(false, 'Error occurred in subscribe 3');
                    done();
                  }
                });
              },
              callback: function () {},
              error: function () {
                assert.ok(false, 'Error occurred in subscribe 2');
                done();
              }
            });
          },
          callback: function (response) {},
          error: function () {
            assert.ok(false, 'Error occurred in subscribe 1');
            done();
          }
        });
      },
      callback: function (response) {},
      error: function () {
        assert.ok(false, 'Error occurred in subscribe');
        done();
      }
    });
  });
});
