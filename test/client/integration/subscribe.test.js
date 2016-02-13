/* globals describe, beforeEach, PUBNUB, chai, it, before, _pubnub, variationRunner, get_random, _pubnub_subscribe */
/* globals _pubnub_init */
/* eslint no-unused-vars: 0 */
/* eslint camelcase: 0 */

var assert = chai.assert;

describe('#subscribe', function () {
  this.timeout(180000);

  var fileFixtures = {};
  var itFixtures = {};
  var messageString = 'Hi from Javascript';
  var message_jsono = { message: 'Hi Hi from Javascript' };
  var message_jsona = ['message', 'Hi Hi from javascript'];
  var message_number = 123456;

  before(function () {
    fileFixtures.publishKey = 'ds';
    fileFixtures.subscribeKey = 'ds';
  });

  beforeEach(function () {
    itFixtures.channel = 'javascript-test-channel-' + Math.floor((Math.random() * 10) + 1);
  });

  describe('should receive message when subscribed to wildcard, if message is published on a channel which matches wildcard, for ex. reveive on a.foo when subscribed to a.*', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub_init({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var random = get_random();
      var ch = 'channel-' + random;
      var chw = ch + '.*';
      var chwc = ch + '.a';

      _pubnub_subscribe(pubnub, {
        channel: chw,
        connect: function () {
          setTimeout(function () {
            pubnub.publish({
              channel: chwc,
              message: 'message' + chwc,
              callback: function () {
                assert.ok(true, 'message published');
              },
              error: function () {
                assert.ok(false, 'error occurred in publish');
              }
            });
          }, 5000);
        },
        callback: function (response) {
          assert.deepEqual(response, 'message' + chwc, 'message received 2');
          pubnub.unsubscribe({ channel: chwc });
          done();
        },
        error: function () {
          assert.ok(false);
          pubnub.unsubscribe({ channel: chwc });
        }
      });
    };

    variationRunner(testFun);
  });

  describe('should receive message when subscribed to wildcard, if message is published on a channel which matches wildcard when ENCRYPTION is enabled, for ex. reveive on a.foo when subscribed to a.*', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub_init({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey,
        cipher_key: 'enigma'
      }, config);

      var random = get_random();
      var ch = 'channel-' + random;
      var chw = ch + '.*';
      var chwc = ch + '.a';

      _pubnub_subscribe(pubnub, {
        channel: chw,
        connect: function () {
          setTimeout(function () {
            pubnub.publish({
              channel: chwc,
              message: 'message' + chwc,
              callback: function () {
                assert.ok(true, 'message published');
              },
              error: function () {
                assert.ok(false, 'error occurred in publish');
              }
            });
          }, 5000);
        },
        callback: function (response) {
          assert.deepEqual(response, 'message' + chwc, 'message received 2');
          pubnub.unsubscribe({ channel: chwc });
          done();
        },
        error: function () {
          assert.ok(false);
          pubnub.unsubscribe({ channel: chwc });
        }
      });
    };

    variationRunner(testFun);
  });

  describe('should receive emoji (unicode) message when subscribed to wildcard, if message is published on a channel which matches wildcard, for ex. reveive on a.foo when subscribed to a.*', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub_init({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var random = get_random();
      var ch = 'channel-' + random;
      var chw = ch + '.*';
      var chwc = ch + '.a';

      var message = '😀';

      _pubnub_subscribe(pubnub, {
        channel: chw,
        connect: function () {
          setTimeout(function () {
            pubnub.publish({
              channel: chwc,
              message: message,
              callback: function () {
                assert.ok(true, 'message published');
              },
              error: function () {
                assert.ok(false, 'error occurred in publish');
              }
            });
          }, 5000);
        },
        callback: function (response) {
          assert.deepEqual(response, message, 'message received 2');
          pubnub.unsubscribe({ channel: chwc });
          done();
        },
        error: function () {
          assert.ok(false);
          pubnub.unsubscribe({ channel: chwc });
        }
      });
    };

    variationRunner(testFun);
  });

  describe('should receive emoji (unicode) message when subscribed to wildcard, if message is published on a channel which matches wildcard when ENCRYPTION is enabled, for ex. reveive on a.foo when subscribed to a.*', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub_init({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey,
        cipher_key: 'enigma'
      }, config);

      var random = get_random();
      var ch = 'channel-' + random;
      var chw = ch + '.*';
      var chwc = ch + '.a';

      var message = '😀';

      _pubnub_subscribe(pubnub, {
        channel: chw,
        connect: function () {
          setTimeout(function () {
            pubnub.publish({
              channel: chwc,
              message: message,
              callback: function () {
                assert.ok(true, 'message published');
              },
              error: function () {
                assert.ok(false, 'error occurred in publish');
              }
            });
          }, 5000);
        },
        callback: function (response) {
          assert.deepEqual(response, message, 'message received 2');
          pubnub.unsubscribe({ channel: chwc });
          done();
        },
        error: function () {
          assert.ok(false);
          pubnub.unsubscribe({ channel: chwc });
        }
      });
    };

    variationRunner(testFun);
  });

  describe('should be able to handle wildcard, channel group and channel together', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub_init({
        publish_key: 'pub-c-8beb3658-0dfd-4032-8f4b-9c6b9ca4d803',
        subscribe_key: 'sub-c-82ab2196-b64f-11e5-8622-0619f8945a4f',
        cipher_key: 'enigma'
      }, config);

      var random = get_random();
      var ch = 'channel-' + random;
      var chg = 'channel-group-' + random;
      var chgc = 'channel-group-channel' + random;
      var chw = ch + '.*';
      var chwc = ch + '.a';

      pubnub.channel_group_add_channel({
        channel_group: chg,
        channels: chgc,
        callback: function () {
          pubnub.channel_group_list_channels({
            channel_group: chg,
            callback: function () {
              _pubnub_subscribe(pubnub, {
                channel: ch,
                connect: function () {
                  _pubnub_subscribe(pubnub, {
                    channel: chw,
                    connect: function () {
                      _pubnub_subscribe(pubnub, {
                        channel_group: chg,
                        connect: function () {
                          setTimeout(function () {
                            pubnub.publish({
                              channel: ch,
                              message: 'message' + ch,
                              callback: function () {
                                assert.ok(true, 'message published');
                                pubnub.publish({
                                  channel: chwc,
                                  message: 'message' + chwc,
                                  callback: function () {
                                    assert.ok(true, 'message published');
                                    pubnub.publish({
                                      channel: chgc,
                                      message: 'message' + chgc,
                                      callback: function () {
                                        assert.ok(true, 'message published');
                                      },
                                      error: function () {
                                        assert.ok(false, 'error occurred in publish');
                                        done();
                                      }
                                    });
                                  },
                                  error: function () {
                                    assert.ok(false, 'error occurred in publish');
                                    done();
                                  }
                                });
                              },
                              error: function () {
                                assert.ok(false, 'error occurred in publish');
                                done();
                              }
                            });
                          }, 5000);
                        },
                        callback: function (response) {
                          assert.deepEqual(response, 'message' + chgc, 'message received 1');
                          // pubnub.unsubscribe({ channel_group: chg });
                        },
                        error: function () {
                          assert.ok(false);
                          done();
                          // pubnub.unsubscribe({ channel: chgc });
                        }
                      });
                    },
                    callback: function (response) {
                      assert.deepEqual(response, 'message' + chwc, 'message received 2');
                      // pubnub.unsubscribe({ channel: chw });
                    },
                    error: function () {
                      assert.ok(false);
                      done();
                      // pubnub.unsubscribe({ channel: chw });
                    }
                  });
                },
                callback: function (response) {
                  assert.deepEqual(response, 'message' + ch, 'message received 3');
                  // pubnub.unsubscribe({ channel: ch });
                  done();
                },
                error: function () {
                  assert.ok(false);
                  // pubnub.unsubscribe({ channel: ch });
                }
              });
            },
            error: function () {
              assert.ok(false, 'error occurred');
            }
          });
        },
        error: function () {
          assert.ok(false, 'error occurred in adding channel to group');
        }

      });
    };

    variationRunner(testFun);
  });
});
